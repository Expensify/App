import React, {useCallback, useEffect, useMemo} from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {useAllReportsTransactionsAndViolations} from '@components/OnyxListItemProvider';
import {useSearchContext} from '@components/Search/SearchContext';
import useAncestorReportsAndReportActions from '@hooks/useAncestorReportsAndReportActions';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Log from '@libs/__mocks__/Log';
import {clearErrorFields, clearErrors} from '@libs/actions/FormActions';
import {holdMoneyRequestOnSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import type {SearchReportParamList} from '@navigation/types';
import HoldReasonFormView from '@pages/iou/HoldReasonFormView';
import {bulkHold} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestHoldReasonForm';
import type {ReportAction, Transaction, TransactionViolations} from '@src/types/onyx';

function SearchHoldReasonPage({route}: PlatformStackScreenProps<Omit<SearchReportParamList, typeof SCREENS.SEARCH.REPORT_RHP>>) {
    const {backTo = '', reportID} = route.params;

    const {translate} = useLocalize();
    const context = useSearchContext();

    const {report, ancestorReportsAndReportActions} = useAncestorReportsAndReportActions(reportID);
    const allReportTransactionsAndViolations = useAllReportsTransactionsAndViolations();

    // Get the selected transactions and violations for the current reportID
    const [selectedTransactions, selectedTransactionViolations] = useMemo(() => {
        if (!allReportTransactionsAndViolations || Object.keys(context.selectedTransactionIDs).length === 0) {
            return [{}, {}];
        }

        const reportTransactionsAndViolations = allReportTransactionsAndViolations[reportID];

        if (!reportTransactionsAndViolations?.transactions) {
            return [{}, {}];
        }

        const {transactions: reportTransactions, violations: reportViolations} = reportTransactionsAndViolations;

        const transactions: Record<string, Transaction> = {};
        const violations: Record<string, TransactionViolations> = {};

        for (const transactionID of context.selectedTransactionIDs) {
            const transaction = reportTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
            if (!transaction) {
                Log.warn(`[SearchHoldReasonPage] Selected transactionID not found in report transactions`, {transactionID});
                continue;
            }

            const pendingAction = transaction?.pendingAction;

            if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                Log.warn(`[SearchHoldReasonPage] Selected transactionID is not eligible for hold`, {transactionID, pendingAction});
                continue;
            }

            transactions[transactionID] = transaction;
            violations[transactionID] = reportViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] ?? [];
        }

        return [transactions, violations];
    }, [allReportTransactionsAndViolations, context.selectedTransactionIDs, reportID]);

    const [selectedTransactionsIOUActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        canBeMissing: false,
        selector: (reportActions) => {
            if (!reportActions || !selectedTransactions) {
                return {};
            }

            const transactionsIOUActions: Record<string, ReportAction> = {};
            const actions = Object.values(reportActions);

            for (const transactionID of Object.keys(selectedTransactions)) {
                const iouAction = getIOUActionForTransactionID(actions, transactionID);
                if (!iouAction) {
                    Log.warn(`[SearchHoldReasonPage] No IOU action found for selected transactionID`, {transactionID, reportID});
                    continue;
                }
                transactionsIOUActions[transactionID] = iouAction;
            }
            return transactionsIOUActions;
        },
    });

    const onSubmit = useCallback(
        ({comment}: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
            if (route.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS) {
                bulkHold(comment, report, ancestorReportsAndReportActions, selectedTransactions, selectedTransactionViolations, selectedTransactionsIOUActions ?? {});
                context.clearSelectedTransactions(true);
            } else {
                holdMoneyRequestOnSearch(context.currentSearchHash, Object.keys(context.selectedTransactions), comment, selectedTransactions, selectedTransactionsIOUActions ?? {});
                context.clearSelectedTransactions();
            }
            Navigation.goBack();
        },
        [ancestorReportsAndReportActions, context, report, route.name, selectedTransactions, selectedTransactionViolations, selectedTransactionsIOUActions],
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
