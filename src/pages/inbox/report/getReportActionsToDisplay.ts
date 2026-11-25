import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import DateUtils from '@libs/DateUtils';
import {rand64} from '@libs/NumberUtils';
import {buildOptimisticCreatedReportAction, buildOptimisticIOUReportAction} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

// Onyx replaces changed actions. Weak keys retain decoration only while its source is still used.
const pendingCreatedActions = new WeakMap<OnyxTypes.ReportAction, OnyxTypes.ReportAction>();

type GetReportActionsToDisplayParams = {
    /** The report's own actions in the loaded window, newest first. */
    reportViewActions: OnyxTypes.ReportAction[];

    isMoneyRequestReport: boolean;

    hasPendingExpense: boolean;

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
    hasPendingExpense,
    placeholderCreatedAction,
    placeholderExpenseAction,
}: GetReportActionsToDisplayParams): OnyxTypes.ReportAction[] {
    const actions = placeholderCreatedAction ? [...reportViewActions, placeholderCreatedAction] : [...reportViewActions];

    if (!isMoneyRequestReport || !reportViewActions.length) {
        return actions;
    }

    if (placeholderExpenseAction) {
        actions.splice(actions.length - 1, 0, placeholderExpenseAction);
    }

    // Show the CREATED action as pending while one of the expenses is. Replace it with a copy, because it may be the action Onyx stores.
    const createdAction = actions.at(-1);
    if (createdAction && (hasPendingExpense || placeholderExpenseAction?.pendingAction)) {
        let pendingCreatedAction = pendingCreatedActions.get(createdAction);
        if (!pendingCreatedAction) {
            pendingCreatedAction = {...createdAction, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE};
            pendingCreatedActions.set(createdAction, pendingCreatedAction);
        }
        actions[actions.length - 1] = pendingCreatedAction;
    }

    return actions;
}

/** A CREATED action placed just before the oldest loaded action. */
function buildPlaceholderCreatedAction(reportID: string | undefined, ownerAccountID: number | undefined, oldestActionCreated: string | undefined): OnyxTypes.ReportAction {
    const placeholderCreatedAction = buildOptimisticCreatedReportAction({
        emailCreatingAction: String(ownerAccountID),
        created: oldestActionCreated && DateUtils.subtractMillisecondsFromDateTime(oldestActionCreated, 1),
    });
    return {...placeholderCreatedAction, reportID, pendingAction: null};
}

/** An empty expense action placed just before the report's CREATED action. */
function buildPlaceholderExpenseAction(
    reportID: string | undefined,
    createdActionCreated: string | undefined,
    delegateAccountID: number | undefined,
    getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals'],
): OnyxTypes.ReportAction {
    return {
        ...buildOptimisticIOUReportAction({
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
        }),
        reportID,
    };
}

export default getReportActionsToDisplay;
export {buildPlaceholderCreatedAction, buildPlaceholderExpenseAction};
