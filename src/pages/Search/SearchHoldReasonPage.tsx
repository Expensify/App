import React, {useCallback, useEffect, useMemo} from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {useAllReportsTransactionsAndViolations} from '@components/OnyxListItemProvider';
import {useSearchContext} from '@components/Search/SearchContext';
import useAncestorReportsAndReportActions from '@hooks/useAncestorReportsAndReportActions';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {clearErrorFields, clearErrors} from '@libs/actions/FormActions';
import {holdMoneyRequestOnSearch} from '@libs/actions/Search';
import Log from '@libs/Log';
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
import type {Report, ReportAction, Transaction, TransactionViolations} from '@src/types/onyx';
import type {OnyxValueWithOfflineFeedback} from '@src/types/onyx/OnyxCommon';

function SearchHoldReasonPage({route}: PlatformStackScreenProps<Omit<SearchReportParamList, typeof SCREENS.SEARCH.REPORT_RHP>>) {
    const {backTo = '', reportID} = route.params ?? {};

    const {translate} = useLocalize();
    const context = useSearchContext();

    const {report, ancestorReportsAndReportActions} = useAncestorReportsAndReportActions(reportID, true);
    const allReportTransactionsAndViolations = useAllReportsTransactionsAndViolations();

    const [selectedTransactionsIOUActions] = useOnyx(
        `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
        {
            canBeMissing: false,
            selector: (reportActions = {}) => {
                const actions = Object.values(reportActions);

                return context.selectedTransactionIDs.reduce<Record<string, ReportAction>>((acc, transactionID) => {
                    const iouAction = getIOUActionForTransactionID(actions, transactionID);
                    if (!iouAction) {
                        Log.warn(`[SearchHoldReasonPage] No IOU action found for selected transactionID: ${transactionID}`);
                        return acc;
                    }
                    acc[transactionID] = iouAction;
                    return acc;
                }, {});
            },
        },
        [context.selectedTransactionIDs],
    );

    const [selectedTransactionsThreads] = useOnyx(
        `${ONYXKEYS.COLLECTION.REPORT}`,
        {
            canBeMissing: false,
            selector: (allReports) => {
                if (!allReports) {
                    return;
                }

                return Object.entries(selectedTransactionsIOUActions ?? {}).reduce<Record<string, OnyxValueWithOfflineFeedback<Report>>>((acc, [transactionID, iouAction]) => {
                    if (!iouAction?.childReportID) {
                        return acc;
                    }
                    const thread = allReports[iouAction.childReportID];
                    if (thread) {
                        acc[transactionID] = thread;
                    }
                    return acc;
                }, {});
            },
        },
        [selectedTransactionsIOUActions],
    );

    // Get the selected transactions and violations for the current reportID
    const [selectedTransactions, selectedTransactionViolations] = useMemo(() => {
        if (!allReportTransactionsAndViolations || Object.keys(context.selectedTransactionIDs).length === 0) {
            return [{}, {}];
        }

        const reportTransactionsAndViolations = allReportTransactionsAndViolations?.[reportID];
        if (!reportTransactionsAndViolations?.transactions) {
            return [{}, {}];
        }

        const transactions: Record<string, Transaction> = {};
        const violations: Record<string, TransactionViolations> = {};
        const {transactions: reportTransactions, violations: reportViolations} = reportTransactionsAndViolations;

        for (const transactionID of context.selectedTransactionIDs) {
            const transaction = reportTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
            if (!transaction) {
                Log.warn(`[SearchHoldReasonPage] Selected transactionID: ${transactionID} not found in derived report transactions`);
                continue;
            }

            if (transaction?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] = transaction;
                violations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] = reportViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] ?? [];
            }
        }

        return [transactions, violations];
    }, [allReportTransactionsAndViolations, context.selectedTransactionIDs, reportID]);

    const onSubmit = useCallback(
        ({comment}: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
            if (route.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS) {
                bulkHold(
                    comment,
                    report,
                    ancestorReportsAndReportActions,
                    selectedTransactions,
                    selectedTransactionViolations,
                    selectedTransactionsIOUActions ?? {},
                    selectedTransactionsThreads ?? {},
                );
                context.clearSelectedTransactions(true);
            } else {
                holdMoneyRequestOnSearch(context.currentSearchHash, Object.keys(context.selectedTransactions), comment, selectedTransactions, selectedTransactionsIOUActions ?? {});
                context.clearSelectedTransactions();
            }
            Navigation.goBack();
        },
        [ancestorReportsAndReportActions, context, report, route.name, selectedTransactions, selectedTransactionViolations, selectedTransactionsThreads, selectedTransactionsIOUActions],
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
