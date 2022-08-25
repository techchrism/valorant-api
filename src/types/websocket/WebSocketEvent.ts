export interface WebSocketEvent<T> {
    body: {
        data: T
        eventType: string
        uri: string
    }
}
