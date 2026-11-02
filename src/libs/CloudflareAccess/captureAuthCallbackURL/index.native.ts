import type {CaptureCloudflareAuthCallbackURL, GetCapturedCloudflareAuthCallback} from './types';

const captureCloudflareAuthCallbackURL: CaptureCloudflareAuthCallbackURL = () => {};

const getCapturedCloudflareAuthCallback: GetCapturedCloudflareAuthCallback = () => ({outcome: 'not-a-callback'});

export {captureCloudflareAuthCallbackURL, getCapturedCloudflareAuthCallback};
