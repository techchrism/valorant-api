export interface ValorantChatHistoryResponse {
    messages: {
        body: string
        cid: string
        game_name: string
        id: string
        mid: string
        name: string
        pid: string
        puuid: string
        read: boolean
        region: string
        time: string
        type: 'chat' | string /* TODO: verify */
    }[]
}
