export interface ValorantCompetitiveUpdate {
    MatchID: string
    MapID: string
    SeasonID: string
    MatchStartTime: number
    TierAfterUpdate: number
    TierBeforeUpdate: number
    RankedRatingAfterUpdate: number
    RankedRatingBeforeUpdate: number
    RankedRatingEarned: number
    RankedRatingPerformanceBonus: number
    CompetitiveMovement: string
    AFKPenalty: number
}

export interface ValorantCompetitiveUpdatesResponse {
    Version: number
    Subject: string
    Matches: ValorantCompetitiveUpdate[]
}
