import RequestMaker, {RequestMakerEvents} from './RequestMaker'
import { EventEmitter as EE } from 'ee-ts'
import fetch, {Response} from 'node-fetch'
import * as https from 'node:https'
import {promises as fs} from 'node:fs'
import * as path from 'node:path'
import { WebSocket } from 'ws'
import { Tail } from 'tail'

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
    private logTail?: Tail

    constructor() {
        super()
        this.localAgent = new https.Agent({
            rejectUnauthorized: false
        })
    }

    override _onEventHandled(key: string) {
        if(key === 'logMessage') {
            this.logTail = new Tail(path.join(process.env['LOCALAPPDATA']!, '/VALORANT/Saved/Logs/ShooterGame.log'), {
                useWatchFile: true,
                fsWatchOptions: {
                    interval: 250
                }
            })
            this.logTail.on('line', line => {
                this.emit('logMessage', line)
            })
        }
    }

    override _onEventUnhandled(key: string) {
        if(key === 'logMessage') {
            this.logTail!.unwatch()
        }
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

    requestLocal(resource: string): Promise<Response> {
        if(!this.localReady) throw new Error('Local not ready')

        return fetch(`https://127.0.0.1:${this.lockfileData!.port}/${resource}`, {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`riot:${this.lockfileData!.password}`).toString('base64')
            },
            agent: this.localAgent
        })
    }

    requestRemoteGLZ(resource: string, shard: string, region: string, init?: Object): Promise<Response> {
        return fetch(`https://glz-${region}-1.${shard}.a.pvp.net/${resource}`, init)
    }

    requestRemotePD(resource: string, shard: string, init?: Object): Promise<Response> {
        return fetch(`https://pd.${shard}.a.pvp.net/${resource}`, init)
    }

    requestRemoteShared(resource: string, shard: string, init?: Object): Promise<Response> {
        return fetch(`https://shared.${shard}.a.pvp.net/${resource}`, init)
    }
}
