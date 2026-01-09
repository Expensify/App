import type {OnyxEntry} from 'react-native-onyx';
import {isMovedTransactionAction, shouldReportActionBeVisible} from '@libs/ReportActionsUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions} from '@src/types/onyx';
import type {VisibleReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';

// DEBUG: Counter to track compute calls - remove after debugging
let computeCallCount = 0;

function getOrCreateReportVisibilityRecord(result: VisibleReportActionsDerivedValue, reportID: string): Record<string, boolean> {
    if (!result[reportID]) {
        // eslint-disable-next-line no-param-reassign
        result[reportID] = {};
    }
    return result[reportID];
}

function doesActionDependOnReportExistence(action: ReportAction): boolean {
    const isUnreportedTransaction = action.actionName === CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION;
    const isMovedTransaction = isMovedTransactionAction(action as OnyxEntry<ReportAction>);

    return isUnreportedTransaction || isMovedTransaction;
}

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS,
    // Note: REPORT and SESSION dependencies are needed to trigger recompute when reports change
    // (for UNREPORTED_TRANSACTION/MOVED_TRANSACTION visibility) or when user changes (for whisper targeting).
    // shouldReportActionBeVisible uses global Onyx-connected variables internally.
    dependencies: [ONYXKEYS.COLLECTION.REPORT_ACTIONS, ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.SESSION],
    compute: ([allReportActions], {sourceValues, currentValue}): VisibleReportActionsDerivedValue => {
        // DEBUG: Log compute calls - remove after debugging
        computeCallCount++;
        // eslint-disable-next-line no-console
        console.log(`[DERIVED COMPUTE] visibleReportActions #${computeCallCount}`, {
            trigger: sourceValues ? Object.keys(sourceValues).join(', ') : 'INITIAL',
            timestamp: new Date().toISOString(),
        });

        if (!allReportActions) {
            return {};
        }

        const reportActionsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT_ACTIONS];
        const reportUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT];
        const sessionUpdates = sourceValues?.[ONYXKEYS.SESSION];

        // Session change = user changed, need full recompute due to whisper targeting
        if (sessionUpdates) {
            const result: VisibleReportActionsDerivedValue = {};

            for (const [reportActionsKey, reportActions] of Object.entries(allReportActions)) {
                if (!reportActions) {
                    continue;
                }

                const reportID = reportActionsKey.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '');
                const reportVisibility = getOrCreateReportVisibilityRecord(result, reportID);

                for (const [actionID, action] of Object.entries(reportActions)) {
                    if (action) {
                        reportVisibility[actionID] = shouldReportActionBeVisible(action, actionID);
                    }
                }
            }

            return result;
        }

        // Only reports changed - recompute actions that depend on report existence
        if (reportUpdates && !reportActionsUpdates) {
            const result: VisibleReportActionsDerivedValue = currentValue ? {...currentValue} : {};

            for (const [reportActionsKey, reportActions] of Object.entries(allReportActions)) {
                if (!reportActions) {
                    continue;
                }

                const reportID = reportActionsKey.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '');
                const reportVisibility = getOrCreateReportVisibilityRecord(result, reportID);

                for (const [actionID, action] of Object.entries(reportActions)) {
                    if (!action) {
                        continue;
                    }

                    if (doesActionDependOnReportExistence(action)) {
                        reportVisibility[actionID] = shouldReportActionBeVisible(action, actionID);
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

            const reportVisibility = getOrCreateReportVisibilityRecord(result, reportID);

            const specificUpdates = reportActionsUpdates?.[reportActionsKey];
            const actionsToProcess = specificUpdates ? Object.entries(specificUpdates) : Object.entries(reportActions);

            for (const [actionID, action] of actionsToProcess) {
                if (!action) {
                    delete reportVisibility[actionID];
                    continue;
                }

                reportVisibility[actionID] = shouldReportActionBeVisible(action, actionID);
            }
        }

        return result;
    },
});
