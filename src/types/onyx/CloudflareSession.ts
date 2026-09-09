/** OAuth session used to reach the Cloudflare Access-protected QA server */
type CloudflareSession = {
    /** Opaque `oauth:…` bearer token, ~15 min lifetime */
    accessToken: string;

    /** Rotates on every refresh, so it must always be persisted atomically together with accessToken */
    refreshToken: string;

    /** Epoch ms when accessToken expires */
    expiresAt: number;
};

export default CloudflareSession;
