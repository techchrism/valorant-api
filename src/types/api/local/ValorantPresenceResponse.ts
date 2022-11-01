export interface ValorantPrivatePresence {
    accountLevel: number
    competitiveTier: number
    customGameName: string
    customGameTeam: string
    isIdle: boolean
    isPartyOwner: boolean
    leaderboardPosition: number
    matchMap: string
    maxPartySize: number
    partyAccessibility: string
    partyClientVersion: string
    partyId: string
    partyLFM: boolean
    partyOwnerMatchCurrentTeam: string
    partyOwnerMatchMap: string
    partyOwnerMatchScoreAllyTeam: number
    partyOwnerMatchScoreEnemyTeam: number
    partyOwnerProvisioningFlow: string
    partyOwnerSessionLoopState: string
    partySize: number
    partyState: string
    partyVersion: number
    playerCardId: string
    playerTitleId: string
    preferredLevelBorderId: string
    provisioningFlow: string
    queueEntryTime: string
    queueId: string
    rosterId: string
    sessionLoopState: string
    tournamentId: string
}

export interface ValorantPresence {
    actor: null
    basic: string
    details: string
    game_name: string
    game_tag: string
    location: null
    msg: null
    name: string
    patchline: null
    pid: string
    platform: null
    private: ValorantPrivatePresence
    privateJwt: null
    product: string
    puuid: string
    region: string
    resource: string
    state: string
    summary: string
    time: number
}

export interface ValorantPresenceResponse {
    presences: ValorantPresence[]
}
