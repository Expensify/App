import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {
    getOriginalMessage,
    getWhisperedTo,
    isActionableCardFraudAlert,
    isActionableJoinRequestPendingReportAction,
    isActionableMentionWhisper,
    isActionableReportMentionWhisper,
    isActionableWhisper,
    isDeletedAction,
    isDeletedParentAction,
    isMarkAsClosedAction,
    isMovedTransactionAction,
    isPendingRemove,
    isReportActionDeprecated,
    isResolvedActionableWhisper,
    isReversedTransaction,
    isTravelUpdate,
    isTripPreview,
    isVisiblePreviewOrMoneyRequest,
    isWhisperAction,
} from '@libs/ReportActionsUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';
import type {VisibleReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';
import type {OriginalMessageMovedTransaction, OriginalMessageUnreportedTransaction} from '@src/types/onyx/OriginalMessage';
import type ReportActionName from '@src/types/onyx/ReportActionName';

const {POLICY_CHANGE_LOG: policyChangelogTypes, ROOM_CHANGE_LOG: roomChangeLogTypes, ...otherActionTypes} = CONST.REPORT.ACTIONS.TYPE;
const supportedActionTypes = new Set<ReportActionName>([...Object.values(otherActionTypes), ...Object.values(policyChangelogTypes), ...Object.values(roomChangeLogTypes)]);

function getOrCreateReportVisibilityRecord(result: VisibleReportActionsDerivedValue, reportID: string): Record<string, boolean> {
    if (!result[reportID]) {
        // eslint-disable-next-line no-param-reassign
        result[reportID] = {};
    }
    return result[reportID];
}

function isUnreportedTransactionVisible(reportAction: ReportAction, allReports: OnyxCollection<Report>): boolean {
    const originalMessage = getOriginalMessage(reportAction) as OriginalMessageUnreportedTransaction | undefined;

    if (!originalMessage?.fromReportID) {
        return false;
    }

    const fromReportKey = `${ONYXKEYS.COLLECTION.REPORT}${originalMessage.fromReportID}`;
    const fromReport = allReports?.[fromReportKey];

    return !!fromReport;
}

function isMovedTransactionVisible(reportAction: ReportAction, allReports: OnyxCollection<Report>): boolean {
    const originalMessage = getOriginalMessage(reportAction) as OriginalMessageMovedTransaction | undefined;

    if (!originalMessage) {
        return false;
    }

    const toReportID = originalMessage.toReportID;
    const fromReportID = originalMessage.fromReportID;

    const isFromUnreportedReport = fromReportID === CONST.REPORT.UNREPORTED_REPORT_ID;

    const toReportKey = `${ONYXKEYS.COLLECTION.REPORT}${toReportID}`;
    const fromReportKey = `${ONYXKEYS.COLLECTION.REPORT}${fromReportID}`;

    const toReportExists = !!allReports?.[toReportKey];
    const fromReportExists = isFromUnreportedReport || !!allReports?.[fromReportKey];

    return fromReportExists || toReportExists;
}

function doesActionDependOnReportExistence(action: ReportAction): boolean {
    const isUnreportedTransaction = action.actionName === CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION;
    const isMovedTransaction = isMovedTransactionAction(action as OnyxEntry<ReportAction>);

    return isUnreportedTransaction || isMovedTransaction;
}

function isReportActionStaticallyVisible(reportAction: OnyxEntry<ReportAction>, key: string | number, allReports: OnyxCollection<Report>, currentUserAccountID: number | undefined): boolean {
    if (!reportAction) {
        return false;
    }

    if (isReportActionDeprecated(reportAction, key)) {
        return false;
    }

    if (!supportedActionTypes.has(reportAction.actionName)) {
        return false;
    }

    if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION) {
        return isUnreportedTransactionVisible(reportAction, allReports);
    }

    if (isMovedTransactionAction(reportAction)) {
        return isMovedTransactionVisible(reportAction, allReports);
    }

    if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED) {
        const isMarkAsClosed = isMarkAsClosedAction(reportAction);
        if (!isMarkAsClosed) {
            return false;
        }
    }

    if (isWhisperAction(reportAction)) {
        const whisperedToAccountIDs = getWhisperedTo(reportAction);
        const isWhisperTargetedToCurrentUser = whisperedToAccountIDs.includes(currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID);
        if (!isWhisperTargetedToCurrentUser) {
            return false;
        }
    }

    if (isPendingRemove(reportAction) && !reportAction.childVisibleActionCount) {
        return false;
    }

    if (isTripPreview(reportAction) || isTravelUpdate(reportAction)) {
        return true;
    }

    if (isActionableWhisper(reportAction) && isResolvedActionableWhisper(reportAction)) {
        return false;
    }

    if (!isVisiblePreviewOrMoneyRequest(reportAction)) {
        return false;
    }

    const isDeleted = isDeletedAction(reportAction);
    const isPending = !!reportAction.pendingAction;
    const isParentAction = isDeletedParentAction(reportAction);
    const isReversed = isReversedTransaction(reportAction);

    return !isDeleted || isPending || isParentAction || isReversed;
}

function isActionableWhisperRequiringWritePermission(reportAction: OnyxEntry<ReportAction>): boolean {
    if (!reportAction) {
        return false;
    }

    const isReportMentionWhisper = isActionableReportMentionWhisper(reportAction);
    const isJoinRequestPending = isActionableJoinRequestPendingReportAction(reportAction);
    const isMentionWhisper = isActionableMentionWhisper(reportAction);
    const isCardFraudAlert = isActionableCardFraudAlert(reportAction);

    return isReportMentionWhisper || isJoinRequestPending || isMentionWhisper || isCardFraudAlert;
}

export {isActionableWhisperRequiringWritePermission};

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS,
    dependencies: [ONYXKEYS.COLLECTION.REPORT_ACTIONS, ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.SESSION],
    compute: ([allReportActions, allReports, session], {sourceValues, currentValue}): VisibleReportActionsDerivedValue => {
        if (!allReportActions) {
            return {};
        }

        const currentUserAccountID = session?.accountID;

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
                        reportVisibility[actionID] = isReportActionStaticallyVisible(action, actionID, allReports, currentUserAccountID);
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
                        reportVisibility[actionID] = isReportActionStaticallyVisible(action, actionID, allReports, currentUserAccountID);
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

                reportVisibility[actionID] = isReportActionStaticallyVisible(action, actionID, allReports, currentUserAccountID);
            }
        }

        return result;
    },
});
