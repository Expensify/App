import Log from './Log';
import KeyReportActionsDraftByReportActionID from './migrations/KeyReportActionsDraftByReportActionID';
import MoveIsOptimisticReportToMetadata from './migrations/MoveIsOptimisticReportToMetadata';
import NVPMigration from './migrations/NVPMigration';
import PendingMembersToMetadata from './migrations/PendingMembersToMetadata';
import PronounsMigration from './migrations/PronounsMigration';
import RemoveEmptyReportActionsDrafts from './migrations/RemoveEmptyReportActionsDrafts';
import RenameCardIsVirtual from './migrations/RenameCardIsVirtual';
import RenameReceiptFilename from './migrations/RenameReceiptFilename';
import TransactionBackupsToCollection from './migrations/TransactionBackupsToCollection';

export default function () {
    const startTime = Date.now();
    Log.info('[Migrate Onyx] start');

    return new Promise<void>((resolve) => {
        // Add all migrations to an array so they are executed in order
        const migrationPromises = [
            RenameCardIsVirtual,
            RenameReceiptFilename,
            KeyReportActionsDraftByReportActionID,
            TransactionBackupsToCollection,
            RemoveEmptyReportActionsDrafts,
            NVPMigration,
            PronounsMigration,
            MoveIsOptimisticReportToMetadata,
            PendingMembersToMetadata,
        ];

        // Reduce all promises down to a single promise. All promises run in a linear fashion, waiting for the
        // previous promise to finish before moving onto the next one.
        /* eslint-disable arrow-body-style */
        migrationPromises
            .reduce<Promise<void | void[]>>((previousPromise, migrationPromise) => {
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
