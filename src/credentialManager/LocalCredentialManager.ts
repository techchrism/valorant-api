import {CredentialManager} from './CredentialManager'
import RequestMaker from '../RequestMaker'
import {atob} from 'iso-base64'

type TokenResponseData = {
    accessToken: string
    entitlements: []
    issuer: string
    subject: string
    token: string
}

interface ValorantJWTPayload {
    cid: string
    clm: string[]
    dat: {
        c: string
        lid: string
    }
    exp: number
    iat: number
    iss: string
    jti: string
    scp: string[]
    sub: string
}

// Subtracts this amount from expiration to avoid requesting resources with an about-to-expire cred
const expirationDiff = 60 * 1000

export class LocalCredentialManager implements CredentialManager {
    private _requestMaker: RequestMaker

    private _entitlement: string | null = null
    private _entitlementExpiration: number = 0

    private _token: string | null = null
    private _tokenExpiration: number = 0

    constructor(requestMaker: RequestMaker) {
        this._requestMaker = requestMaker
    }

    async getEntitlement(): Promise<string> {
        if(Date.now() > this._entitlementExpiration) await this._requestCredentials()
        return this._entitlement!
    }

    async getToken(): Promise<string> {
        if(Date.now() > this._tokenExpiration) await this._requestCredentials()
        return this._token!
    }

    private async _requestCredentials(): Promise<void> {
        if(!this._requestMaker.localReady) throw new Error('Local requests are not ready for credential manager')

        const data = (await (await this._requestMaker.requestLocal('entitlements/v1/token')).json()) as TokenResponseData
        this._token = data.accessToken
        this._entitlement = data.token

        const tokenJwtPayload = (JSON.parse(atob(this._token.split('.')[1])) as ValorantJWTPayload)
        this._tokenExpiration = (tokenJwtPayload.exp * 1000) - expirationDiff

        const entitlementJwtPayload = (JSON.parse(atob(this._entitlement.split('.')[1])) as ValorantJWTPayload)
        this._entitlementExpiration = (entitlementJwtPayload.exp * 1000) - expirationDiff
    }
}
