/**
 * Unregisters every service worker on this origin. Pages the worker already controls keep it until they close.
 */
async function unregisterServiceWorkers(): Promise<void> {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
        return;
    }
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
}

export default unregisterServiceWorkers;
