import type {CaptureCloudflareAuthCallbackURL, GetCapturedCloudflareAuthCallback} from './types';

const captureCloudflareAuthCallbackURL: CaptureCloudflareAuthCallbackURL = () => ({outcome: 'not-a-callback'});

const getCapturedCloudflareAuthCallback: GetCapturedCloudflareAuthCallback = () => ({outcome: 'not-a-callback'});

export {captureCloudflareAuthCallbackURL, getCapturedCloudflareAuthCallback};
