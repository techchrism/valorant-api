import {PartyMember} from '../party/ValorantPartyResponse'

export interface ValorantPregameTeam {
    TeamID: string
    Players: {
        Subject: string
        CharacterID: string
        CharacterSelectionState: string
        PregamePlayerState: string
        CompetitiveTier: number
        PlayerIdentity: PartyMember['PlayerIdentity']
        SeasonalBadgeInfo: PartyMember['SeasonalBadgeInfo']
        IsCaptain: boolean
    }
}

export interface ValorantPregameMatchResponse {
    ID: string
    Version: number
    Teams: ValorantPregameTeam[]
    AllyTeam: ValorantPregameTeam
    EnemyTeam: ValorantPregameTeam | null
    ObserverSubjects: unknown[]
    MatchCoaches: unknown[]
    EnemyTeamSize: number
    EnemyTeamLockCount: number
    PregameState: string
    LastUpdated: string
    MapID: string
    MapSelectPool: unknown[]
    BannedMapIDs: unknown[]
    CastedVotes: unknown
    MapSelectSteps: unknown[]
    MapSelectStep: number
    Team1: string
    GamePodID: string
    Mode: string
    VoiceSessionID: string
    MUCName: string
    QueueID: string
    ProvisioningFlow: string
    IsRanked: boolean
    PhaseTimeRemainingNS: number
    StepTimeRemainingNS: number
    altModesFlagADA: boolean
    TournamentMetadata: null | unknown
    RosterMetadata: null | unknown
}
