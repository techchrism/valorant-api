export interface ValorantChatConversationsResponse {
    conversations: {
        cid: string
        direct_messages: boolean
        global_readership: boolean
        message_history: boolean
        mid: string
        muted: boolean
        mutedRestriction: boolean
        type: 'groupchat' | 'chat' | string /* TODO: verify */
        uiState: {
            changedSinceHidden: boolean
            hidden: boolean
        }
        unread_count: number
    }[]
}
