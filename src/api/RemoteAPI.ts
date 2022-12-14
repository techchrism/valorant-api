import RequestMaker from '../RequestMaker'
import {CredentialManager} from '../credentialManager/CredentialManager'
import {ValorantMatchHistoryResponse} from '../types/api/pvp/ValorantMatchHistoryResponse'
import {ValorantMatchHistoryRequestOptions} from '../types/api/pvp/ValorantMatchHistoryRequestOptions'
import {ValorantContentResponse} from '../types/api/pvp/ValorantContentResponse'
import {ValorantAccountXPResponse} from '../types/api/pvp/ValorantAccountXPResponse'
import {ValorantPlayerLoadoutResponse} from '../types/api/pvp/ValorantPlayerLoadoutResponse'
import {ValorantMMRResponse} from '../types/api/pvp/ValorantMMRResponse'
import {ValorantMatchDetailsResponse} from '../types/api/pvp/ValorantMatchDetailsResponse'
import {ValorantCompetitiveUpdatesResponse} from '../types/api/pvp/ValorantCompetitiveUpdatesResponse'
import {ValorantLeaderboardRequestOptions} from '../types/api/pvp/ValorantLeaderboardRequestOptions'
import {ValorantLeaderboardResponse} from '../types/api/pvp/ValorantLeaderboardResponse'
import {ValorantConfigResponse} from '../types/api/pvp/ValorantConfigResponse'
import {ValorantWalletResponse} from '../types/api/pvp/ValorantWalletResponse'
import {ValorantPartyFetchPlayerResponse} from '../types/api/party/ValorantPartyFetchPlayerResponse'
import {ValorantPartyResponse} from '../types/api/party/ValorantPartyResponse'
import {ValorantPartyCustomGameConfigsResponse} from '../types/api/party/ValorantPartyCustomGameConfigsResponse'
import {ValorantCurrentGameFetchPlayerResponse} from '../types/api/currentgame/ValorantCurrentGameFetchPlayerResponse'
import {ValorantCurrentGameFetchMatchResponse} from '../types/api/currentgame/ValorantCurrentGameFetchMatchResponse'
import {ValorantCurrentGameLoadoutsResponse} from '../types/api/currentgame/ValorantCurrentGameLoadoutsResponse'
import {ValorantPregameGetPlayerResponse} from '../types/api/pregame/ValorantPregameGetPlayerResponse'
import {ValorantPregameMatchResponse} from '../types/api/pregame/ValorantPregameMatchResponse'

export interface RemoteAPIDefaults {
    puuid: string
    region: string
    shard: string
    version: string
}
type ConditionallyOptional<Check, Type, Keys extends keyof Type> =
    undefined extends Check ?
        {[Key in Keys]: Type[Key]} :
        {[Key in Keys]?: Type[Key]}
type ConditionallyOptionalDefaults<Check, Keys extends keyof RemoteAPIDefaults> = ConditionallyOptional<Check, RemoteAPIDefaults, Keys>

// From https://stackoverflow.com/a/65666402
function throwExpression(errorMessage: string): never {
    throw new Error(errorMessage)
}

const defaultPlatform = 'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9'

export class RemoteAPI<DefaultData extends RemoteAPIDefaults | undefined = undefined> {
    private _requestMaker: RequestMaker
    private _credentialManager: CredentialManager
    private _requestDefaults: DefaultData

    constructor(requestMaker: RequestMaker, credentialManager: CredentialManager, requestDefaults: DefaultData) {
        this._requestMaker = requestMaker
        this._credentialManager = credentialManager
        this._requestDefaults = requestDefaults
    }

    private getRegion(options: {region?: string}): string {
        return options.region ?? this._requestDefaults?.region ?? throwExpression('No default region')
    }

    private getShard(options: {shard?: string}): string {
        return options.shard ?? this._requestDefaults?.shard ?? throwExpression('No default shard')
    }

    private getPUUID(options: {puuid?: string}): string {
        return options.puuid ?? this._requestDefaults?.puuid ?? throwExpression('No default puuid')
    }

    private getVersion(options: {version?: string}): string {
        return options.version ?? this._requestDefaults?.version ?? throwExpression('No default version')
    }

    async getMatchHistory(options: ValorantMatchHistoryRequestOptions & ConditionallyOptionalDefaults<DefaultData, 'puuid' | 'shard'>): Promise<ValorantMatchHistoryResponse> {
        const params = new URLSearchParams()
        if(options.startIndex) params.set('startIndex', options.startIndex.toString())
        if(options.endIndex) params.set('endIndex', options.endIndex.toString())
        if(options.queue) params.set('queue', options.queue.toString())
        let paramsStr = params.toString()
        if(paramsStr.length > 0) paramsStr = '?' + paramsStr

        const url = `match-history/v1/history/${this.getPUUID(options)}${paramsStr}`

        return (await this._requestMaker.requestRemotePD(url, this.getShard(options), {
            headers: {
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement(),
                'Authorization': 'Bearer ' + await this._credentialManager.getToken()
            }
        })).json()
    }

    async getContent(options: ConditionallyOptionalDefaults<DefaultData, 'version' | 'shard'>): Promise<ValorantContentResponse> {
        return (await this._requestMaker.requestRemoteShared('content-service/v3/content', this.getShard(options), {
            headers: {
                'X-Riot-ClientPlatform': defaultPlatform,
                'X-Riot-ClientVersion': this.getVersion(options)
            }
        })).json()
    }

    async getAccountXP(options: ConditionallyOptionalDefaults<DefaultData, 'puuid' | 'shard'>): Promise<ValorantAccountXPResponse> {
        return (await this._requestMaker.requestRemotePD(`account-xp/v1/players/${this.getPUUID(options)}`, this.getShard(options), {
            headers: {
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement(),
                'Authorization': 'Bearer ' + await this._credentialManager.getToken()
            }
        })).json()
    }

    async getPlayerLoadout(options: ConditionallyOptionalDefaults<DefaultData, 'puuid' | 'shard'>): Promise<ValorantPlayerLoadoutResponse> {
        return (await this._requestMaker.requestRemotePD(`personalization/v2/players/${this.getPUUID(options)}/playerloadout`, this.getShard(options), {
            headers: {
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement(),
                'Authorization': 'Bearer ' + await this._credentialManager.getToken()
            }
        })).json()
    }

    async setPlayerLoadout(options: {
        loadout: Omit<ValorantPlayerLoadoutResponse, 'Subject' | 'Version'>
    } & ConditionallyOptionalDefaults<DefaultData, 'puuid' | 'shard'>): Promise<ValorantPlayerLoadoutResponse> {
        return (await this._requestMaker.requestRemotePD(`personalization/v2/players/${this.getPUUID(options)}/playerloadout`, this.getShard(options), {
            method: 'PUT',
            body: JSON.stringify(options.loadout),
            headers: {
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement(),
                'Authorization': 'Bearer ' + await this._credentialManager.getToken()
            }
        })).json()
    }

    async getMMR(options: ConditionallyOptionalDefaults<DefaultData, 'puuid' | 'shard' | 'version'>): Promise<ValorantMMRResponse> {
        return (await this._requestMaker.requestRemotePD(`mmr/v1/players/${this.getPUUID(options)}`, this.getShard(options), {
            headers: {
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement(),
                'Authorization': 'Bearer ' + await this._credentialManager.getToken(),
                'X-Riot-ClientPlatform': defaultPlatform,
                'X-Riot-ClientVersion': this.getVersion(options)
            }
        })).json()
    }

    async getMatchDetails(options: {matchID: string} & ConditionallyOptionalDefaults<DefaultData, 'shard'>): Promise<ValorantMatchDetailsResponse> {
        return (await this._requestMaker.requestRemotePD(`match-details/v1/matches/${options.matchID}`, this.getShard(options), {
            headers: {
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement(),
                'Authorization': 'Bearer ' + await this._credentialManager.getToken()
            }
        })).json()
    }

    async getCompetitiveUpdates(options: ConditionallyOptionalDefaults<DefaultData, 'puuid' | 'shard'>): Promise<ValorantCompetitiveUpdatesResponse> {
        return (await this._requestMaker.requestRemotePD(`mmr/v1/players/${this.getPUUID(options)}/competitiveupdates`, this.getShard(options), {
            headers: {
                'Authorization': 'Bearer ' + await this._credentialManager.getToken(),
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement(),
                'X-Riot-ClientPlatform': defaultPlatform
            }
        })).json()
    }

    async getLeaderboard(options: ValorantLeaderboardRequestOptions & ConditionallyOptionalDefaults<DefaultData, 'version' | 'shard'>): Promise<ValorantLeaderboardResponse> {
        const params = new URLSearchParams()
        params.set('startIndex', (options.startIndex ?? 0).toString())
        params.set('size', (options.size ?? 510).toString())
        if(options.query) params.set('query', options.query)

        const url = `mmr/v1/leaderboards/affinity/${this.getShard(options)}/queue/competitive/season/${options.seasonID}?${params.toString()}`

        return (await this._requestMaker.requestRemotePD(url, this.getShard(options), {
            headers: {
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement(),
                'X-Riot-ClientVersion': this.getVersion(options),
                'Authorization': 'Bearer ' + await this._credentialManager.getToken()
            }
        })).json()
    }

    async getConfig(options: ConditionallyOptionalDefaults<DefaultData, 'shard'>): Promise<ValorantConfigResponse> {
        return (await this._requestMaker.requestRemoteShared(`v1/config/${this.getShard(options)}`, this.getShard(options))).json()
    }

    async getWallet(options: ConditionallyOptionalDefaults<DefaultData, 'puuid' | 'shard'>): Promise<ValorantWalletResponse> {
        return (await this._requestMaker.requestRemotePD(`store/v1/wallet/${this.getPUUID(options)}`, this.getShard(options), {
            headers: {
                'Authorization': 'Bearer ' + await this._credentialManager.getToken(),
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement()
            }
        })).json()
    }

    async getPartyPlayer(options: ConditionallyOptionalDefaults<DefaultData, 'puuid' | 'shard' | 'region' | 'version'>): Promise<ValorantPartyFetchPlayerResponse> {
        return (await this._requestMaker.requestRemoteGLZ(`parties/v1/players/${this.getPUUID(options)}`, this.getShard(options), this.getRegion(options), {
            headers: {
                'Authorization': 'Bearer ' + await this._credentialManager.getToken(),
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement(),
                'X-Riot-ClientVersion': this.getVersion(options)
            }
        })).json()
    }

    async partyRemovePlayer(options: ConditionallyOptionalDefaults<DefaultData, 'puuid' | 'shard' | 'region'>): Promise<void> {
        return (await this._requestMaker.requestRemoteGLZ(`parties/v1/players/${this.getPUUID(options)}`, this.getShard(options), this.getRegion(options), {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + await this._credentialManager.getToken(),
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement()
            }
        })).json()
    }

    async getParty(options: {partyID: string} & ConditionallyOptionalDefaults<DefaultData, 'shard' | 'region'>): Promise<ValorantPartyResponse> {
        return (await this._requestMaker.requestRemoteGLZ(`parties/v1/parties/${options.partyID}`, this.getShard(options), this.getRegion(options), {
            headers: {
                'Authorization': 'Bearer ' + await this._credentialManager.getToken(),
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement()
            }
        })).json()
    }

    async partySetReady(options: {partyID: string, ready: boolean} & ConditionallyOptionalDefaults<DefaultData, 'puuid' | 'shard' | 'region'>): Promise<ValorantPartyResponse> {
        return (await this._requestMaker.requestRemoteGLZ(`parties/v1/parties/${options.partyID}/members/${this.getPUUID(options)}/setReady`,
            this.getShard(options), this.getRegion(options), {
            method: 'POST',
            body: JSON.stringify({ready: options.ready}),
            headers: {
                'Authorization': 'Bearer ' + await this._credentialManager.getToken(),
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement()
            }
        })).json()
    }

    async partyChangeQueue(options: {partyID: string, queueID: string} & ConditionallyOptionalDefaults<DefaultData, 'shard' | 'region'>): Promise<ValorantPartyResponse> {
        return (await this._requestMaker.requestRemoteGLZ(`parties/v1/parties/${options.partyID}/queue`, this.getShard(options), this.getRegion(options), {
                method: 'POST',
                body: JSON.stringify({queueID: options.queueID}),
                headers: {
                    'Authorization': 'Bearer ' + await this._credentialManager.getToken(),
                    'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement()
                }
            })).json()
    }

    async partyStartCustomGame(options: {partyID: string} & ConditionallyOptionalDefaults<DefaultData, 'shard' | 'region'>): Promise<ValorantPartyResponse> {
        return (await this._requestMaker.requestRemoteGLZ(`parties/v1/parties/${options.partyID}/startcustomgame`, this.getShard(options), this.getRegion(options), {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + await this._credentialManager.getToken(),
                    'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement()
                }
            })).json()
    }

    async partyJoinMatchmakingQueue(options: {partyID: string} & ConditionallyOptionalDefaults<DefaultData, 'shard' | 'region'>): Promise<ValorantPartyResponse> {
        return (await this._requestMaker.requestRemoteGLZ(`parties/v1/parties/${options.partyID}/matchmaking/join`, this.getShard(options), this.getRegion(options), {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + await this._credentialManager.getToken(),
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement()
            }
        })).json()
    }

    async partyLeaveMatchmakingQueue(options: {partyID: string} & ConditionallyOptionalDefaults<DefaultData, 'shard' | 'region'>): Promise<ValorantPartyResponse> {
        return (await this._requestMaker.requestRemoteGLZ(`parties/v1/parties/${options.partyID}/matchmaking/leave`, this.getShard(options), this.getRegion(options), {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + await this._credentialManager.getToken(),
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement()
            }
        })).json()
    }

    async partySetAccessibility(options: {partyID: string, accessibility: 'OPEN' | 'CLOSED'} & ConditionallyOptionalDefaults<DefaultData, 'shard' | 'region'>): Promise<ValorantPartyResponse> {
        return (await this._requestMaker.requestRemoteGLZ(`parties/v1/parties/${options.partyID}/accessibility`, this.getShard(options), this.getRegion(options), {
            method: 'POST',
            body: JSON.stringify({accessibility: options.accessibility}),
            headers: {
                'Authorization': 'Bearer ' + await this._credentialManager.getToken(),
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement()
            }
        })).json()
    }

    async partySetCustomGameSettings(options: {
        partyID: string,
        settings: ValorantPartyResponse['CustomGameData']['Settings']
    } & ConditionallyOptionalDefaults<DefaultData, 'shard' | 'region'>): Promise<ValorantPartyResponse> {
        return (await this._requestMaker.requestRemoteGLZ(`parties/v1/parties/${options.partyID}/customgamesettings`, this.getShard(options), this.getRegion(options), {
            method: 'POST',
            body: JSON.stringify(options.settings),
            headers: {
                'Authorization': 'Bearer ' + await this._credentialManager.getToken(),
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement()
            }
        })).json()
    }

    async partyInviteByDisplayName(options: {partyID: string, name: string, tag: string} & ConditionallyOptionalDefaults<DefaultData, 'shard' | 'region'>): Promise<ValorantPartyResponse> {
        return (await this._requestMaker.requestRemoteGLZ(`parties/v1/parties/${options.partyID}/invites/${options.name}/${options.tag}`, this.getShard(options), this.getRegion(options), {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + await this._credentialManager.getToken(),
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement()
            }
        })).json()
    }

    async partyRequestToJoin(options: {partyID: string} & ConditionallyOptionalDefaults<DefaultData, 'shard' | 'region'>): Promise<ValorantPartyResponse> {
        return (await this._requestMaker.requestRemoteGLZ(`parties/v1/parties/${options.partyID}/request`, this.getShard(options), this.getRegion(options), {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + await this._credentialManager.getToken(),
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement()
            }
        })).json()
    }

    async partyRequestDecline(options: {partyID: string, requestID: string} & ConditionallyOptionalDefaults<DefaultData, 'shard' | 'region'>): Promise<ValorantPartyResponse> {
        return (await this._requestMaker.requestRemoteGLZ(`parties/v1/parties/${options.partyID}/request/${options.requestID}/decline`, this.getShard(options), this.getRegion(options), {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + await this._credentialManager.getToken(),
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement()
            }
        })).json()
    }

    async partyGetCustomGameConfig(options: ConditionallyOptionalDefaults<DefaultData, 'shard' | 'region' | 'version'>): Promise<ValorantPartyCustomGameConfigsResponse> {
        return (await this._requestMaker.requestRemoteGLZ(`parties/v1/parties/customgameconfigs`, this.getShard(options), this.getRegion(options), {
            headers: {
                'X-Riot-ClientPlatform': defaultPlatform,
                'X-Riot-ClientVersion': this.getVersion(options)
            }
        })).json()
    }

    async currentGameFetchPlayer(options: ConditionallyOptionalDefaults<DefaultData, 'puuid' | 'shard' | 'region'>): Promise<ValorantCurrentGameFetchPlayerResponse> {
        return (await this._requestMaker.requestRemoteGLZ(`core-game/v1/players/${this.getPUUID(options)}`, this.getShard(options), this.getRegion(options), {
            headers: {
                'Authorization': 'Bearer ' + await this._credentialManager.getToken(),
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement()
            }
        })).json()
    }

    async currentGameFetchMatch(options: {matchID: string} & ConditionallyOptionalDefaults<DefaultData, 'shard' | 'region'>): Promise<ValorantCurrentGameFetchMatchResponse> {
        return (await this._requestMaker.requestRemoteGLZ(`core-game/v1/matches/${options.matchID}`, this.getShard(options), this.getRegion(options), {
            headers: {
                'Authorization': 'Bearer ' + await this._credentialManager.getToken(),
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement()
            }
        })).json()
    }

    async currentGameGetLoadouts(options: {matchID: string} & ConditionallyOptionalDefaults<DefaultData, 'shard' | 'region'>): Promise<ValorantCurrentGameLoadoutsResponse> {
        return (await this._requestMaker.requestRemoteGLZ(`core-game/v1/matches/${options.matchID}/loadouts`, this.getShard(options), this.getRegion(options), {
            headers: {
                'Authorization': 'Bearer ' + await this._credentialManager.getToken(),
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement()
            }
        })).json()
    }

    async quitCurrentGame(options: {matchID: string} & ConditionallyOptionalDefaults<DefaultData, 'puuid' | 'shard' | 'region'>): Promise<void> {
        return (await this._requestMaker.requestRemoteGLZ(`core-game/v1/players/${this.getPUUID(options)}/disassociate/${options.matchID}`,
            this.getShard(options), this.getRegion(options), {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + await this._credentialManager.getToken(),
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement()
            }
        })).json()
    }

    async pregameFetchPlayer(options: ConditionallyOptionalDefaults<DefaultData, 'puuid' | 'shard' | 'region'>): Promise<ValorantPregameGetPlayerResponse> {
        return (await this._requestMaker.requestRemoteGLZ(`pregame/v1/players/${this.getPUUID(options)}`, this.getShard(options), this.getRegion(options), {
            headers: {
                'Authorization': 'Bearer ' + await this._credentialManager.getToken(),
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement()
            }
        })).json()
    }

    async pregameFetchMatch(options: {matchID: string} & ConditionallyOptionalDefaults<DefaultData, 'shard' | 'region'>): Promise<ValorantPregameMatchResponse> {
        return (await this._requestMaker.requestRemoteGLZ(`pregame/v1/matches/${options.matchID}`, this.getShard(options), this.getRegion(options), {
            headers: {
                'Authorization': 'Bearer ' + await this._credentialManager.getToken(),
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement()
            }
        })).json()
    }

    async pregameSelectCharacter(options: {matchID: string, characterID: string} & ConditionallyOptionalDefaults<DefaultData, 'shard' | 'region'>): Promise<ValorantPregameMatchResponse> {
        return (await this._requestMaker.requestRemoteGLZ(`pregame/v1/matches/${options.matchID}/select/${options.characterID}`, this.getShard(options), this.getRegion(options), {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + await this._credentialManager.getToken(),
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement()
            }
        })).json()
    }

    async pregameLockCharacter(options: {matchID: string, characterID: string} & ConditionallyOptionalDefaults<DefaultData, 'shard' | 'region'>): Promise<ValorantPregameMatchResponse> {
        return (await this._requestMaker.requestRemoteGLZ(`pregame/v1/matches/${options.matchID}/lock/${options.characterID}`, this.getShard(options), this.getRegion(options), {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + await this._credentialManager.getToken(),
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement()
            }
        })).json()
    }

    async pregameQuitMatch(options: {matchID: string} & ConditionallyOptionalDefaults<DefaultData, 'shard' | 'region'>): Promise<ValorantPregameMatchResponse> {
        return (await this._requestMaker.requestRemoteGLZ(`pregame/v1/matches/${options.matchID}/quit`, this.getShard(options), this.getRegion(options), {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + await this._credentialManager.getToken(),
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement()
            }
        })).json()
    }
}
