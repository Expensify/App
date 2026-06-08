import {Platform} from 'react-native';
import Log from '@libs/Log';

/**
 * Clears all Cache Storage entries for this origin and unregisters every
 * service worker. Used when the user runs Troubleshoot > Clear cache and
 * restart so Workbox precache/runtime caches do not survive that recovery
 * path (stale app shell / chunks would otherwise keep serving from SW).
 */
async function clearWorkboxRecoveryCaches(): Promise<void> {
    // Normally platform-specific behaviour is achieved with .native.ts / .ts file pairs.
    // A .native.ts stub was tried here but the Jest test environment (jsdom, testEnvironment
    // in jest.config.js) resolves both web and native imports to the same .ts file, so the
    // stub was ignored and the test called real Cache Storage / ServiceWorker APIs that don't
    // exist in jsdom, breaking the clearOnyxAndResetApp test. An explicit Platform.OS guard
    // keeps the code in a single file while being safe in all three environments:
    // web (browser), native (iOS/Android), and the Jest jsdom test runner.
    if (Platform.OS !== 'web') {
        return;
    }

    if (typeof caches !== 'undefined') {
        try {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map((name) => caches.delete(name)));
        } catch (error) {
            Log.warn('[SW] Failed to clear Cache Storage during app reset', {error});
        }
    }

    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
        return;
    }

    try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
    } catch (error) {
        Log.warn('[SW] Failed to unregister service workers during app reset', {error});
    }
}

export default clearWorkboxRecoveryCaches;
