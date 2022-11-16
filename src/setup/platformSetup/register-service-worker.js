/* eslint-disable no-console */
/* eslint-disable @lwc/lwc/no-async-await */

export default async function () {
    if (!('serviceWorker' in navigator)) {
        return;
    }

    console.log('Registering service worker...');
    try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
            scope: '/',
        });
        if (registration.installing) {
            console.log('Service worker installing');
        } else if (registration.waiting) {
            console.log('Service worker installed');
        } else if (registration.active) {
            console.log('Service worker active');
        }
    } catch (error) {
        console.error(`Registration failed with ${error}`);
    }
}
