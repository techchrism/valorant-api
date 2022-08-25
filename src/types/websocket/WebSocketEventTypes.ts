import {RiotMessagingServiceV1Message} from './events/RiotMessagingServiceV1Message'

export type WebSocketEventEmitters = {
    websocketRiotMessagingServiceV1Message: (data: RiotMessagingServiceV1Message) => void
}
