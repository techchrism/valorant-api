export interface ValorantFriend {
    activePlatform: string
    displayGroup: string
    game_name: string
    game_tag: string
    group: string
    last_online_ts: number
    name: string
    note: string
    pid: string
    puuid: string
    region: string
}

export interface ValorantFriendsResponse {
    friends: ValorantFriend[]
}
