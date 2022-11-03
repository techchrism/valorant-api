import RequestMaker from './RequestMaker'
import {EventEmitter, EventKey} from 'ee-ts'
import {WebSocketEventEmitters} from './types/websocket/WebSocketEventTypes'
import {MessageEvent, WebSocket} from 'isomorphic-ws'
import {RiotMessagingServiceV1Message} from './types/websocket/events/RiotMessagingServiceV1Message'
import {CredentialManager} from './credentialManager/CredentialManager'
import {LocalAPI} from './api/LocalAPI'
import {PvPAPI} from './api/PvPApi'

const matchCorePrefix = '/riot-messaging-service/v1/message/ares-core-game/core-game/v1/matches/'
const preGamePrefix = '/riot-messaging-service/v1/message/ares-pregame/pregame/v1/matches/'
const gameEndURI = '/riot-messaging-service/v1/message/ares-match-details/match-details/v1/matches'
const localInitializationLogLineEnding = 'LogPlatformInitializerV2: Status is now: Initialized'

export type GameState = 'pregame' | 'coregame' | 'no-game'

export type ValorantAPIEvents = {
    websocketOpen: (websocket: WebSocket) => void
    websocketClose: () => void

    gameStateChange: (state: GameState, id: string) => void
    localInitializationStateChange: (ready: boolean) => void
}

/**
 * Translates the event name from ValorantAPI (this project) to the internal event name used by Valorant
 */
function websocketEventToRiotName(eventName: EventKey<WebSocketEventEmitters>): string {
    switch(eventName) {
        case 'websocketRiotMessagingServiceV1Message': return 'OnJsonApiEvent_riot-messaging-service_v1_message'
    }

    const _exhaustiveCheck: never = eventName
    throw new Error('Invalid event name')
}

const ignoreWebSocketEvents = ['websocketOpen', 'websocketClose']
function isWebsocketEvent(key: EventKey<CombinedEventType>): key is EventKey<WebSocketEventEmitters> {
    return key.startsWith('websocket') && !ignoreWebSocketEvents.includes(key)
}

type CombinedEventType = ValorantAPIEvents & WebSocketEventEmitters

export class ValorantAPI extends EventEmitter<CombinedEventType> {
    public readonly requestMaker: RequestMaker
    public readonly credentialManager: CredentialManager

    private _websocketEventCount = 0
    private _ws?: WebSocket
    private _subscribedEvents = new Map<string, EventKey<WebSocketEventEmitters>>()

    // Game state tracking
    private _gameID: string | null = null
    private _preGameID: string | null = null
    private _previousGameID: string | null = null

    private _localInitialized = false

    // APIs
    public readonly local: LocalAPI
    public readonly pvp: PvPAPI

    constructor(requestMaker: RequestMaker, credentialManager: CredentialManager) {
        super()
        this.requestMaker = requestMaker
        this.credentialManager = credentialManager
        this.local = new LocalAPI(this.requestMaker, this.credentialManager)
        this.pvp = new PvPAPI(this.requestMaker, this.credentialManager)

        let localUnreadyAbortController: AbortController | undefined = undefined
        // Check for initialization status if local is already ready
        if(this.requestMaker.localReady) {
            localUnreadyAbortController = new AbortController()
            // There *might* be an edge case where the local is ready but the game isn't initialized yet
            this.waitForInit(true, localUnreadyAbortController.signal)
        }

        // Handle initialization stage changes in tandem with local readiness
        this.requestMaker.on('localStatusChange', (ready, source) => {
            if(ready) {
                localUnreadyAbortController = new AbortController()
                this.waitForInit(source === 'init', localUnreadyAbortController.signal)
            } else {
                if(localUnreadyAbortController) {
                    localUnreadyAbortController.abort()
                    localUnreadyAbortController = undefined
                }
                // Remove local initialization status
                if(this._localInitialized) {
                    this._localInitialized = false
                    this.emit('localInitializationStateChange', false)
                }
            }
        })

        // Connect to websocket and subscribe to events when local is ready
        this.on('localInitializationStateChange', ready => {
            if(ready && this._websocketEventCount > 0) {
                this.websocketConnect()
            }
        })
    }

    /**
     * Waits for the game to be initialized
     * Called when local is ready
     * @param readLog Whether to read the log file or not. Should be false when the lockfile is "fresh" because the lockfile is updated before the previous log is cleared
     * @param signal Optional abort signal. Used for aborting the initiation wait when local becomes unready
     * @private
     */
    private async waitForInit(readLog: boolean, signal?: AbortSignal): Promise<void> {
        if(signal?.aborted) return
        if(!this.requestMaker.localReady) throw new Error('Local requests not yet ready')

        return new Promise(async (resolve, reject) => {
            const localInitializationLogListener = (line: string) => {
                //TODO add region / shard / puuid / version pre-init info scraping
                if(line.endsWith(localInitializationLogLineEnding)) {
                    this._localInitialized = true
                    this.emit('localInitializationStateChange', true)
                    this.requestMaker.off('logMessage', localInitializationLogListener)
                    signal?.removeEventListener('abort', abortHandler)
                    resolve()
                }
            }
            const abortHandler = () => {
                this.requestMaker.off('logMessage', localInitializationLogListener)
                reject(new Error('Aborted'))
            }

            // Next, start watching the log and wait for confirmation
            this.requestMaker.on('logMessage', localInitializationLogListener)
            signal?.addEventListener('abort', abortHandler)
            await this.requestMaker.waitForLogWatching()

            // The promise will already be rejected from the abort handler if the signal was aborted
            if(signal?.aborted) return

            // Finally, request the log in full
            if(readLog) {
                const logData = await this.requestMaker.getLog()
                if(signal?.aborted) return
                for(const line of logData.split(/\r?\n/)) {
                    localInitializationLogListener(line)
                }
            }
        })
    }

    private async websocketConnect(): Promise<boolean> {
        if(!this._localInitialized) return false

        this._ws = await this.requestMaker.getLocalWebsocket()
        this._ws.on('open', () => {
            this.emit('websocketOpen', this._ws!)
            for(const event of this._subscribedEvents.keys()) {
                this._ws!.send(JSON.stringify([5, event]))
            }
        })
        this._ws.on('close', () => {
            this.emit('websocketClose')
        })
        this._ws.onmessage = (event: MessageEvent) => {
            if(typeof event.data !== 'string' || event.data.length === 0) return

            const data = JSON.parse(event.data)
            if(!Array.isArray(data) || data.length !== 3) return

            const [id, eventName, payload] = data
            if(!this._subscribedEvents.has(eventName)) return

            let processedPayload = payload
            if(typeof processedPayload === 'string') {
                try {
                    processedPayload = JSON.parse(processedPayload)
                } catch(ignored) {}
            }

            this.emit(this._subscribedEvents.get(eventName)!, {
                body: processedPayload,
                event: eventName
            })
        }
        return true
    }

    override _onEventHandled(key: EventKey<CombinedEventType>) {
        if(isWebsocketEvent(key)) {
            this._websocketEventCount++
            const riotName = websocketEventToRiotName(key)
            this._subscribedEvents.set(riotName, key)

            if(this._ws === undefined || this._ws.readyState === WebSocket.CLOSED) {
                this.websocketConnect()
            } else {
                this._ws?.send(JSON.stringify([5, riotName]))
            }
        } else if(key === 'gameStateChange') {
            this.on('websocketRiotMessagingServiceV1Message', this._onRiotMessagingService)
        }
    }

    override _onEventUnhandled(key: EventKey<CombinedEventType>) {
        if(isWebsocketEvent(key)) {
            this._websocketEventCount--
            const riotName = websocketEventToRiotName(key)
            this._subscribedEvents.delete(riotName)

            if(this._websocketEventCount === 0) {
                this._ws?.close()
            } else {
                this._ws?.send(JSON.stringify([6, riotName]))
            }
        } else if(key === 'gameStateChange') {
            this.off('websocketRiotMessagingServiceV1Message', this._onRiotMessagingService)
        }
    }

    /**
     * Internal handler for riot messaging service events to track game state
     * @param data
     * @private
     */
    private _onRiotMessagingService = (data: RiotMessagingServiceV1Message): void => {
        if(data.body.uri === gameEndURI) {
            if(this._gameID === null) {
                //TODO add proper warning system
                console.warn('Game ended with null ID')
            } else {
                this.emit('gameStateChange', 'no-game', this._gameID)
            }
            this._previousGameID = this._gameID
            this._gameID = null
            this._preGameID = null
        } else if(data.body.uri.startsWith(matchCorePrefix) && this._gameID === null) {
            const id = data.body.uri.substring(matchCorePrefix.length)
            if(id !== this._previousGameID) {
                this._gameID = id
                this.emit('gameStateChange', 'coregame', id)
            }
        } else if(data.body.uri.startsWith(preGamePrefix) && this._preGameID === null) {
            const id = data.body.uri.substring(preGamePrefix.length)
            if(id !== this._previousGameID) {
                this._preGameID = id
                this.emit('gameStateChange', 'pregame', id)
            }
        }
    }
}
