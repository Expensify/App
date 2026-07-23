import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getCombinedReportActions, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {canEditReportAction} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {getParentReportActionSelector} from '@selectors/ReportAction';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';

import getComposerReportData from './getComposerReportData';

function getLastEditableAction(reportID: string, routeName: string): OnyxEntry<OnyxTypes.ReportAction> {
    const {report, filteredReportActions, effectiveTransactionThreadReportID} = getComposerReportData(reportID);

    const parentReportActions = OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(report?.parentReportID)}` as const);
    const parentReportAction = getParentReportActionSelector(parentReportActions, report?.parentReportActionID);
    const transactionThreadReportActionsOnyx = OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${effectiveTransactionThreadReportID}` as const);
    const transactionThreadReportActionsArray = transactionThreadReportActionsOnyx ? Object.values(transactionThreadReportActionsOnyx) : [];
    const combinedReportActions = getCombinedReportActions(filteredReportActions, effectiveTransactionThreadReportID ?? null, transactionThreadReportActionsArray);

    const isOnSearchMoneyRequestReport = routeName === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT || routeName === SCREENS.RIGHT_MODAL.EXPENSE_REPORT;
    const actionsForLastEditable = isOnSearchMoneyRequestReport ? filteredReportActions : combinedReportActions;

    return [...actionsForLastEditable, parentReportAction].find((action) => !isMoneyRequestAction(action) && canEditReportAction(action, undefined));
}

export default getLastEditableAction;
