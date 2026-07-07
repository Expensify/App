import clearWorkboxRecoveryCaches from '@libs/clearWorkboxRecoveryCaches';

/**
 * On web or mWeb, clear stale service worker and Cache Storage entries before reloading
 * so the user gets the latest bundle instead of a cached version that triggers Update Required.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function updateApp(isProduction: boolean) {
    clearWorkboxRecoveryCaches().then(() => window.location.reload());
}
