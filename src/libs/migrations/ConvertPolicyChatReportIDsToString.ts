import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type PolicyKey = `${typeof ONYXKEYS.COLLECTION.POLICY}${string}`;

type OldPolicy = Policy & {
    chatReportIDAdmins?: string | number;
    chatReportIDAnnounce?: string | number;
};

type PolicyUpdate = {
    chatReportIDAdmins?: string;
    chatReportIDAnnounce?: string;
};

/**
 * This migration converts chatReportIDAdmins and chatReportIDAnnounce from number to string
 * to match the expected string type for report IDs.
 */
export default function () {
    return new Promise<void>((resolve) => {
        const connection = Onyx.connectWithoutView({
            key: ONYXKEYS.COLLECTION.POLICY,
            waitForCollectionCallback: true,
            callback: (policies: OnyxCollection<OldPolicy>) => {
                Onyx.disconnect(connection);

                if (!policies || isEmptyObject(policies)) {
                    Log.info('[Migrate Onyx] Skipped migration ConvertPolicyChatReportIDsToString because there are no policies');
                    return resolve();
                }

                // Find policies that have number type chatReportIDAdmins or chatReportIDAnnounce
                const policiesToMigrate = Object.entries(policies).filter(([, policy]) => {
                    if (!policy) {
                        return false;
                    }

                    const hasNumberAdminsReportID = typeof policy.chatReportIDAdmins === 'number';
                    const hasNumberAnnounceReportID = typeof policy.chatReportIDAnnounce === 'number';

                    return hasNumberAdminsReportID || hasNumberAnnounceReportID;
                });

                if (policiesToMigrate.length === 0) {
                    Log.info('[Migrate Onyx] Skipped migration ConvertPolicyChatReportIDsToString because no policies have number type chatReportIDs');
                    return resolve();
                }

                Log.info(`[Migrate Onyx] Running ConvertPolicyChatReportIDsToString migration for ${policiesToMigrate.length} policies`);

                const dataToSave = policiesToMigrate.reduce(
                    (acc, [policyKey, policy]) => {
                        if (!policy) {
                            return acc;
                        }

                        const update: PolicyUpdate = {};

                        if (typeof policy.chatReportIDAdmins === 'number') {
                            update.chatReportIDAdmins = String(policy.chatReportIDAdmins);
                            Log.info(
                                `[Migrate Onyx] ConvertPolicyChatReportIDsToString: Converting chatReportIDAdmins from ${policy.chatReportIDAdmins} to "${update.chatReportIDAdmins}" for policy ${policyKey}`,
                            );
                        }

                        if (typeof policy.chatReportIDAnnounce === 'number') {
                            update.chatReportIDAnnounce = String(policy.chatReportIDAnnounce);
                            Log.info(
                                `[Migrate Onyx] ConvertPolicyChatReportIDsToString: Converting chatReportIDAnnounce from ${policy.chatReportIDAnnounce} to "${update.chatReportIDAnnounce}" for policy ${policyKey}`,
                            );
                        }

                        acc[policyKey as PolicyKey] = update;

                        return acc;
                    },
                    {} as Record<PolicyKey, PolicyUpdate>,
                );

                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, dataToSave).then(() => {
                    Log.info(`[Migrate Onyx] Ran migration ConvertPolicyChatReportIDsToString and converted ${Object.keys(dataToSave).length} policies`);
                    resolve();
                });
            },
        });
    });
}
