export interface ValorantFriendRequest {
    game_name: string
    game_tag: string
    name: string
    node: string
    pid: string
    puuid: string
    region: string
    subscription: string
}

export interface ValorantFriendRequestsResponse {
    requests: ValorantFriendRequest[]
}
