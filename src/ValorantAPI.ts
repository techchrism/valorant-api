import RequestMaker from './RequestMaker'
import {EventEmitter, EventKey} from 'ee-ts'
import {WebSocketEventEmitters} from './types/websocket/WebSocketEventTypes'
import {WebSocket} from 'isomorphic-ws'

type ValorantAPIEvents = {
    websocketOpen: (websocket: WebSocket) => void
    websocketClose: () => void
}

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

    private _websocketEventCount = 0
    private _ws?: WebSocket
    private _subscribedEvents = new Set<string>()

    constructor(requestMaker: RequestMaker) {
        super()
        this.requestMaker = requestMaker
    }

    async connect() {
        this._ws = await this.requestMaker.getLocalWebsocket()
        this._ws.on('open', (ws: WebSocket) => {
            this.emit('websocketOpen', ws)
            for(const event of this._subscribedEvents) {
                ws.send(JSON.stringify([5, event]))
            }
        })
        this._ws.on('close', () => {
            this.emit('websocketClose')
        })
    }

    override _onEventHandled(key: EventKey<CombinedEventType>) {
        if(isWebsocketEvent(key)) {
            this._websocketEventCount++
            const riotName = websocketEventToRiotName(key)
            this._subscribedEvents.add(riotName)

            if(this._ws === undefined || this._ws.readyState === WebSocket.CLOSED) {
                this.connect()
            } else {
                this._ws?.send(JSON.stringify([5, riotName]))
            }
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
        }
    }
}
