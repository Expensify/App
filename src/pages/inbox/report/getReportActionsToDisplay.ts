import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import DateUtils from '@libs/DateUtils';
import {rand64} from '@libs/NumberUtils';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {buildOptimisticCreatedReportAction, buildOptimisticIOUReportAction} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxInputValue} from 'react-native-onyx';

type GetReportActionsToDisplayParams = {
    /** The report's own actions in the loaded window, newest first. */
    reportViewActions: OnyxTypes.ReportAction[];

    /** Whether the report is an expense or IOU report. */
    isMoneyRequestReport: boolean;

    reportPreviewAction: OnyxInputValue<OnyxTypes.ReportAction<'REPORTPREVIEW'>> | undefined;

    transactionThreadReport: OnyxTypes.Report | undefined;

    /** A placeholder CREATED action to add when the loaded window doesn't reach the report's own one. */
    placeholderCreatedAction: OnyxTypes.ReportAction | undefined;

    /** A placeholder expense, for a report with a total, to add while fewer expense actions are loaded than the report preview counts. */
    placeholderExpenseAction: OnyxTypes.ReportAction | undefined;
};

/**
 * When we are offline before opening an IOU/Expense report, the report total and sometimes the expense aren't displayed,
 * because these actions only arrive with the `OpenReport` response. This adds a placeholder CREATED action, and a
 * placeholder expense when fewer expense actions are loaded than the report preview counts, so the total can show.
 */
function getReportActionsToDisplay({
    reportViewActions,
    isMoneyRequestReport,
    reportPreviewAction,
    transactionThreadReport,
    placeholderCreatedAction,
    placeholderExpenseAction,
}: GetReportActionsToDisplayParams): OnyxTypes.ReportAction[] {
    const actions = placeholderCreatedAction ? [...reportViewActions, placeholderCreatedAction] : [...reportViewActions];

    if (!isMoneyRequestReport || !reportViewActions.length) {
        return actions;
    }

    const moneyRequestActions = reportViewActions.filter((action) => {
        const originalMessage = isMoneyRequestAction(action) ? getOriginalMessage(action) : undefined;
        return (
            isMoneyRequestAction(action) &&
            originalMessage &&
            (originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.CREATE ||
                !!(originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && originalMessage?.IOUDetails) ||
                originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.TRACK)
        );
    });

    if (placeholderExpenseAction && moneyRequestActions.length < (reportPreviewAction?.childMoneyRequestCount ?? 0) && isEmptyObject(transactionThreadReport)) {
        moneyRequestActions.push(placeholderExpenseAction);
        actions.splice(actions.length - 1, 0, placeholderExpenseAction);
    }

    // Show the CREATED action as pending while one of the expenses is. Replace it with a copy, because it may be the action Onyx stores.
    const createdAction = actions.at(-1);
    if (createdAction && moneyRequestActions.some((action) => !!action.pendingAction)) {
        actions[actions.length - 1] = {...createdAction, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE};
    }

    return actions;
}

/** A CREATED action placed just before the oldest loaded action. */
function buildPlaceholderCreatedAction(ownerAccountID: number | undefined, oldestActionCreated: string | undefined): OnyxTypes.ReportAction {
    const placeholderCreatedAction = buildOptimisticCreatedReportAction({
        emailCreatingAction: String(ownerAccountID),
        created: oldestActionCreated && DateUtils.subtractMillisecondsFromDateTime(oldestActionCreated, 1),
    });
    placeholderCreatedAction.pendingAction = null;
    return placeholderCreatedAction;
}

/** An empty expense action placed just before the report's CREATED action. */
function buildPlaceholderExpenseAction(
    reportID: string | undefined,
    createdActionCreated: string | undefined,
    delegateAccountID: number | undefined,
    getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals'],
): OnyxTypes.ReportAction {
    return buildOptimisticIOUReportAction({
        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        amount: 0,
        currency: CONST.CURRENCY.USD,
        comment: '',
        participants: [],
        transactionID: rand64(),
        iouReportID: reportID,
        created: DateUtils.subtractMillisecondsFromDateTime(createdActionCreated ?? '', 1),
        delegateAccountIDParam: delegateAccountID,
        getCurrencyDecimals,
    });
}

export default getReportActionsToDisplay;
export {buildPlaceholderCreatedAction, buildPlaceholderExpenseAction};
