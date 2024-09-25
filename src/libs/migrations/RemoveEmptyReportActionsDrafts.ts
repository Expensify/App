import isEmpty from 'lodash/isEmpty';
import type {OnyxInputValue} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActionsDraft, ReportActionsDrafts} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ReportActionsDraftsKey = `${typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${string}`;

/**
 * This migration removes empty drafts from reportActionsDrafts, which was previously used to mark a draft as being non-existent (e.g. upon cancel).
 */
export default function (): Promise<void> {
    return new Promise<void>((resolve) => {
        const connection = Onyx.connect({
            key: ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS,
            waitForCollectionCallback: true,
            callback: (allReportActionsDrafts) => {
                Onyx.disconnect(connection);

                if (!allReportActionsDrafts) {
                    Log.info('[Migrate Onyx] Skipped migration RemoveEmptyReportActionsDrafts because there were no reportActionsDrafts');
                    return resolve();
                }

                const newReportActionsDrafts: Record<ReportActionsDraftsKey, OnyxInputValue<ReportActionsDrafts>> = {};
                Object.entries(allReportActionsDrafts).forEach(([onyxKey, reportActionDrafts]) => {
                    const newReportActionsDraftsForReport: Record<string, ReportActionsDraft> = {};

                    // Whether there is at least one draft in this report that has to be migrated
                    let hasUnmigratedDraft = false;

                    if (reportActionDrafts) {
                        Object.entries(reportActionDrafts).forEach(([reportActionID, reportActionDraft]) => {
                            // If the draft is a string, it means it hasn't been migrated yet
                            if (typeof reportActionDraft === 'string') {
                                hasUnmigratedDraft = true;
                                Log.info(`[Migrate Onyx] Migrating draft for report action ${reportActionID}`);

                                if (isEmpty(reportActionDraft)) {
                                    Log.info(`[Migrate Onyx] Removing draft for report action ${reportActionID}`);
                                    return;
                                }

                                newReportActionsDraftsForReport[reportActionID] = {message: reportActionDraft};
                            } else {
                                // We've already migrated this draft, so keep the existing value
                                newReportActionsDraftsForReport[reportActionID] = reportActionDraft;
                            }
                        });
                    }

                    if (isEmptyObject(newReportActionsDraftsForReport)) {
                        Log.info('[Migrate Onyx] NO REMAINING');
                        // Clear if there are no drafts remaining
                        newReportActionsDrafts[onyxKey as ReportActionsDraftsKey] = null;
                    } else if (hasUnmigratedDraft) {
                        // Only migrate if there are unmigrated drafts, there's no need to overwrite this onyx key with the same data
                        newReportActionsDrafts[onyxKey as ReportActionsDraftsKey] = newReportActionsDraftsForReport;
                    }
                });

                if (isEmptyObject(newReportActionsDrafts)) {
                    Log.info('[Migrate Onyx] Skipped migration RemoveEmptyReportActionsDrafts because there are no actions drafts to migrate');
                    return resolve();
                }

                Log.info(`[Migrate Onyx] Updating drafts for ${Object.keys(newReportActionsDrafts).length} reports`);
                Onyx.multiSet(newReportActionsDrafts).then(() => {
                    Log.info('[Migrate Onyx] Ran migration RemoveEmptyReportActionsDrafts successfully');
                    resolve();
                });
            },
        });
    });
}
