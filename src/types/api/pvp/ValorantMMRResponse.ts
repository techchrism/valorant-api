import {ValorantCompetitiveUpdate} from './ValorantCompetitiveUpdatesResponse'

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
    LatestCompetitiveUpdate: ValorantCompetitiveUpdate
    IsLeaderboardAnonymized: boolean
    IsActRankBadgeHidden: boolean
}
