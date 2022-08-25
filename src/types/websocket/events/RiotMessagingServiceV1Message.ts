import {WebSocketEvent} from '../WebSocketEvent'

interface RiotMessagingServiceV1MessageData {
    stuff: string
}

export type RiotMessagingServiceV1Message = WebSocketEvent<RiotMessagingServiceV1MessageData> & {
    event: 'OnJsonApiEvent_riot-messaging-service_v1_message'
}
