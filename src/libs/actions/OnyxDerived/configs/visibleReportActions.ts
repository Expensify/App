import type {OnyxEntry} from 'react-native-onyx';
import {isActionableWhisperRequiringWritePermission, isConciergeCategoryOptions, shouldReportActionBeVisible} from '@libs/ReportActionsUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions} from '@src/types/onyx';
import type {VisibleReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';

function getOrCreateReportVisibilityRecord(result: VisibleReportActionsDerivedValue, reportID: string, clonedReportIDs: Set<string>): Record<string, boolean> {
    if (!result[reportID]) {
        // Parameter reassignment is necessary here because we are building up the derived value
        // object incrementally as we process report actions. Creating a new object would break
        // the reference chain and lose previously computed visibility data.
        // eslint-disable-next-line no-param-reassign
        result[reportID] = {};
        clonedReportIDs.add(reportID);
    } else if (!clonedReportIDs.has(reportID)) {
        // Clone the existing entry to avoid mutating the cached value
        // eslint-disable-next-line no-param-reassign
        result[reportID] = {...result[reportID]};
        clonedReportIDs.add(reportID);
    }
    return result[reportID];
}

/**
 * Returns true if the action's visibility depends on runtime context that can't be cached,
 * such as write permissions or policy settings.
 */
function shouldSkipCachingAction(action: ReportAction): boolean {
    return isActionableWhisperRequiringWritePermission(action) || isConciergeCategoryOptions(action);
}

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS,
    // Note: REPORT dependency is needed both to trigger recompute when reports change
    // (for UNREPORTED_TRANSACTION/MOVED_TRANSACTION visibility) AND to provide the current
    // report collection to the visibility check, avoiding stale data from global connections.
    // SESSION dependency is needed for whisper targeting when user changes.
    // NETWORK is needed to recompute when online/offline status changes (for DELETE action visibility).
    dependencies: [ONYXKEYS.COLLECTION.REPORT_ACTIONS, ONYXKEYS.SESSION, ONYXKEYS.NETWORK],
    compute: ([allReportActions], {sourceValues, currentValue}): VisibleReportActionsDerivedValue => {
        if (!allReportActions) {
            return {};
        }

        const reportActionsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT_ACTIONS];
        const sessionUpdates = sourceValues?.[ONYXKEYS.SESSION];
        const networkUpdates = sourceValues?.[ONYXKEYS.NETWORK];

        // Track which reportID entries have been cloned to avoid mutating cached nested objects.
        const clonedReportIDs = new Set<string>();

        // Session change = user changed, need full recompute due to whisper targeting
        // Network change = online/offline status changed, need full recompute for DELETE action visibility
        if (sessionUpdates || networkUpdates) {
            const result: VisibleReportActionsDerivedValue = {};

            for (const [reportActionsKey, reportActions] of Object.entries(allReportActions)) {
                if (!reportActions) {
                    continue;
                }

                const reportID = reportActionsKey.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '');
                const reportVisibility = getOrCreateReportVisibilityRecord(result, reportID, clonedReportIDs);

                for (const [actionID, action] of Object.entries(reportActions)) {
                    if (action) {
                        if (actionID !== action.reportActionID) {
                            continue;
                        }
                        if (shouldSkipCachingAction(action)) {
                            continue;
                        }
                        reportVisibility[action.reportActionID] = shouldReportActionBeVisible(action, actionID, undefined, reportActions);
                    }
                }
            }

            return result;
        }

        const result: VisibleReportActionsDerivedValue = currentValue ? {...currentValue} : {};

        const reportActionsToProcess = reportActionsUpdates ? Object.keys(reportActionsUpdates) : Object.keys(allReportActions);

        for (const reportActionsKey of reportActionsToProcess) {
            const reportActions: OnyxEntry<ReportActions> = allReportActions[reportActionsKey];
            const reportID = reportActionsKey.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '');

            if (!reportActions) {
                delete result[reportID];
                continue;
            }

            const reportVisibility = getOrCreateReportVisibilityRecord(result, reportID, clonedReportIDs);

            const specificUpdates = reportActionsUpdates?.[reportActionsKey];
            const actionIDsToProcess = specificUpdates ? Object.keys(specificUpdates) : Object.keys(reportActions);

            for (const actionID of actionIDsToProcess) {
                if (specificUpdates && specificUpdates[actionID] === null) {
                    delete reportVisibility[actionID];
                    continue;
                }

                const action = reportActions[actionID];
                if (!action) {
                    delete reportVisibility[actionID];
                    continue;
                }

                // Skip deprecated keys (e.g. sequenceNumber-keyed duplicates) so they
                // cannot overwrite the canonical entry's visibility with false.
                if (actionID !== action.reportActionID) {
                    delete reportVisibility[actionID];
                    continue;
                }

                if (shouldSkipCachingAction(action)) {
                    delete reportVisibility[action.reportActionID];
                    continue;
                }

                reportVisibility[action.reportActionID] = shouldReportActionBeVisible(action, actionID, undefined, reportActions);
            }
        }

        return result;
    },
});
