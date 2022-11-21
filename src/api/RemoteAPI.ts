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
}
