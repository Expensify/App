import AddEncryptedAuthToken from './migrations/AddEncryptedAuthToken';
import RenameActiveClientsKey from './migrations/RenameActiveClientsKey';
import RenamePriorityModeKey from './migrations/RenamePriorityModeKey';

export default function () {
    const startTime = Date.now();
    console.debug('[Migrate Onyx] start');

    return new Promise((resolve) => {
        // Add all migrations to an array so they are executed in order
        const migrationPromises = [
            RenameActiveClientsKey,
            RenamePriorityModeKey,
            AddEncryptedAuthToken,
        ];

        // Reduce all promises down to a single promise. All promises run in a linear fashion, waiting for the
        // previous promise to finish before moving onto the next one.
        migrationPromises
            /* eslint-disable arrow-body-style */
            .reduce((previousPromise, migrationPromise) => {
                return previousPromise.then(() => {
                    return migrationPromise();
                });
            }, Promise.resolve())
            /* eslint-enable arrow-body-style */

            // Once all migrations are done, resolve the main promise
            .then(() => {
                const timeElapsed = Date.now() - startTime;
                console.debug(`[Migrate Onyx] finished in ${timeElapsed}ms`);
                resolve();
            });
    });
}
