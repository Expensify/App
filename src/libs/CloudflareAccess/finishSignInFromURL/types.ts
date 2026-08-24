type CloudflareSignInOutcome =
    /** Every normal boot, every native boot, and every boot without QA auth configured */
    | 'not-a-callback'
    /** The code exchange started at boot. Terminal only for success or sign-out. A rejected exchange moves on to 'exchange-failed' */
    | 'exchanging'
    /** The exchange started and rejected. The reason is in errorMessage */
    | 'exchange-failed'
    /** State mismatch or no authorization code. Nothing was exchanged */
    | 'invalid-callback'
    /** Cloudflare reported an OAuth error (e.g. access_denied) */
    | 'provider-error'
    /** No stored flow in this tab: a replayed callback URL, or one opened in a different tab */
    | 'no-pending-flow';

type CloudflareSignInResult = {
    outcome: CloudflareSignInOutcome;
    errorMessage?: string;
};

/** Call once during boot, before any render. A no-op on every load that is not the callback */
type FinishCloudflareSignInFromURL = () => CloudflareSignInOutcome;

/** What the boot-time callback handling concluded, for UI that wants to surface a failed round trip */
type GetCloudflareSignInOutcome = () => CloudflareSignInResult;

export type {CloudflareSignInOutcome, FinishCloudflareSignInFromURL, GetCloudflareSignInOutcome};
