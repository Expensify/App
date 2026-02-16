import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import type {OnyxValues} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';

export default function () {
    const ramOnlyKeys = [ONYXKEYS.IS_CHECKING_PUBLIC_ROOM, ONYXKEYS.UPDATE_AVAILABLE, ONYXKEYS.UPDATE_REQUIRED, ONYXKEYS.IS_SEARCHING_FOR_REPORTS, ONYXKEYS.WALLET_ONFIDO];
    // Onyx.init is called before this function, so if we remove a RAM-only key from Onyx storage, it's initial value will be lost.
    // We need to take initialKeyStates into account, so we can remove the newly migrated RAM-only key from storage, and then restore its initial value.
    const initialKeyStates: Partial<OnyxValues> = {};

    // Map each key to a migration promise
    const migrationPromises = ramOnlyKeys.map((key) => {
        return new Promise<void>((resolve) => {
            const connection = Onyx.connectWithoutView({
                key,
                callback: (value) => {
                    Onyx.disconnect(connection);

                    // Skip if empty or already migrated
                    if (value === undefined || value === null) {
                        Log.info(`[Migrate Onyx] Skipping ${key}: No action needed`);
                        return resolve();
                    }

                    Log.info(`[Migrate Onyx] Removing RAM-only key: ${key} from storage`);

                    // If a key is converted to RAM-only, its previous value might still be in storage.
                    // We set the value of that key to null, so it's removed from storage.
                    // eslint-disable-next-line rulesdir/prefer-actions-set-data
                    Onyx.merge(key, null).then(() => {
                        Log.info(`[Migrate Onyx] RAM-only key: ${key} removed from storage`);
                        resolve();
                    });

                    // Restore initial key state if necessary
                    if (initialKeyStates[key]) {
                        // eslint-disable-next-line rulesdir/prefer-actions-set-data
                        Onyx.merge(key, initialKeyStates[key]).then(() => {
                            Log.info(`[Migrate Onyx] RAM-only key: ${key} initial value restored`);
                            resolve();
                        });
                    }
                },
            });
        });
    });

    // Wait for all individual migrations to settle
    return Promise.all(migrationPromises).then(() => {
        Log.info('[Migrate Onyx] All RAM-only keys migrated successfully.');
    });
}
