import RequestMaker from '../RequestMaker'
import {CredentialManager} from '../credentialManager/CredentialManager'
import {ValorantHelpResponse} from '../types/api/local/ValorantHelpResponse'
import {ValorantExternalSessionsResponse} from '../types/api/local/ValorantExternalSessionsResponse'
import {ValorantUserInfoResponse} from '../types/api/local/ValorantUserInfoResponse'
import {ValorantClientRegionResponse} from '../types/api/local/ValorantClientRegionResponse'
import {ValorantActiveAliasResponse} from '../types/api/local/ValorantActiveAliasResponse'
import {ValorantSessionResponse} from '../types/api/local/ValorantSessionResponse'
import {ValorantFriendsResponse} from '../types/api/local/ValorantFriendsResponse'
import {ValorantPresence, ValorantPresenceResponse} from '../types/api/local/ValorantPresenceResponse'
import {atob} from 'iso-base64'
import {ValorantFriendRequestsResponse} from '../types/api/local/ValorantFriendRequestsResponse'
import {ValorantChatConversationsResponse} from '../types/api/local/ValorantChatConversationsResponse'
import {ValorantChatParticipantsResponse} from '../types/api/local/ValorantChatParticipantsResponse'
import {ValorantChatHistoryResponse} from '../types/api/local/ValorantChatHistoryResponse'

export class LocalAPI {
    private _requestMaker: RequestMaker
    private _credentialManager: CredentialManager

    constructor(requestMaker: RequestMaker, credentialManager: CredentialManager) {
        this._requestMaker = requestMaker
        this._credentialManager = credentialManager
    }

    async getLocalHelp(): Promise<ValorantHelpResponse> {
        return (await this._requestMaker.requestLocal('help')).json()
    }

    async getExternalSessions(): Promise<ValorantExternalSessionsResponse> {
        return (await this._requestMaker.requestLocal('external-sessions/v1/external-sessions')).json()
    }

    async getUserInfo(): Promise<ValorantUserInfoResponse> {
        const data = await (await this._requestMaker.requestLocal('rso-auth/v1/authorization/userinfo')).json()
        return {userInfo: JSON.parse(data['userInfo'])}
    }

    async getClientRegion(): Promise<ValorantClientRegionResponse> {
        return (await this._requestMaker.requestLocal('riotclient/region-locale')).json()
    }

    async getActiveAlias(): Promise<ValorantActiveAliasResponse> {
        return (await this._requestMaker.requestLocal('player-account/aliases/v1/active')).json()
    }

    async getSession(): Promise<ValorantSessionResponse> {
        return (await this._requestMaker.requestLocal('chat/v1/session')).json()
    }

    async getFriends(): Promise<ValorantFriendsResponse> {
        return (await this._requestMaker.requestLocal('chat/v4/friends')).json()
    }

    async getPresences(): Promise<ValorantPresenceResponse> {
        const data = await (await this._requestMaker.requestLocal('chat/v4/presences')).json()
        return {
            presences: data.presences.map((presence: any): ValorantPresence => {
                if(presence.private) {
                    try {
                        presence.private = JSON.parse(atob(presence.private))
                    } catch(ignored) {}
                }
                return presence
            })
        }
    }

    async getFriendRequests(): Promise<ValorantFriendRequestsResponse> {
        return (await this._requestMaker.requestLocal('chat/v4/friendrequests')).json()
    }

    async getPartyChatInfo(): Promise<ValorantChatConversationsResponse> {
        return (await this._requestMaker.requestLocal('chat/v6/conversations/ares-parties')).json()
    }

    async getPregameChatInfo(): Promise<ValorantChatConversationsResponse> {
        return (await this._requestMaker.requestLocal('chat/v6/conversations/ares-pregame')).json()
    }

    async getCurrentGameChatInfo(): Promise<ValorantChatConversationsResponse> {
        return (await this._requestMaker.requestLocal('chat/v6/conversations/ares-coregame')).json()
    }

    async getChatInfo(): Promise<ValorantChatConversationsResponse> {
        return (await this._requestMaker.requestLocal('chat/v6/conversations/')).json()
    }

    async getChatParticipants(cid?: string): Promise<ValorantChatParticipantsResponse> {
        let url = 'chat/v5/participants'
        if(cid) {
            const params = new URLSearchParams()
            params.set('cid', cid)
            url += '?' + params.toString()
        }
        return (await this._requestMaker.requestLocal(url)).json()
    }

    async getChatHistory(cid?: string): Promise<ValorantChatHistoryResponse> {
        let url = 'chat/v6/messages'
        if(cid) {
            const params = new URLSearchParams()
            params.set('cid', cid)
            url += '?' + params.toString()
        }
        return (await this._requestMaker.requestLocal(url)).json()
    }

    async sendChat(cid: string, message: string, whisper: boolean): Promise<ValorantChatHistoryResponse> {
        return (await this._requestMaker.requestLocal('chat/v6/messages', {
            method: 'POST',
            body: JSON.stringify({
                cid, message, type: whisper ? 'chat' : 'groupchat'
            })
        })).json()
    }
}
