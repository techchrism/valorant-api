export interface ValorantMatchDetailsResponse {
    matchInfo: MatchInfo
    players: Player[]
    teams: Team[]
    roundResults: RoundResult[]
}

export interface MatchInfo {
    matchId: string
    mapId: string
    gamePodId: string
    gameLoopZone: string
    gameServerAddress: string
    gameVersion: string
    gameLengthMillis: number
    gameStartMillis: number
    provisioningFlowID: string
    isCompleted: boolean
    customGameName: string
    forcePostProcessing: boolean
    queueID: string
    gameMode: string
    isRanked: boolean
    canProgressContracts: boolean
    isMatchSampled: boolean
    seasonId: string
    completionState: string
    platformType: string
}

export interface PlayerName {
    gameName: string
    tagLine: string
}

export interface Player extends PlayerName {
    subject: string
    platformInfo: PlatformInfo
    teamId: string
    partyId: string
    characterId: string | null
    stats: Stats | null
    roundDamage: RoundDamage[] | null
    competitiveTier: number
    playerCard: string
    playerTitle: string
    preferredLevelBorder?: string
    accountLevel: number
    sessionPlaytimeMinutes?: number
    behaviorFactors?: BehaviorFactors
    newPlayerExperienceDetails?: NewPlayerExperienceDetails
    xpModifications?: XpModification[]
}

export interface PlatformInfo {
    platformType: string
    platformOS: string
    platformOSVersion: string
    platformChipset: string
}

export interface Stats {
    score: number
    roundsPlayed: number
    kills: number
    deaths: number
    assists: number
    playtimeMillis: number
    abilityCasts?: AbilityCasts
}

export interface AbilityCasts {
    grenadeCasts: number
    ability1Casts: number
    ability2Casts: number
    ultimateCasts: number
}

export interface RoundDamage {
    round: number
    receiver: string
    damage: number
}

export interface BehaviorFactors {
    afkRounds: number
    friendlyFire?: number
    stayedInSpawnRounds?: number
}

export interface NewPlayerExperienceDetails {
    basicMovement: BasicMovement
    basicGunSkill: BasicGunSkill
    adaptiveBots: AdaptiveBots
    ability: NewPlayerExperienceAbility
    bombPlant: BombPlant
    defendBombSite: DefendBombSite
    settingStatus: SettingStatus
}

export interface BasicMovement {
    idleTimeMillis: number
    objectiveCompleteTimeMillis: number
}

export interface BasicGunSkill {
    idleTimeMillis: number
    objectiveCompleteTimeMillis: number
}

export interface AdaptiveBots {
    idleTimeMillis: number
    objectiveCompleteTimeMillis: number
    adaptiveBotAverageDurationMillisAllAttempts: number
    adaptiveBotAverageDurationMillisFirstAttempt: number
    killDetailsFirstAttempt: any
}

export interface NewPlayerExperienceAbility {
    idleTimeMillis: number
    objectiveCompleteTimeMillis: number
}

export interface BombPlant {
    idleTimeMillis: number
    objectiveCompleteTimeMillis: number
}

export interface DefendBombSite {
    idleTimeMillis: number
    objectiveCompleteTimeMillis: number
    success: boolean
}

export interface SettingStatus {
    isMouseSensitivityDefault: boolean
    isCrosshairDefault: boolean
}

export interface XpModification {
    Value: number
    ID: string
}

export interface Team {
    teamId: string
    won: boolean
    roundsPlayed: number
    roundsWon: number
    numPoints: number
}

export interface RoundResult {
    roundNum: number
    roundResult: string
    roundCeremony: string
    winningTeam: string
    bombPlanter?: string | null
    bombDefuser?: string | null
    plantRoundTime: number
    plantPlayerLocations?: PlayerLocation[] | null
    plantLocation: Location
    plantSite: string
    defuseRoundTime: number
    defusePlayerLocations?: PlayerLocation[] | null
    defuseLocation: Location
    playerStats: PlayerStat[]
    roundResultCode: string
    playerEconomies: PlayerEconomy[] | null
    playerScores: PlayerScore[] | null
}

export interface PlayerLocation {
    subject: string
    viewRadians: number
    location: Location
}

export interface Location {
    x: number
    y: number
}

export interface PlayerStat {
    subject: string
    kills: Kill[]
    damage: Damage[]
    score: number
    economy: Economy
    ability: Ability
    wasAfk: boolean
    wasPenalized: boolean
    stayedInSpawn: boolean
}

export interface Kill {
    gameTime: number
    roundTime: number
    killer: string
    victim: string
    victimLocation: Location
    assistants: string[]
    playerLocations: PlayerLocation[]
    finishingDamage: FinishingDamage
}

export interface FinishingDamage {
    damageType: string
    damageItem: string
    isSecondaryFireMode: boolean
}

export interface Damage {
    receiver: string
    damage: number
    legshots: number
    bodyshots: number
    headshots: number
}

export interface Economy {
    loadoutValue: number
    weapon: string
    armor: string
    remaining: number
    spent: number
}

export interface Ability {
    grenadeEffects: any
    ability1Effects: any
    ability2Effects: any
    ultimateEffects: any
}

export interface PlayerEconomy {
    subject: string
    loadoutValue: number
    weapon: string
    armor: string
    remaining: number
    spent: number
}

export interface PlayerScore {
    subject: string
    score: number
}

export interface FinishingDamage {
    damageType: string
    damageItem: string
    isSecondaryFireMode: boolean
}
