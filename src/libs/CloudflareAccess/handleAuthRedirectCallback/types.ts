type CloudflareAuthRedirectOutcome =
    /** Every normal boot, every native boot, and every boot without QA auth configured */
    | 'not-a-callback'
    /** The code exchange started; join it with getPendingCloudflareAuthCompletion() */
    | 'exchanging'
    /** State mismatch or no authorization code — nothing was exchanged */
    | 'invalid-callback'
    /** Cloudflare reported an OAuth error (e.g. access_denied) */
    | 'provider-error'
    /** No stored flow in this tab: a replayed callback URL, or one opened in a different tab */
    | 'no-pending-flow';

type CloudflareAuthRedirectResult = {
    outcome: CloudflareAuthRedirectOutcome;
    errorMessage?: string;
};

export type {CloudflareAuthRedirectOutcome, CloudflareAuthRedirectResult};
