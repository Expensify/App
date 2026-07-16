import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';

import {getCombinedReportActions, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {canEditReportAction} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useRoute} from '@react-navigation/native';

import useComposerReportData from './useComposerReportData';

function useLastEditableAction(reportID: string): OnyxEntry<OnyxTypes.ReportAction> {
    const route = useRoute();

    const {report, filteredReportActions, effectiveTransactionThreadReportID} = useComposerReportData(reportID);

    const parentReportAction = useParentReportAction(report);
    const [transactionThreadReportActionsOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${effectiveTransactionThreadReportID}`);
    const transactionThreadReportActionsArray = transactionThreadReportActionsOnyx ? Object.values(transactionThreadReportActionsOnyx) : [];
    const combinedReportActions = getCombinedReportActions(filteredReportActions, effectiveTransactionThreadReportID ?? null, transactionThreadReportActionsArray);

    const isOnSearchMoneyRequestReport = route.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT || route.name === SCREENS.RIGHT_MODAL.EXPENSE_REPORT;
    const actionsForLastEditable = isOnSearchMoneyRequestReport ? filteredReportActions : combinedReportActions;

    return [...actionsForLastEditable, parentReportAction].find((action) => !isMoneyRequestAction(action) && canEditReportAction(action, undefined));
}

export default useLastEditableAction;
