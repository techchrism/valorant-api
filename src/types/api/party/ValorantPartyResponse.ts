
type StringBoolean = 'true' | 'false';

export interface CustomGameMember {
    Subject: string;
}

export interface PartyMemberPing {
    Ping: number
    GamePodID: string
}

export interface PartyMember {
    Subject: string
    CompetitiveTier: number
    PlayerIdentity: {
        Subject: string
        PlayerCardID: string
        PlayerTitleID: string
        AccountLevel: number
        PreferredLevelBorderID: string
        Incognito: boolean
        HideAccountLevel: boolean
    }
    SeasonalBadgeInfo: null | {
        SeasonID: string
        NumberOfWins: number
        WinsByTier: null /* TODO: verify */
        Rank: number
        LeaderboardRank: number
    }
    IsOwner?: boolean
    QueueEligibleRemainingAccountLevels: number
    Pings: PartyMemberPing[]
    IsReady: boolean
    IsModerator: boolean
    UseBroadcastHUD: boolean
    PlatformType: string
}

export interface ValorantPartyResponse {
    ID: string
    MCUName: string
    VoiceRoomID: string
    Version: number
    ClientVersion: string


    State: string
    PreviousState: string
    StateTransitionReason: string
    Accessibility: 'OPEN' | 'CLOSED'
    CustomGameData: {
        Settings: {
            Map: string
            Mode: string
            UseBots: boolean
            GamePod: string
            GameRules: null | {
                AllowGameModifiers?: StringBoolean
                IsOvertimeWinByTwo?: StringBoolean
                PlayOutAllRounds?: StringBoolean
                SkipMatchHistory?: StringBoolean
                TournamentMode?: StringBoolean
            }
        }
        Membership: {
            teamOne: CustomGameMember[]
            teamTwo: CustomGameMember[]
            teamSpectate: CustomGameMember[]
            teamOneCoaches: CustomGameMember[]
            teamTwoCoaches: CustomGameMember[]
        }
        MaxPartySize: number
        AutobalanceEnabled: boolean
        AutobalanceMinPlayers: number
    }
    MatchmakingData: {
        QueueID: string
        PreferredGamePods: string[]
        SkillDisparityRRPenalty: number
    }
    Invites: null
    Requests: []
    QueueEntryTime: string
    ErrorNotification: {
        ErrorType: string
        ErroredPlayers: null
    }
    RestrictedSeconds: number
    EligibleQueues: string[]
    QueueIneligibilities: string[]
    CheatData: {
        GamePodOverride: string
        ForcePostGameProcessing: boolean
    }
}
