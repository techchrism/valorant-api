export interface ValorantPartyCustomGameConfigsResponse {
    Enabled: boolean
    EnabledMaps: string[]
    EnabledModes: string[]
    Queues: {
        QueueID: string
        Enabled: boolean
        TeamSize: number
        NumTeams: number
        MaxPartySize: number
        MinPartySize: number
        InvalidPartySizes: number[]
        MaxPartySizeHighSkill: number
        HighSkillTier: number
        MaxSkillTier: number
        AllowFullPartyBypassSkillRestrictions: boolean
        Mode: string
        IsRanked: boolean
        IsTournament: boolean
        RequireRoster: boolean
        Priority: number
        PartyMaxCompetitiveTierRange: number
        PartyMaxCompetitiveTierRangePlacementBuffer: number
        FullPartyMaxCompetitiveTierRange: number
        PartySkillDisparityCompetitiveTiersCeilings: {[key: string]: number}
        UseAccountLevelRequirement: boolean
        MinimumAccountLevelRequired: number
        GameRules: {[key: string]: 'true' | 'false'}
        SupportedPlatformTypes: string[]
        DisabledContent: unknown[] /* TODO: verify */
        queueFieldA: unknown[]
        NextScheduleChangeSeconds: number
        TimeUntilNextScheduleChangeSeconds: number
        /*
            Array values are map names followed by a colon and an integer value.
            For example, "Ascent:1" means Ascent is enabled and "Bonsai:0" means Split is disabled.
         */
        MapWeights: string[]
    }[]
    GamePodPingServiceInfo: {
        [zone: string]: {
            SecurityHash: number
            ObfuscatedIP: number
            PingProxyAddress: string
            PingProxyAddresses: string[]
        }
    }
}
