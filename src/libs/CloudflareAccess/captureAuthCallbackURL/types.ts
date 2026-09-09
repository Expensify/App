import type {CloudflareSignInOutcome} from '@libs/CloudflareAccess/finishSignInFromURL/types';

type AuthorizedCodeExchange = {
    code: string;
    codeVerifier: string;
};

type CapturedAuthCallback = {
    outcome: CloudflareSignInOutcome;
    errorMessage?: string;

    /** Set only when the callback passed every check and the exchange has been authorized but not run */
    exchange?: AuthorizedCodeExchange;
};

type CaptureCloudflareAuthCallbackURL = () => CapturedAuthCallback;

type GetCapturedCloudflareAuthCallback = () => CapturedAuthCallback;

export type {CapturedAuthCallback, CaptureCloudflareAuthCallbackURL, GetCapturedCloudflareAuthCallback};
