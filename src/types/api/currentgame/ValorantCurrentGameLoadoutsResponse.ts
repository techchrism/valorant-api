export interface ValorantCurrentGameLoadoutsResponse {
    Loadouts: {
        CharacterID: string
        Loadout: {
            Sprays: {
                SpraySelections: {
                    SocketID: string
                    SprayID: string
                    LevelID: string
                }[]
            }
            Items: {
                [id: string]: {
                    ID: string
                    TypeID: string
                    Sockets: {
                        [id: string]: {
                            ID: string
                            Item: {
                                ID: string
                                TypeID: string
                            }
                        }
                    }
                }
            }
        }
    }[]
}
