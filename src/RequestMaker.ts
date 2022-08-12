import { EventEmitter as EE } from 'ee-ts'

export interface RequestMakerEvents {
    remoteStatusChange(ready: boolean): void
    localStatusChange(ready: boolean): void
    logMessage(line: string): void
}

export default interface RequestMaker<T = {}> extends EE<T & RequestMakerEvents> {

    get localReady(): boolean
    get remoteReady(): boolean

    getLocalWebsocket(): Promise<WebSocket>
    getLog(): Promise<string>
    requestLocal(resource: string | Request): Promise<Response>
    requestRemoteGLZ(resource: string | Request, shard: string, region: string, init?: Object): Promise<Response>
    requestRemotePD(resource: string | Request, shard: string, init?: Object): Promise<Response>
    requestRemoteShared(resource: string | Request, shard: string, init?: Object): Promise<Response>
}
