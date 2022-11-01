export interface ExternalSession {
    exitCode: number
    exitReason: string | null
    isInternal: boolean
    launchConfiguration: {
        arguments: string[]
        executable: string
        locale: string
        voiceLocale: string | null
        workingDirectory: string
    }
    patchlineFullName: string
    patchlineId: string
    phase: string
    productId: string
    version: string
}

export interface ValorantExternalSessionsResponse {
    [key: string]: ExternalSession
}
