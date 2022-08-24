import { EventEmitter as EE } from 'ee-ts'
import {WebSocket} from 'isomorphic-ws'
import {Response} from 'cross-fetch'

export interface RequestMakerEvents {
    /**
     * Emitted when the request maker remote status changes
     * @param ready True if remote requests are capable, false otherwise
     */
    remoteStatusChange(ready: boolean): void

    /**
     * Emitted when the request maker local status changes
     * @param ready True if local requests are capable, false otherwise
     */
    localStatusChange(ready: boolean): void

    /**
     * Emitted when there is a new line in the Valorant log file
     * This may be called multiple times in the same event loop cycle if a log chunk with multiple lines is received
     * @param line The line of text from the log file
     */
    logMessage(line: string): void
}

/**
 * An interface for exposing low-level Valorant API functionality
 * This is intended to be extended by a Node.JS implementation or a browser implementation using the Valorant API bridge
 */
export default interface RequestMaker<T = {}> extends EE<T & RequestMakerEvents> {

    /**
     * Whether the request maker is capable of making local API requests
     * To listen for update events, use the localStatusChange event
     */
    get localReady(): boolean

    /**
     * Whether the request maker is capable of making remote API requests
     * To listen for update events, use the remoteStatusChange event
     */
    get remoteReady(): boolean

    /**
     * Connects to and returns the local websocket, if available
     */
    getLocalWebsocket(): Promise<WebSocket>

    /**
     * Returns a promise that resolves with the full content of the Valorant log file
     * To get future updates after the initial call, use the logMessage event
     */
    getLog(): Promise<string>

    /**
     * Make a local API request to the provided resource
     * To request the url "https://127.0.0.1:{lockfile port}/help", use "help" as the resource
     * @param resource The resource to request, appended to the local API base URL. Do not include a leading slash.
     * @returns A promise that resolves with the response object
     */
    requestLocal(resource: string): Promise<Response>

    /**
     * Make a remote "glz" API request to the provided resource
     * To request the url "https://glz-na-1.na.a.pvp.net/core-game/v1/players/puuid",
     * use "core-game/v1/players/puuid" as the resource and "na" as both the region and the shard.
     * Region occurs first in the glz url, followed by the shard.
     * @param resource The resource to request, appended to the GLZ API URL. Do not include a leading slash.
     * @param shard The shard to use for the request
     * @param region The region to use for the request
     * @param init Optional init object for the fetch request
     * @returns A promise that resolves with the response object
     */
    requestRemoteGLZ(resource: string, shard: string, region: string, init?: Object): Promise<Response>

    /**
     * Make a remote "pd" API request to the provided resource
     * To request the url "https://pd.na.a.pvp.net/mmr/v1/players/puuid",
     * use "mmr/v1/players/puuid" as the resource and "na" as the region.
     * @param resource The resource to request, appended to the PD API URL. Do not include a leading slash.
     * @param shard The shard to use for the request
     * @param init Optional init object for the fetch request
     * @returns A promise that resolves with the response object
     */
    requestRemotePD(resource: string, shard: string, init?: Object): Promise<Response>

    /**
     * Make a remote "shared" API request to the provided resource
     * To request the url "https://shared.na.a.pvp.net/content-service/v3/content",
     * use "content-service/v3/content" as the resource and "na" as the region.
     * @param resource The resource to request, appended to the shared API URL. Do not include a leading slash.
     * @param shard The shard to use for the request
     * @param init Optional init object for the fetch request
     * @returns A promise that resolves with the response object
     */
    requestRemoteShared(resource: string, shard: string, init?: Object): Promise<Response>
}
