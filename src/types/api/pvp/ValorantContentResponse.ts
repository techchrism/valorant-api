interface TimedPeriod {
    ID: string
    Name: string
    StartTime: string
    EndTime: string
    IsActive: boolean
}

export interface ValorantContentSeason extends TimedPeriod {
    Type: 'episode' | 'act'
}

export interface ValorantContentEvent extends TimedPeriod {}

export interface ValorantContentResponse {
    DisabledIDs: string[] /* TODO: verify */
    Seasons: ValorantContentSeason[]
    Events: ValorantContentEvent[]
}
