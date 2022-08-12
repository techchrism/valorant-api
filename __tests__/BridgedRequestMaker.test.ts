import { BridgedRequestMaker } from '../src'
import { WebSocketServer, WebSocket } from 'ws'
import { Server, createServer } from 'http'
import { Socket } from 'net'
import { parse } from 'url'
import { EventEmitter as EE } from 'ee-ts'

export interface MockBridgeServerEvents {
    rootWSConnect(ws: WebSocket): void
    statusWSConnect(ws: WebSocket): void
    whitelistRequest(name: string, ws: WebSocket): void
}

// @ts-ignore
global.WebSocket = WebSocket

class MockBridgeServer extends EE<MockBridgeServerEvents> {
    private server: Server
    private sockets: Set<Socket>
    private rootWSS: WebSocketServer
    private statusWSS: WebSocketServer

    whitelisted: boolean = false
    localReady: boolean = false

    constructor() {
        super()
        this.sockets = new Set()
        this.server = createServer()
        this.rootWSS = new WebSocketServer({ noServer: true })
        this.statusWSS = new WebSocketServer({ noServer: true })

        this.server.on('connection', socket => {
            this.sockets.add(socket)

            socket.on('close', () => {
                this.sockets.delete(socket)
            })
        })

        this.server.on('upgrade', (request, socket, head) => {
            if(request.url === undefined) {
                socket.destroy()
                return
            }
            const pathname = parse(request.url).pathname?.replace(/\/$/, '')

            if(pathname === '') {
                this.rootWSS.handleUpgrade(request, socket, head, ws => {
                    this.rootWSS.emit('connection', ws, request)
                })
            } else if(pathname === '/proxy/status') {
                this.statusWSS.handleUpgrade(request, socket, head, ws => {
                    this.statusWSS.emit('connection', ws, request)
                })
            } else {
                socket.destroy()
            }
        })

        this.rootWSS.on('connection', ws => {
            this.emit('rootWSConnect', ws)
            ws.send(JSON.stringify({
                action: 'init',
                whitelisted: this.whitelisted
            }))

            ws.on('message', message => {
                let data
                try {
                    data = JSON.parse(message.toString())
                } catch(e) {
                    return
                }

                if(data['action'] === 'request') {
                    this.emit('whitelistRequest', data['name'], ws)
                }
            })
        })

        this.statusWSS.on('connection', ws => {
            this.emit('statusWSConnect', ws)
            ws.send(JSON.stringify({
                lockfileReady: this.localReady,
                logSize: 0
            }))
        })
    }

    async start(port: number = 12151, host: string = 'localhost'): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.server.listen({
                port, host
            }, () => {
                resolve()
            })
        })
    }

    async stop() {
        return new Promise<void>((resolve, reject) => {
            this.server.close(() => {
                resolve()
            })

            for(const ws of this.rootWSS.clients) {
                ws.close()
            }
            for(const ws of this.statusWSS.clients) {
                ws.close()
            }
        })
    }

    whitelistResponse(ws: WebSocket, accepted: boolean) {
        ws.send(JSON.stringify({
            action: 'requestResponse',
            response: accepted
        }))
    }

    updateStatus(ws: WebSocket, localReady: boolean) {
        ws.send(JSON.stringify({
            lockfileReady: localReady,
            logSize: 0
        }))
    }
}

async function timeoutPromise(delay: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, delay)
    })
}

let sandbox: any = {}

describe('BridgedRequestMaker', () => {
    test('Connect to bridge reject on pre-aborted signal', async () => {
        const requestMaker = new BridgedRequestMaker()
        const abortController = new AbortController()
        abortController.abort()

        await expect(requestMaker.connectToBridge(abortController.signal)).rejects.toEqual('Aborted')
    })

    describe('Connect to bridge', () => {
        beforeAll(() => {
            sandbox.requestMaker = new BridgedRequestMaker()
            sandbox.server = new MockBridgeServer()
        })

        afterAll(() => {
            delete sandbox.requestMaker
            delete sandbox.server
        })

        test('Websocket connection', async () => {
            sandbox.server.whitelisted = false
            const rootConnectFn = jest.fn()
            const bridgeStatusChangeFn = jest.fn()

            sandbox.server.on('rootWSConnect', rootConnectFn)
            sandbox.requestMaker.on('bridgeStatusChange', bridgeStatusChangeFn)

            await sandbox.server.start()

            const whitelisted = await sandbox.requestMaker.connectToBridge()
            expect(whitelisted).toBe(false)
            expect(bridgeStatusChangeFn).toHaveBeenLastCalledWith(true)
            expect(bridgeStatusChangeFn).toBeCalledTimes(1)
            expect(rootConnectFn).toBeCalledTimes(1)

            sandbox.server.off('rootWSConnect', rootConnectFn)
            sandbox.requestMaker.off('bridgeStatusChange', bridgeStatusChangeFn)
        })

        test('Bridge disconnection', async () => {
            const bridgeStatusChangeFn = jest.fn()
            sandbox.requestMaker.on('bridgeStatusChange', bridgeStatusChangeFn)

            await sandbox.server.stop()
            // Add delay to wait for socket closure functions
            await timeoutPromise(500)

            expect(bridgeStatusChangeFn).toHaveBeenLastCalledWith(false)
            expect(bridgeStatusChangeFn).toBeCalledTimes(1)
            sandbox.requestMaker.off('bridgeStatusChange', bridgeStatusChangeFn)
        })
    })
})
