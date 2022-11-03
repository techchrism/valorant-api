import { EventEmitter as EE } from 'ee-ts'
import RequestMaker, {RequestMakerEvents, StatusChangeSource} from './RequestMaker'
import {CloseEvent, ErrorEvent, MessageEvent, WebSocket} from 'isomorphic-ws'

/**
 * Utility method to adapt a websocket connection into a promise
 * Resolves upon open connection, rejects upon error or signal abort
 * @param url The url to connect to
 * @param modifyPending Modify a pending websocket before a confirmed connection
 * @param signal Optional abort signal
 */
async function tryConnectWebsocket(url: string, modifyPending?: (ws: WebSocket) => void, signal?: AbortSignal): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
        if(signal !== undefined && signal.aborted) {
            reject('Aborted')
            return
        }
        const ws = new WebSocket(url)

        function removeEvents() {
            ws.removeEventListener('error', errorHandler)
            ws.removeEventListener('open', openHandler)
            signal?.removeEventListener('abort', abortHandler)
        }

        function errorHandler(event: ErrorEvent) {
            removeEvents()
            reject(event)
        }

        function openHandler() {
            removeEvents()
            resolve(ws)
        }

        function abortHandler() {
            removeEvents()
            ws.close()
            reject('Aborted')
        }

        ws.addEventListener('error', errorHandler)
        ws.addEventListener('open', openHandler)
        if(modifyPending !== undefined) {
            modifyPending(ws)
        }
        signal?.addEventListener('abort', abortHandler)
    })
}

export interface BridgedRequestMakerEvents extends RequestMakerEvents {
    /**
     * Emitted when the bridge ready state changes
     * @param ready Whether the bridge is ready
     */
    bridgeStatusChange(ready: boolean): void

    /**
     * Emitted when the bridge notifies the application that it is not currently whitelisted
     */
    notWhitelisted(): void
}

export interface StatusResponse {
    lockfileReady: boolean
    logSize: Number
    source: StatusChangeSource
}

export function instanceOfStatusResponse(object: any): object is StatusResponse {
    return ('lockfileReady' in object && 'logSize' in object)
}

/**
 * Request maker that bridges requests to a remote server
 * The valorant-api-bridge flow is as follows:
 *  - First connect to the root websocket and check if the application is whitelisted
 *  - If the application is not whitelisted, a request must be made to the bridge to whitelist the application
 *  - Once the application is whitelisted, the status websocket is opened
 *  - When the status websocket is open, the root websocket is closed
 *  - The status websocket informs the application when the lockfile is ready / not ready
 */
export class BridgedRequestMaker extends EE<BridgedRequestMakerEvents> implements RequestMaker<BridgedRequestMakerEvents> {
    private _bridgeWebsocket?: WebSocket
    private _statusWebsocket?: WebSocket
    private _logWebsocket?: WebSocket
    private _whitelisted: boolean = false
    private _localReady: boolean = false

    private _bridgeCloseListener?: (event: CloseEvent) => void
    private _statusCloseListener?: (event: CloseEvent) => void
    private _statusMessageListener?: (event: MessageEvent) => void

    readonly baseIP: string

    constructor(baseIP: string = 'localhost:12151') {
        super()
        this.baseIP = baseIP
    }

    get bridgeReady(): boolean {
        return ((this._bridgeWebsocket !== undefined && this._bridgeWebsocket.readyState === WebSocket.OPEN) ||
            (this._statusWebsocket !== undefined && this._statusWebsocket.readyState === WebSocket.OPEN))
    }

    get localReady(): boolean {
        return this._localReady
    }

    get remoteReady(): boolean {
        return (this._statusWebsocket !== undefined && this._statusWebsocket.readyState === WebSocket.OPEN)
    }

    async getLocalWebsocket(): Promise<WebSocket> {
        if(!this.localReady) {
            throw new Error('Local not ready')
        }

        return new WebSocket(`ws://${this.baseIP}/proxy/websocket`)
    }

    async requestLocal(resource: string, init?: Object): Promise<Response> {
        if(!this.localReady) {
            throw new Error('Local not ready')
        }

        return fetch(`http://${this.baseIP}/proxy/local/${resource}`, init)
    }

    async requestRemoteGLZ(resource: string, shard: string, region: string, init?: Object): Promise<Response> {
        if(!this.remoteReady) {
            throw new Error('Remote not ready')
        }

        return fetch(`http://${this.baseIP}/proxy/glz/${region}/${shard}/${resource}`, init)
    }

    async requestRemotePD(resource: string, shard: string, init?: Object): Promise<Response> {
        if(!this.remoteReady) {
            throw new Error('Remote not ready')
        }

        return fetch(`http://${this.baseIP}/proxy/pd/${shard}/${resource}`, init)
    }

    override _onEventHandled(key: string) {
        if(key == 'logMessage') {
            this._logWebsocket = new WebSocket(`ws://${this.baseIP}/proxy/log`)
            this._logWebsocket.addEventListener('message', event => {
                const lines = event.data.toString().split('\n')
                for(const line of lines) {
                    this.emit('logMessage', line)
                }
            })
        }
    }

    override _onEventUnhandled(key: string) {
        if(key == 'logMessage') {
            this._logWebsocket?.close()
        }
    }

    async requestRemoteShared(resource: string, shard: string, init?: Object): Promise<Response> {
        if(!this.remoteReady) {
            throw new Error('Remote not ready')
        }

        return fetch(`http://${this.baseIP}/proxy/shared/${shard}/${resource}`, init)
    }

    async getLog(): Promise<string> {
        if(!this.bridgeReady) {
            throw new Error('Bridge not ready')
        }

        return (await fetch(`http://${this.baseIP}/proxy/log`)).text()
    }

    async waitForLogWatching(): Promise<void> {
        //TODO implement
        return Promise.resolve()
    }

    /**
     * Called when the root bridge websocket is closed unexpectedly
     * This does not include the case when the websocket is closed upon being whitelisted
     */
    private _onBridgeClose() {
        this._bridgeWebsocket = undefined
        this.emit('bridgeStatusChange', false)
    }

    /**
     * Called when the bridge status proxy websocket is closed unexpectedly
     */
    private _onStatusClose() {
        this._statusWebsocket = undefined
        this.emit('bridgeStatusChange', false)

        // Ensure local readiness and remote readiness are false
        if(this._localReady) {
            this._localReady = false
            this.emit('localStatusChange', this._localReady, 'filesystem')
        }
        this.emit('remoteStatusChange', false)
    }

    /**
     * Called when the bridge status proxy websocket receives a message
     * @param message The message received
     */
    private _onStatusMessage(message: MessageEvent) {
        let data
        try {
            data = JSON.parse(message.data.toString())
        } catch(e) {
            return
        }

        if(!instanceOfStatusResponse(data)) {
            return
        }

        if(this._localReady !== data.lockfileReady) {
            this._localReady = data.lockfileReady
            this.emit('localStatusChange', this._localReady, data.source)
        }
    }

    /**
     * Connects to the status websocket
     * Intended to be called after the bridge is connected and whitelisted
     * Resolves when the status websocket is connected and the first message is received
     * Automatically closes the bridge websocket when the status websocket is connected
     * @param signal Optional signal to abort the connection
     * @returns A promise that resolves with the initial status message
     */
    async connectToStatus(signal?: AbortSignal): Promise<StatusResponse> {
        return new Promise<StatusResponse>((resolve, reject) => {
            if(signal?.aborted) return reject()

            // Begin connection to status websocket
            const ws = new WebSocket(`ws://${this.baseIP}/proxy/status`)

            const onMessage = (message: MessageEvent) => {
                let data
                try {
                    data = JSON.parse(message.data.toString())
                } catch(e) {
                    return
                }

                if(!instanceOfStatusResponse(data)) {
                    return
                }

                // Close bridge websocket upon getting data from status websocket
                if(this._bridgeWebsocket !== undefined) {
                    if(this._bridgeCloseListener !== undefined) {
                        this._bridgeWebsocket.removeEventListener('close', this._bridgeCloseListener)
                    }
                    this._bridgeWebsocket.close()
                    this._bridgeWebsocket = undefined
                }

                this.emit('remoteStatusChange', true)

                ws.removeEventListener('message', onMessage)
                resolve(data)
            }

            this._statusCloseListener = () => {
                this._onStatusClose()
            }
            this._statusMessageListener = (message: any) => {
                this._onStatusMessage(message)
            }

            ws.addEventListener('message', onMessage)
            ws.addEventListener('message', this._statusMessageListener)
            ws.addEventListener('close', this._statusCloseListener)
            this._statusWebsocket = ws
        })
    }

    /**
     * Connects to the api bridge root websocket
     * Resolves when whitelist data is received
     * @param signal Optional abortion signal to stop connecting / waiting
     * @returns Promise resolving with a boolean indicating whether the application is whitelisted
     */
    async connectToBridge(signal?: AbortSignal): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            let ws: WebSocket

            // Early message handling to handle behavior observed while testing
            // The message event could get called before the promise finished resolving
            const earlyMessages: MessageEvent[] = []
            const onEarlyMessage = (message: MessageEvent) => {
                earlyMessages.push(message)
            }

            try {
                ws = await tryConnectWebsocket(`ws://${this.baseIP}/`, pending => {
                    pending.addEventListener('message', onEarlyMessage)
                }, signal)
            } catch(e) {
                reject(e)
                return
            }

            this._bridgeWebsocket = ws

            const onMessage = (message: MessageEvent) => {
                let data
                try {
                    data = JSON.parse(message.data.toString())
                } catch(e) {
                    return
                }

                if(data.action && data.action === 'init') {
                    this._whitelisted = data['whitelisted']

                    removeEvents()
                    this._bridgeCloseListener = () => {
                        this._onBridgeClose()
                    }
                    ws.addEventListener('close', this._bridgeCloseListener)

                    if(this._whitelisted) {
                        this.emit('notWhitelisted')
                    }
                    this.emit('bridgeStatusChange', true)
                    resolve(this._whitelisted)
                }
            }

            const removeEvents = () => {
                ws.removeEventListener('message', onMessage)
                ws.removeEventListener('close', onClose)
                signal?.removeEventListener('abort', onAbort)
            }

            const onClose = () => {
                removeEvents()
                this._onBridgeClose()
                reject()
            }

            const onAbort = () => {
                removeEvents()
                reject()
            }

            ws.addEventListener('message', onMessage)
            ws.addEventListener('close', onClose)
            signal?.addEventListener('abort', onAbort)

            ws.removeEventListener('message', onEarlyMessage)
            for(const message of earlyMessages) {
                onMessage(message)
            }
        })
    }

    /**
     * Waits for bridge connection and whitelist status
     * @param signal Optional abortion signal to cancel connecting / waiting
     */
    async waitForBridge(signal?: AbortSignal): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            while(signal === undefined || !signal.aborted) {
                try {
                    resolve(await this.connectToBridge(signal))
                    return
                } catch(ignored) {
                    //TODO optional delay if not triggered by signal
                }
            }
            reject()
        })
    }

    /**
     * Requests whitelist from an open bridge connection
     * Resolves upon getting whitelist response
     * If successfully whitelisted, the bridge connection will close
     * @param name The name of the application provided to the whitelist
     * @param signal Optional abortion signal to stop waiting for a response
     */
    async requestWhitelist(name: string, signal?: AbortSignal): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            // Ensure bridge is connected
            if((signal !== undefined && signal.aborted) ||
                this._bridgeWebsocket === undefined ||
                this._bridgeWebsocket.readyState !== WebSocket.OPEN) {
                reject()
                return
            }

            const removeListeners = () => {
                this._bridgeWebsocket?.removeEventListener('message', messageHandler)
                this._bridgeWebsocket?.removeEventListener('close', closeHandler)
            }

            // Handle incoming bridge messages and look for whitelist response
            const messageHandler = (event: MessageEvent) => {
                try {
                    const data = JSON.parse(event.data.toString())
                    if(data.action === 'requestResponse') {
                        this._whitelisted = data['response']
                        removeListeners()
                        resolve(this._whitelisted)
                    }
                } catch(ignored) {}
            }

            // Just reject the promise
            // Bridge close behavior is handled elsewhere
            const closeHandler = () => {
                removeListeners()
                reject()
            }

            // Close listeners and reject on abort
            const abortHandler = () => {
                removeListeners()
                reject()
            }

            signal?.addEventListener('abort', abortHandler)
            this._bridgeWebsocket?.addEventListener('message', messageHandler)
            this._bridgeWebsocket?.send(JSON.stringify({
                action: 'request',
                name
            }))
        })
    }
}
