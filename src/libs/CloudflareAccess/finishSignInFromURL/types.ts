type CloudflareSignInOutcome =
    /** Every normal boot, every native boot, and every boot without QA auth configured */
    | 'not-a-callback'
    /** The code exchange started. Its own result is logged */
    | 'exchanging'
    /** State mismatch or no authorization code. Nothing was exchanged */
    | 'invalid-callback'
    /** Cloudflare reported an OAuth error (e.g. access_denied) */
    | 'provider-error'
    /** No stored flow in this tab: a replayed callback URL, or one opened in a different tab */
    | 'no-pending-flow';

/** A no-op on every load that is not the callback */
type FinishCloudflareSignInFromURL = () => CloudflareSignInOutcome;

export type {CloudflareSignInOutcome, FinishCloudflareSignInFromURL};
