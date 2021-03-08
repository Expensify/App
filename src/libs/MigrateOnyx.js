import promiseAllSettled from './promiseAllSettled';
import RenameActiveClientsKey from './migrations/RenameActiveClientsKey';

export default function () {
    const startTime = Date.now();
    console.debug('[Migrate Onyx] start');

    return new Promise((resolve) => {
        // Add all migrations to an array and execute them, they can execute in any order
        const migrationPromises = [
            RenameActiveClientsKey(),
        ];

        // Once all migrations are done, resolve the main promise so the app knows it's done
        promiseAllSettled(migrationPromises)
            .then(() => {
                const timeElapsed = Date.now() - startTime;
                console.debug(`[Migrate Onyx] finished in ${timeElapsed}ms`);
                resolve();
            });
    });
}
