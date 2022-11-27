import {PartyMember} from '../party/ValorantPartyResponse'

export interface ValorantCurrentGameFetchMatchResponse {
    MatchID: string
    Version: number
    State: string
    MapID: string
    ModeID: string
    ProvisioningFlow: string
    GamePodID: string
    AllMUCName: string
    TeamMUCName: string
    TeamVoiceID: string
    IsReconnectable: boolean
    ConnectionDetails: {
        GameServerHosts: string[]
        GameServerHost: string
        GameServerPort: number
        GameServerObfuscatedIP: number
        GameClientHash: number
        PlayerKey: string
    }
    PostGameDetails: null /* TODO: verify */
    Players: {
        Subject: string
        TeamID: string
        CharacterID: string
        PlayerIdentity: PartyMember['PlayerIdentity']
        SeasonalBadgeInfo: PartyMember['SeasonalBadgeInfo']
        IsCoach: boolean
        IsAssociated: boolean
    }[]
    MatchmakingData: null /* TODO: verify */
}
