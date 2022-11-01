export interface MatchHistoryItem {
    MatchID: string
    GameStartTime: number
    QueueID: string
}

export interface ValorantMatchHistoryResponse {
    Subject: string
    BeginIndex: number
    EndIndex: number
    Total: number
    History: MatchHistoryItem[]
}
