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
    /**
     * When the round trip left for Cloudflare, from its record, which the capture consumes. It ties the callback to
     * what started the round trip, such as the email the login form saved on Continue. Absent when no record matched
     */
    flowCreatedAt?: number;
};

type CaptureCloudflareAuthCallbackURL = () => void;

type GetCapturedCloudflareAuthCallback = () => CapturedAuthCallback;

export type {CapturedAuthCallback, CaptureCloudflareAuthCallbackURL, CloudflareSignInOutcome, GetCapturedCloudflareAuthCallback};
