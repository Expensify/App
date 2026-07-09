import {isActionableWhisperRequiringWritePermission, isConciergeCategoryOptions, shouldReportActionBeVisible} from '@libs/ReportActionsUtils';

import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions} from '@src/types/onyx';
import type {VisibleReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';

/**
 * Returns true if the action's visibility depends on runtime context that can't be cached,
 * such as write permissions or policy settings.
 */
function shouldSkipCachingAction(action: ReportAction): boolean {
    return isActionableWhisperRequiringWritePermission(action) || isConciergeCategoryOptions(action);
}

/**
 * Builds a report's action-visibility map (keyed by `reportActionID`) from its full set of report
 * actions. Rebuilding the whole map rather than updating individual entries keeps deletions correct:
 * a removed action is absent from `reportActions`, so it drops out of the result.
 */
function computeReportVisibility(reportActions: ReportActions): Record<string, boolean> {
    const reportVisibility: Record<string, boolean> = {};

    for (const [actionID, action] of Object.entries(reportActions)) {
        if (!action) {
            continue;
        }
        // Skip deprecated keys (e.g. sequenceNumber-keyed duplicates) so they
        // cannot overwrite the canonical entry's visibility with false.
        if (actionID !== action.reportActionID) {
            continue;
        }
        if (shouldSkipCachingAction(action)) {
            continue;
        }
        reportVisibility[action.reportActionID] = shouldReportActionBeVisible(action, actionID, undefined);
    }

    return reportVisibility;
}

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS,
    // Note: REPORT dependency is needed both to trigger recompute when reports change
    // (for UNREPORTED_TRANSACTION/MOVED_TRANSACTION visibility) AND to provide the current
    // report collection to the visibility check, avoiding stale data from global connections.
    // SESSION dependency is needed for whisper targeting when user changes.
    dependencies: [ONYXKEYS.COLLECTION.REPORT_ACTIONS, ONYXKEYS.SESSION],
    compute: ([allReportActions], {sourceValues, currentValue, triggeredKeys}): VisibleReportActionsDerivedValue => {
        if (!allReportActions) {
            return {};
        }

        const reportActionsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT_ACTIONS];

        // Recompute only the reports whose actions changed when we have a usable delta. Otherwise
        // recompute everything: on first load, when there's no delta, or on a SESSION change (the
        // user changed, which affects whisper targeting for every report). SESSION is checked via
        // triggeredKeys, not sourceValues, so a session cleared to `undefined` still forces the full recompute.
        const isIncremental = !!reportActionsUpdates && !triggeredKeys?.has(ONYXKEYS.SESSION) && !!currentValue;

        const result: VisibleReportActionsDerivedValue = isIncremental ? {...currentValue} : {};
        const reportActionsKeysToProcess = isIncremental ? Object.keys(reportActionsUpdates) : Object.keys(allReportActions);

        for (const reportActionsKey of reportActionsKeysToProcess) {
            const reportID = reportActionsKey.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '');
            const reportActions = allReportActions[reportActionsKey];

            // The member was removed entirely — drop the report from the result.
            if (!reportActions) {
                delete result[reportID];
                continue;
            }

            result[reportID] = computeReportVisibility(reportActions);
        }

        return result;
    },
});
