export interface ValorantLeaderboardResponse {
    Deployment: string
    QueueID: string
    SeasonID: string
    Players: {
        PlayerCardID: string
        TitleID: string
        IsBanned: boolean
        IsAnonymized: boolean
        puuid: string
        gameName: string
        tagLine: string
        leaderboardRank: number
        rankedRating: number
        numberOfWins: number
        competitiveTier: number
    }[]
    totalPlayers: number
    immortalStartingPage: number
    immortalStartingIndex: number
    topTierRRThreshold: number
    tierDetails: {
        [tier: string]: {
            rankedRatingThreshold: number
            startingPage: number
            startingIndex: number
        }
    }
    startIndex: number
    query: string
}
