import type {AuthorizationCodeExchange} from '@libs/CloudflareAccess/OAuthClient';

type CloudflareSignInOutcome =
    /** Every normal boot, every native boot, and every boot without QA auth configured */
    | 'not-a-callback'
    | 'code-captured'
    | 'invalid-callback'
    /** Cloudflare reported an OAuth error (e.g. access_denied) */
    | 'provider-error'
    | 'no-pending-flow';

type CapturedAuthCallback = {
    outcome: CloudflareSignInOutcome;
    errorMessage?: string;
    exchange?: AuthorizationCodeExchange;
};

type CaptureCloudflareAuthCallbackURL = () => void;

type GetCapturedCloudflareAuthCallback = () => CapturedAuthCallback;

export type {CapturedAuthCallback, CaptureCloudflareAuthCallbackURL, CloudflareSignInOutcome, GetCapturedCloudflareAuthCallback};
