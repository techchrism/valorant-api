import RequestMaker from '../RequestMaker'
import {CredentialManager} from '../credentialManager/CredentialManager'
import {ValorantMatchHistoryResponse} from '../types/api/pvp/ValorantMatchHistoryResponse'
import {ValorantMatchHistoryRequestOptions} from '../types/api/pvp/ValorantMatchHistoryRequestOptions'

export class PvPAPI {
    private _requestMaker: RequestMaker
    private _credentialManager: CredentialManager

    constructor(requestMaker: RequestMaker, credentialManager: CredentialManager) {
        this._requestMaker = requestMaker
        this._credentialManager = credentialManager
    }

    async getMatchHistory(shard: string, puuid: string, options?: ValorantMatchHistoryRequestOptions): Promise<ValorantMatchHistoryResponse> {
        const params = new URLSearchParams()
        if(options) {
            if(options.startIndex) params.set('startIndex', options.startIndex.toString())
            if(options.endIndex) params.set('endIndex', options.endIndex.toString())
            if(options.queue) params.set('queue', options.queue.toString())
        }
        let paramsStr = params.toString()
        if(paramsStr.length > 0) paramsStr = '?' + paramsStr

        const url = `match-history/v1/history/${puuid}${paramsStr}`

        return (await this._requestMaker.requestRemotePD(url, shard, {
            headers: {
                'X-Riot-Entitlements-JWT': await this._credentialManager.getEntitlement(),
                'Authorization': 'Bearer ' + await this._credentialManager.getToken()
            }
        })).json()
    }
}
