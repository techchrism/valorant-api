import RequestMaker from '../RequestMaker'
import {CredentialManager} from '../credentialManager/CredentialManager'
import {ValorantMatchHistoryResponse} from '../types/api/pvp/ValorantMatchHistoryResponse'
import {ValorantMatchHistoryRequestOptions} from '../types/api/pvp/ValorantMatchHistoryRequestOptions'

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

export class RemoteAPI<DefaultData extends RemoteAPIDefaults | undefined = undefined> {
    private _requestMaker: RequestMaker
    private _credentialManager: CredentialManager
    private _requestDefaults: DefaultData

    constructor(requestMaker: RequestMaker, credentialManager: CredentialManager, requestDefaults: DefaultData) {
        this._requestMaker = requestMaker
        this._credentialManager = credentialManager
        this._requestDefaults = requestDefaults
    }

    private getShard(options: {shard?: string}): string {
        return options.shard ?? this._requestDefaults?.shard ?? throwExpression('No default shard')
    }

    private getPUUID(options: {puuid?: string}): string {
        return options.puuid ?? this._requestDefaults?.puuid ?? throwExpression('No default puuid')
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
}
