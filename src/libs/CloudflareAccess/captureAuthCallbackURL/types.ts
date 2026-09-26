import type {AuthorizationCodeExchange} from '@libs/CloudflareAccess/OAuthClient';

type CloudflareSignInOutcome =
    /** Every normal boot, every native boot, and every boot without QA auth configured */
    | 'not-a-callback'
    /** The callback's code went to the exchange, whose failure is logged */
    | 'code-captured'
    /** State mismatch or no authorization code. Nothing was exchanged */
    | 'invalid-callback'
    /** Cloudflare reported an OAuth error (e.g. access_denied) */
    | 'provider-error'
    /** No stored flow in this tab: a replayed callback URL, or one opened in a different tab */
    | 'no-pending-flow';

type CapturedAuthCallback = {
    outcome: CloudflareSignInOutcome;
    errorMessage?: string;

    /** Set only when the callback passed every check and the exchange has been authorized but not run */
    exchange?: AuthorizationCodeExchange;
};

type CaptureCloudflareAuthCallbackURL = () => void;

type GetCapturedCloudflareAuthCallback = () => CapturedAuthCallback;

export type {CapturedAuthCallback, CaptureCloudflareAuthCallbackURL, CloudflareSignInOutcome, GetCapturedCloudflareAuthCallback};
