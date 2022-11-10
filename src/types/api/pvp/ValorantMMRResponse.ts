export type ValorantGameMode = 'competitive' | 'custom' | 'deathmatch' | 'ggteam' | 'newmap' | 'onefa' | 'seeding' | 'snowball' | 'spikerush' | 'unrated' | string

export interface QueueMMR {
    TotalGamesNeededForRating: number
    TotalGamesNeededForLeaderboard: number
    CurrentSeasonGamesNeededForRating: number
    SeasonalInfoBySeasonID: {
        [seasonID: string]: {
            SeasonID: string
            NumberOfWins: number
            NumberOfWinsWithPlacements: number
            NumberOfGames: number
            Rank: number
            CapstoneWins: number
            LeaderboardRank: number
            CompetitiveTier: number
            RankedRating: number
            WinsByTier: {
                [tier: string]: number
            }
            GamesNeededForRating: number
            TotalWinsNeededForRank: number
        }
    }
}

export interface ValorantMMRResponse {
    Version: number
    Subject: string
    NewPlayerExperienceFinished: boolean
    QueueSkills: {
        [queue: string]: QueueMMR
    }
    LatestCompetitiveUpdate: {
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
    IsLeaderboardAnonymized: boolean
    IsActRankBadgeHidden: boolean
}
