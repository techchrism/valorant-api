import {PlatformInfo} from '../pvp/ValorantMatchDetailsResponse'

export interface PartyRequest {
    ID: string
    PartyID: string
    RequestedBySubject: string
    Subjects: string[]
    CreatedAt: string
    RefreshedAt: string
    ExpiresIn: number
}

export interface ValorantPartyFetchPlayerResponse {
    Subject: string
    Version: number
    CurrentPartyID: string
    Invites: null
    Requests: PartyRequest[]
    PlatformInfo: PlatformInfo
}
