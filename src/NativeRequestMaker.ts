import RequestMaker, {RequestMakerEvents} from './RequestMaker'
import { EventEmitter as EE } from 'ee-ts'
import fetch, {Response} from 'node-fetch'
import * as https from 'node:https'
import {promises as fs} from 'node:fs'
import * as path from 'node:path'
import { WebSocket } from 'ws'

interface LockfileData {
    name: string
    pid: number
    port: number
    password: string
    protocol: string
}

export class NativeRequestMaker extends EE<RequestMakerEvents> implements RequestMaker {
    private readonly localAgent: https.Agent
    private lockfileData?: LockfileData

    constructor() {
        super()
        this.localAgent = new https.Agent({
            rejectUnauthorized: false
        })
    }

    getLocalWebsocket(): Promise<WebSocket> {
        if(!this.localReady) throw new Error('Local not ready')

        return Promise.resolve(new WebSocket(`wss://riot:${this.lockfileData!.password}@127.0.0.1:${this.lockfileData!.port}`, {
            rejectUnauthorized: false
        }));
    }

    getLog(): Promise<string> {
        return fs.readFile(path.join(process.env['LOCALAPPDATA']!, '/VALORANT/Saved/Logs/ShooterGame.log'), 'utf-8')
    }

    get localReady(): boolean {
        return this.lockfileData !== undefined
    }

    get remoteReady(): boolean {
        return true
    }

    requestLocal(resource: string | Request): Promise<Response> {
        if(!this.localReady) throw new Error('Local not ready')

        return fetch(`https://127.0.0.1:${this.lockfileData!.port}/${resource}`, {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`riot:${this.lockfileData!.password}`).toString('base64')
            },
            agent: this.localAgent
        })
    }

    requestRemoteGLZ(resource: string | Request, shard: string, region: string, init?: Object): Promise<Response> {
        return fetch(`https://glz-${region}-1.${shard}.a.pvp.net/${resource}`, init)
    }

    requestRemotePD(resource: string | Request, shard: string, init?: Object): Promise<Response> {
        return fetch(`https://pd.${shard}.a.pvp.net/${resource}`, init)
    }

    requestRemoteShared(resource: string | Request, shard: string, init?: Object): Promise<Response> {
        return fetch(`https://shared.${shard}.a.pvp.net/${resource}`, init)
    }
}
