import RequestMaker from './RequestMaker'
import {EventEmitter, EventKey} from 'ee-ts'
import {WebSocketEventEmitters} from './types/websocket/WebSocketEventTypes'
import {MessageEvent, WebSocket} from 'isomorphic-ws'
import {RiotMessagingServiceV1Message} from './types/websocket/events/RiotMessagingServiceV1Message'
import {CredentialManager} from './credentialManager/CredentialManager'
import {LocalAPI} from './api/LocalAPI'
import {RemoteAPI, RemoteAPIDefaults} from './api/RemoteAPI'

const matchCorePrefix = '/riot-messaging-service/v1/message/ares-core-game/core-game/v1/matches/'
const preGamePrefix = '/riot-messaging-service/v1/message/ares-pregame/pregame/v1/matches/'
const gameEndURI = '/riot-messaging-service/v1/message/ares-match-details/match-details/v1/matches'

const localInitializationLogLineEnding = 'LogPlatformInitializerV2: Status is now: Initialized'
const ciServerVersionRegex = /LogShooter: Display: CI server version: (?<version>.+)/
const branchRegex = /LogShooter: Display: Branch: (?<branch>.+)/
const changeListRegex = /LogShooter: Display: Changelist: (?<changelist>.+)/
const buildVersionRegex = /LogShooter: Display: Build version: (?<buildVersion>.+)/
const sessionAPICallRegex = /\[GET https:\/\/glz-(?<region>.+?)-1.(?<shard>.+?).a.pvp.net\/session\/v1\/sessions\/(?<puuid>.+?)\/reconnect\]/

export interface ValorantInitCollectedData {
    version: {
        ciServerVersion: string
        branch: string
        changelist: number
        buildVersion: number
    }
    puuid: string
    region: string
    shard: string
}

export type GameState = 'pregame' | 'coregame' | 'no-game'

export type ValorantAPIEvents = {
    websocketOpen: (websocket: WebSocket) => void
    websocketClose: () => void

    gameStateChange: (state: GameState, id: string) => void
    localInitialized: (remoteAPI: RemoteAPI<RemoteAPIDefaults>, initData: ValorantInitCollectedData) => void
    localUninitialized: () => void
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
    private _initData?: ValorantInitCollectedData

    // APIs
    public readonly local: LocalAPI
    public pvp?: RemoteAPI<RemoteAPIDefaults> = undefined

    constructor(requestMaker: RequestMaker, credentialManager: CredentialManager) {
        super()
        this.requestMaker = requestMaker
        this.credentialManager = credentialManager
        this.local = new LocalAPI(this.requestMaker, this.credentialManager)

        let localUnreadyAbortController: AbortController | undefined = undefined
        // Check for initialization status if local is already ready
        if(this.requestMaker.localReady) {
            localUnreadyAbortController = new AbortController()
            // There *might* be an edge case where the local is ready but the game isn't initialized yet
            this.waitForInit(true, localUnreadyAbortController.signal).catch(ignored => {})
        }

        // Handle initialization stage changes in tandem with local readiness
        this.requestMaker.on('localStatusChange', (ready, source) => {
            if(ready) {
                localUnreadyAbortController = new AbortController()
                this.waitForInit(source === 'init', localUnreadyAbortController.signal).catch(ignored => {})
            } else {
                if(localUnreadyAbortController) {
                    localUnreadyAbortController.abort()
                    localUnreadyAbortController = undefined
                }
                // Remove local initialization status
                if(this._localInitialized) {
                    this._localInitialized = false
                    this.emit('localUninitialized')
                }
            }
        })

        // Connect to websocket and subscribe to events when local is ready
        this.on('localInitialized', () => {
            if(this._websocketEventCount > 0) {
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
    private async waitForInit(readLog: boolean, signal?: AbortSignal): Promise<ValorantInitCollectedData> {
        if(signal?.aborted) throw new Error('Aborted')
        if(!this.requestMaker.localReady) throw new Error('Local requests not yet ready')

        return new Promise(async (resolve, reject) => {
            let ciServerVersion: string | undefined = undefined
            let branch: string | undefined = undefined
            let changelist: number | undefined = undefined
            let buildVersion: number | undefined = undefined

            let shard: string | undefined = undefined
            let region: string | undefined = undefined
            let puuid: string | undefined = undefined

            const localInitializationLogListener = (line: string) => {
                if(line.endsWith(localInitializationLogLineEnding)) {
                    this._localInitialized = true
                    this._initData = {
                        version: {
                            ciServerVersion: ciServerVersion || '',
                            branch: branch || '',
                            changelist: changelist || -1,
                            buildVersion: buildVersion || -1
                        },
                        shard: shard || '',
                        region: region || '',
                        puuid: puuid || ''
                    }
                    this.pvp = new RemoteAPI(this.requestMaker, this.credentialManager, {
                        shard: this._initData.shard,
                        region: this._initData.region,
                        puuid: this._initData.puuid,
                        version: this._initData.version.ciServerVersion
                    })

                    this.emit('localInitialized', this.pvp, this._initData)
                    this.requestMaker.off('logMessage', localInitializationLogListener)
                    signal?.removeEventListener('abort', abortHandler)
                    resolve(this._initData)
                    return
                }

                if(ciServerVersion === undefined) {
                    const match = ciServerVersionRegex.exec(line)
                    if(match) {
                        ciServerVersion = match.groups?.version || ''
                        return
                    }
                }

                if(branch === undefined) {
                    const match = branchRegex.exec(line)
                    if(match) {
                        branch = match.groups?.branch || ''
                        return
                    }
                }

                if(changelist === undefined) {
                    const match = changeListRegex.exec(line)
                    if(match) {
                        changelist = Number(match.groups?.changelist)
                        return
                    }
                }

                if(buildVersion === undefined) {
                    const match = buildVersionRegex.exec(line)
                    if(match) {
                        buildVersion = Number(match.groups?.buildVersion)
                        return
                    }
                }

                if(shard === undefined) {
                    const match = sessionAPICallRegex.exec(line)
                    if(match) {
                        shard = match.groups?.shard || ''
                        region = match.groups?.region || ''
                        puuid = match.groups?.puuid || ''
                        return
                    }
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
