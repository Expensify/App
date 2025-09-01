import React, {useCallback, useEffect} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
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
import type {ReportAction, Transaction, TransactionViolations} from '@src/types/onyx';

function SearchHoldReasonPage({route}: PlatformStackScreenProps<Omit<SearchReportParamList, typeof SCREENS.SEARCH.REPORT_RHP>>) {
    const {translate} = useLocalize();
    const {backTo = '', reportID} = route.params;
    const context = useSearchContext();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: false});
    const ancestorReportActions = useAncestorReportActions(reportID);
    const [transactions] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}`, {
        canBeMissing: false,
        selector: (allTransactions) => {
            const selectedTransactions: OnyxCollection<Transaction> = {};
            if (!allTransactions) {
                return selectedTransactions;
            }

            context.selectedTransactionIDs.forEach((transactionID) => {
                const key = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
                selectedTransactions[key] = allTransactions?.[key];
            });

            return selectedTransactions;
        },
    });

    const [transactionsViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}`, {
        canBeMissing: true,
        selector: (allTransactionsViolations) => {
            const selectedTransactionsViolations: OnyxCollection<TransactionViolations> = {};
            if (!allTransactionsViolations) {
                return selectedTransactionsViolations;
            }

            context.selectedTransactionIDs.forEach((transactionID) => {
                const key = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`;
                selectedTransactionsViolations[key] = allTransactionsViolations?.[key];
            });

            return selectedTransactionsViolations;
        },
    });

    const [transactionsIOUActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}`, {
        canBeMissing: false,
        selector: (allReportActions) => {
            const selectedTransactionsIOUActions: Record<string, ReportAction> = {};
            if (!allReportActions || !transactions) {
                return selectedTransactionsIOUActions;
            }

            Object.entries(transactions).forEach(([transactionID, transaction]) => {
                if (!transaction) {
                    return;
                }
                const reportActions = allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transaction.reportID}`];
                if (!reportActions) {
                    return;
                }

                const iouAction = getIOUActionForTransactionID(Object.values(reportActions) as ReportAction[], transactionID);
                if (!iouAction) {
                    return;
                }
                selectedTransactionsIOUActions[transactionID] = iouAction;
            });

            return selectedTransactionsIOUActions;
        },
    });

    const onSubmit = useCallback(
        ({comment}: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
            if (transactions !== undefined && transactionsIOUActions !== undefined) {
                if (route.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS) {
                    if (!report) {
                        bulkHold(comment, report, ancestorReportActions.map((v) => v.reportAction), transactions, transactionsViolations, transactionsIOUActions);
                    }
                    context.clearSelectedTransactions(true);
                } else {
                    holdMoneyRequestOnSearch(context.currentSearchHash, Object.keys(context.selectedTransactions), comment, transactions, transactionsIOUActions);
                    context.clearSelectedTransactions();
                }
            }
            Navigation.goBack();
        },
        [route.name, reportID, reports, reportActions, context, transactions, transactionsViolations, ancestorReportActions],
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
