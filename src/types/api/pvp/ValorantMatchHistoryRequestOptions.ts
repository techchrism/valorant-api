export interface ValorantMatchHistoryRequestOptions {
    startIndex?: number
    endIndex?: number
    queue?: 'null' | 'competitive' | 'custom' | 'deathmatch' | 'ggteam' | 'newmap' | 'onefa' | 'snowball' | 'spikerush' | 'unrated' | string
}
