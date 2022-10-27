import RequestMaker, {RequestMakerEvents} from './RequestMaker'
import {EventEmitter as EE} from 'ee-ts'
import fetch from 'node-fetch'
import {Response} from 'cross-fetch'
import * as https from 'node:https'
import * as fs from 'node:fs'
import * as path from 'node:path'
import {WebSocket} from 'ws'
import {Tail} from 'tail'
import * as process from 'node:process'

interface LockfileData {
    name: string
    pid: number
    port: number
    password: string
    protocol: string
}

export class NativeRequestMaker extends EE<RequestMakerEvents> implements RequestMaker {
    private readonly _localAgent: https.Agent
    private _lockfileData?: LockfileData
    private _logTail?: Tail
    private _watcher: fs.FSWatcher
    private readonly _lockfilePath: string
    private _previousLockfileData: string = ''

    constructor() {
        super()
        this._localAgent = new https.Agent({
            rejectUnauthorized: false
        })
        this._lockfilePath = path.join(process.env['LOCALAPPDATA']!, 'Riot Games\\Riot Client\\Config\\lockfile');
        this._watcher = fs.watch(path.dirname(this._lockfilePath), async (eventType, fileName) => {
            if(fileName !== 'lockfile') return

            if(eventType === 'rename' && this.localReady) {
                this._lockfileData = undefined
                this.emit('localStatusChange', false)
            } else if(eventType === 'change' && !this.localReady) {
                try {
                    await this.tryLoadLockfile()
                } catch(ignored) {}
            }
        })

        try {
            this.tryLoadLockfile().catch(ignored => {})
        } catch(ignored) {}
    }

    private async tryLoadLockfile() {
        const contents = await fs.promises.readFile(this._lockfilePath, 'utf8')
        if(contents === this._previousLockfileData) return
        this._previousLockfileData = contents

        const split = contents.split(':')
        this._lockfileData = {
            name: split[0],
            pid: parseInt(split[1]),
            port: parseInt(split[2]),
            password: split[3],
            protocol: split[4]
        }
        this.emit('localStatusChange', true)
    }

    override _onEventHandled(key: string) {
        if(key === 'logMessage') {
            this._logTail = new Tail(path.join(process.env['LOCALAPPDATA']!, '/VALORANT/Saved/Logs/ShooterGame.log'), {
                useWatchFile: true,
                fsWatchOptions: {
                    interval: 250
                }
            })
            this._logTail.on('line', line => {
                this.emit('logMessage', line)
            })
        }
    }

    override _onEventUnhandled(key: string) {
        if(key === 'logMessage') {
            this._logTail!.unwatch()
        }
    }

    getLocalWebsocket(): Promise<WebSocket> {
        if(!this.localReady) throw new Error('Local not ready')

        return Promise.resolve(new WebSocket(`wss://riot:${this._lockfileData!.password}@127.0.0.1:${this._lockfileData!.port}`, {
            rejectUnauthorized: false
        }));
    }

    getLog(): Promise<string> {
        return fs.promises.readFile(path.join(process.env['LOCALAPPDATA']!, '/VALORANT/Saved/Logs/ShooterGame.log'), 'utf-8')
    }

    get localReady(): boolean {
        return this._lockfileData !== undefined
    }

    get remoteReady(): boolean {
        return true
    }

    requestLocal(resource: string): Promise<Response> {
        if(!this.localReady) throw new Error('Local not ready')

        return fetch(`https://127.0.0.1:${this._lockfileData!.port}/${resource}`, {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`riot:${this._lockfileData!.password}`).toString('base64')
            },
            agent: this._localAgent
        }) as unknown as Promise<Response>
    }

    requestRemoteGLZ(resource: string, shard: string, region: string, init?: Object): Promise<Response> {
        return fetch(`https://glz-${region}-1.${shard}.a.pvp.net/${resource}`, init) as unknown as Promise<Response>
    }

    requestRemotePD(resource: string, shard: string, init?: Object): Promise<Response> {
        return fetch(`https://pd.${shard}.a.pvp.net/${resource}`, init) as unknown as Promise<Response>
    }

    requestRemoteShared(resource: string, shard: string, init?: Object): Promise<Response> {
        return fetch(`https://shared.${shard}.a.pvp.net/${resource}`, init) as unknown as Promise<Response>
    }
}
