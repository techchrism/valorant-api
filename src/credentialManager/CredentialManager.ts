/**
 * A wrapper to manage Valorant entitlements and tokens
 * Handles request and renewal logic
 */
export interface CredentialManager {
    /**
     * Get the entitlement used for a request
     */
    getEntitlement: () => Promise<string>

    /**
     * Get the token used for a request
     */
    getToken: () => Promise<string>
}
