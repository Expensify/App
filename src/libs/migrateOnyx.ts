import Log from './Log';
import KeyReportActionsDraftByReportActionID from './migrations/KeyReportActionsDraftByReportActionID';
import RemoveEmptyReportActionsDrafts from './migrations/RemoveEmptyReportActionsDrafts';
import RenameReceiptFilename from './migrations/RenameReceiptFilename';
import TransactionBackupsToCollection from './migrations/TransactionBackupsToCollection';

export default function (): Promise<void> {
    const startTime = Date.now();
    Log.info('[Migrate Onyx] start');

    return new Promise((resolve) => {
        // Add all migrations to an array so they are executed in order
        const migrationPromises = [RenameReceiptFilename, KeyReportActionsDraftByReportActionID, TransactionBackupsToCollection, RemoveEmptyReportActionsDrafts];

        // Reduce all promises down to a single promise. All promises run in a linear fashion, waiting for the
        // previous promise to finish before moving onto the next one.
        /* eslint-disable arrow-body-style */
        migrationPromises
            .reduce((previousPromise, migrationPromise) => {
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
