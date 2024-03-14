import Performance from '@libs/Performance';

// Once we receive the TII measurement we know that the app is initialized and ready to be used:
const appReady = new Promise<void>((resolve) => {
    Performance.subscribeToMeasurements((entry) => {
        if (entry.name !== 'TTI') {
            return;
        }

        resolve();
    });
});

export default appReady;
