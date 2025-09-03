import React, {useCallback, useEffect, useMemo} from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {useSearchContext} from '@components/Search/SearchContext';
import useAncestorReportActions from '@hooks/useAncestorReportActions';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {clearErrorFields, clearErrors} from '@libs/actions/FormActions';
import {holdMoneyRequestOnSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import type {SearchReportParamList} from '@navigation/types';
import HoldReasonFormView from '@pages/iou/HoldReasonFormView';
import {bulkHold} from '@userActions/IOU';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestHoldReasonForm';
import type {ReportAction} from '@src/types/onyx';
import { useAllReportsTransactionsAndViolations } from '@components/OnyxListItemProvider';
import CONST from '@src/CONST';
import Log from '@libs/__mocks__/Log';

function SearchHoldReasonPage({route}: PlatformStackScreenProps<Omit<SearchReportParamList, typeof SCREENS.SEARCH.REPORT_RHP>>) {
    const {backTo = '', reportID} = route.params;

    const {translate} = useLocalize();
    const context = useSearchContext();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: false});
    const ancestorReportActions = useAncestorReportActions(reportID);
    const allReportTransactionsAndViolations = useAllReportsTransactionsAndViolations();

    const {transactions, violations} = allReportTransactionsAndViolations?.[reportID ?? CONST.DEFAULT_NUMBER_ID] ?? {transactions: {}, violations: {}};
    const selectedTransactions = useMemo(
        () => Object.fromEntries(Object.entries(transactions).filter(([, transaction]) => !!transaction && context.selectedTransactionIDs.includes(transaction.transactionID) && transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)),
        [transactions],
    );

    const selectedTransactionViolations = useMemo(
        () => Object.fromEntries(Object.entries(violations).filter(([transactionID, ]) => context.selectedTransactionIDs.includes(transactionID))),
        [violations],
    );

    const [selectedTransactionsIOUActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        canBeMissing: false,
        selector: (reportActions) => {

            if (!reportActions || !selectedTransactions) {
                return {};
            }

            const iouActions: Record<string, ReportAction> = {};
            const actions = Object.values(reportActions)

            Object.keys(selectedTransactions).forEach((transactionID) => {

                const iouAction = getIOUActionForTransactionID(actions, transactionID);
                if (!iouAction) {
                    Log.warn(`[SearchHoldReasonPage] No IOU action found for transactionID: ${transactionID}`);
                    return;
                }
                iouActions[transactionID] = iouAction;
            });

            return iouActions;
        },
    });

    const onSubmit = useCallback(
        ({comment}: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
            if (route.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS) {
                bulkHold(comment, report, selectedTransactions, selectedTransactionViolations, selectedTransactionsIOUActions ?? {});
                context.clearSelectedTransactions(true);
            } else {
                holdMoneyRequestOnSearch(context.currentSearchHash, Object.keys(context.selectedTransactions), comment, selectedTransactions, selectedTransactionsIOUActions ?? {});
                context.clearSelectedTransactions();
            }
            Navigation.goBack();
        },
        [route.name, report, context, transactions, violations, selectedTransactionsIOUActions],
    );

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM> = getFieldRequiredErrors(values, [INPUT_IDS.COMMENT]);

            if (!values.comment) {
                errors.comment = translate('common.error.fieldRequired');
            }
            return errors;
        },
        [translate],
    );

    useEffect(() => {
        clearErrors(ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM);
        clearErrorFields(ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM);
    }, []);

    return (
        <HoldReasonFormView
            onSubmit={onSubmit}
            validate={validate}
            backTo={backTo}
        />
    );
}

SearchHoldReasonPage.displayName = 'SearchHoldReasonPage';

export default SearchHoldReasonPage;
