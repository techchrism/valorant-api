export interface UserInfo {
    country: string
    // Subject PUUID
    sub: string
    email_verified: boolean
    player_plocale: string | null //TODO verify
    country_at: number
    // Password
    pw: {
        // Password last changed timestamp
        cng_at: number
        reset: boolean
        must_reset: boolean
    }
    lol: string | null //TODO verify
    original_platform_id: string | null //TODO verify
    original_account_id: string | null //TODO verify
    phone_number_verified: boolean
    preferred_username: string
    ban: { //TODO verify
        code: null | any
        desc: string
        exp: null | number
        restrictions: []
    }
    ppid: null //TODO verify
    lol_region: [] //TODO verify
    player_locale: string
    pvpnet_account_id: null //TODO verify
    acct: {
        type: number
        state: string
        adm: boolean
        game_name: string
        tag_line: string
        created_at: number
    }
    jti: string
    username: string
}

export interface ValorantUserInfoResponse {
    userInfo: UserInfo
}
