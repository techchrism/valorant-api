export interface XPProgress {
    Level: number
    XP: number
}

export interface XPHistoryItem {
    ID: string
    MatchStart: string
    StartProgress: XPProgress
    EndProgress: XPProgress
    XPDelta: number
    XPSources: {
        ID: 'time-played' | 'match-win'
        Amount: number
    }[]
    XPMultipliers: unknown[] /* TODO: verify */
}

export interface ValorantAccountXPResponse {
    Version: number
    Subject: string
    Progress: XPProgress
    History: XPHistoryItem[]
    LastTimeGrantedFirstWin: string
    NextTimeFirstWinAvailable: string
}
