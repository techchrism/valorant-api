export interface ValorantLoadoutGun {
    ID: string
    SkinID: string
    SkinLevelID: string
    ChromaID: string
    CharmInstanceID: string
    CharmID: string
    CharmLevelID: string
    Attachments: string[] /* TODO: verify */
}

export interface ValorantLoadoutSpray {
    EquipSlotID: string
    SprayID: string
    SprayLevelID: null /* TODO: verify */
}

export interface ValorantPlayerLoadoutResponse {
    Subject: string
    Version: number
    Guns: ValorantLoadoutGun[]
    Sprays: ValorantLoadoutSpray[]
    Identity: {
        PlayerCardID: string
        PlayerTitleID: string
        AccountLevel: number
        PreferredLevelBorderID: string
        HideAccountLevel: boolean
    }
    Incognito: boolean
}
