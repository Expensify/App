import _ from 'underscore';
import Log from './Log';
import AddEncryptedAuthToken from './migrations/AddEncryptedAuthToken';
import RenameActiveClientsKey from './migrations/RenameActiveClientsKey';
import RenamePriorityModeKey from './migrations/RenamePriorityModeKey';
import MoveToIndexedDB from './migrations/MoveToIndexedDB';
import RenameExpensifyNewsStatus from './migrations/RenameExpensifyNewsStatus';
import AddLastVisibleActionCreated from './migrations/AddLastVisibleActionCreated';
import KeyReportActionsByReportActionID from './migrations/KeyReportActionsByReportActionID';

export default function () {
    const startTime = Date.now();
    Log.info('[Migrate Onyx] start');

    return new Promise((resolve) => {
        // Add all migrations to an array so they are executed in order
        const migrationPromises = [
            MoveToIndexedDB,
            RenameActiveClientsKey,
            RenamePriorityModeKey,
            AddEncryptedAuthToken,
            RenameExpensifyNewsStatus,
            AddLastVisibleActionCreated,
            KeyReportActionsByReportActionID,
        ];

        // Reduce all promises down to a single promise. All promises run in a linear fashion, waiting for the
        // previous promise to finish before moving onto the next one.
        /* eslint-disable arrow-body-style */
        _.reduce(migrationPromises, (previousPromise, migrationPromise) => {
            return previousPromise.then(() => {
                return migrationPromise();
            });
        }, Promise.resolve())

        // Once all migrations are done, resolve the main promise
            .then(() => {
                const timeElapsed = Date.now() - startTime;
                Log.info(`[Migrate Onyx] finished in ${timeElapsed}ms`);
                resolve();
            });
    });
}
