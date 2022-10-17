import {WebSocketEvent} from '../WebSocketEvent'

//TODO refactor with service-specific payload data
interface RiotMessagingServiceV1MessageData {
    ackRequired: boolean
    id: ''
    payload: '' | {
        subject: string
        cxnState: 'CONNECTED'
        clientID: string
        clientVersion: string
        loopState: string
        loopStateMetadata: string
        version: number
        lastHeartbeatTime: string
        expiredTime: string
        heartbeatIntervalMillis: number
        playtimeNotification: ""
        playtimeMinutes: number
        isRestricted: boolean
        userinfoValidTime: string
        restrictionType: string
        clientPlatformInfo: {
            platformType: 'PC'
            platformOS: 'Windows'
            platformOSVersion: string
            platformChipset: string
        }
    } | {
        balances: {
            [key: string]: {
                amount: number
                version: number
                active: boolean
            }
        }
        deltas: {
            [key: string]: {
                amount: number
            }
        }
    }
    resource: string
    service: 'pregame' | 'core-game' | 'parties' | 'match-details' | 'mmr' | 'account-xp' | 'contracts' | 'cap.counters' | 'session'
    timestamp: number
    version: string
}

export type RiotMessagingServiceV1Message = WebSocketEvent<RiotMessagingServiceV1MessageData> & {
    event: 'OnJsonApiEvent_riot-messaging-service_v1_message'
}
