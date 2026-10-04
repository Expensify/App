import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {useAllReportsTransactionsAndViolations} from '@components/OnyxListItemProvider';
import {useSearchQueryContext, useSearchResultsContext, useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import {getAllMatchingExpenseActionQuery} from '@hooks/useSearchBulkActions';

import {clearErrorFields, clearErrors} from '@libs/actions/FormActions';
import {queueBulkRejectExpenses, rejectMoneyRequestsOnSearch} from '@libs/actions/Search';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';

import type {SearchReportActionsParamList} from '@navigation/types';

import RejectReasonFormView from '@pages/iou/RejectReasonFormView';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestRejectReasonForm';

import React, {useCallback, useEffect, useMemo} from 'react';

type SearchRejectReasonPageProps =
    | PlatformStackScreenProps<SearchReportActionsParamList, typeof SCREENS.SEARCH.MONEY_REQUEST_REPORT_REJECT_TRANSACTIONS>
    | PlatformStackScreenProps<SearchReportActionsParamList, typeof SCREENS.SEARCH.SEARCH_REJECT_REASON_RHP>;

function SearchRejectReasonPage({route}: SearchRejectReasonPageProps) {
    const {selectedTransactionIDs, selectedTransactions, excludedTransactions, areAllMatchingItemsSelected} = useSearchSelectionContext();
    const {currentSearchHash, currentSearchQueryJSON} = useSearchQueryContext();
    const {currentSearchResults} = useSearchResultsContext();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {reportID} = route.params ?? {};
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const allReportsTransactionsAndViolations = useAllReportsTransactionsAndViolations();
    const {translate} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();

    const {isBetaEnabled} = usePermissions();
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const {accountID: currentUserAccountID, login: currentUserLogin} = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    // When coming from the report view, selectedTransactions is empty, build it from selectedTransactionIDs
    const selectedTransactionsForReject = useMemo(() => {
        if (route.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT_REJECT_TRANSACTIONS && reportID) {
            return selectedTransactionIDs.reduce<Record<string, {reportID: string}>>((acc, transactionID) => {
                acc[transactionID] = {reportID};
                return acc;
            }, {});
        }
        return selectedTransactions;
    }, [route.name, reportID, selectedTransactionIDs, selectedTransactions]);

    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const onSubmit = useCallback(
        ({comment}: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM>) => {
            if (isDelegateAccessRestricted) {
                showDelegateNoAccessModal();
                return;
            }

            // "Select all" can cover more expenses than are loaded, so hand the search query to the backend to reject every match.
            if (route.name === SCREENS.SEARCH.SEARCH_REJECT_REASON_RHP && areAllMatchingItemsSelected) {
                const allMatchingQuery = currentSearchQueryJSON ? getAllMatchingExpenseActionQuery(currentSearchQueryJSON, excludedTransactions, currentSearchResults?.data) : undefined;
                if (!allMatchingQuery) {
                    Log.info('[BulkReject] Dropping bulk reject: an excluded row could not be resolved');
                    return;
                }
                queueBulkRejectExpenses(allMatchingQuery.jsonQuery, comment, allMatchingQuery.excludedTransactionIDList);
                clearSelectedTransactions();
                Navigation.dismissToSuperWideRHP();
                return;
            }

            const urlToNavigateBack = rejectMoneyRequestsOnSearch({
                hash: currentSearchHash,
                selectedTransactions: selectedTransactionsForReject,
                comment,
                allPolicies,
                allReports,
                currentUserAccountIDParam: currentUserAccountID,
                currentUserLogin: currentUserLogin ?? '',
                isASAPSubmitBetaEnabled: isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
                delegateAccountID,
                getCurrencyDecimals,
                allReportsTransactionsAndViolations,
                rules,
            });
            if (route.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT_REJECT_TRANSACTIONS) {
                clearSelectedTransactions(true);
            } else {
                clearSelectedTransactions();
            }
            Navigation.dismissToSuperWideRHP();
            if (urlToNavigateBack) {
                Navigation.isNavigationReady().then(() => Navigation.goBack(urlToNavigateBack as Route));
            }
        },
        [
            isDelegateAccessRestricted,
            currentSearchHash,
            selectedTransactionsForReject,
            allPolicies,
            allReports,
            currentUserAccountID,
            currentUserLogin,
            isBetaEnabled,
            delegateAccountID,
            getCurrencyDecimals,
            allReportsTransactionsAndViolations,
            rules,
            route.name,
            showDelegateNoAccessModal,
            clearSelectedTransactions,
            areAllMatchingItemsSelected,
            currentSearchQueryJSON,
            excludedTransactions,
            currentSearchResults?.data,
        ],
    );

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM> = getFieldRequiredErrors(values, [INPUT_IDS.COMMENT], translate);
            return errors;
        },
        [translate],
    );

    useEffect(() => {
        clearErrors(ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM);
        clearErrorFields(ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM);
    }, []);

    return (
        <RejectReasonFormView
            onSubmit={onSubmit}
            validate={validate}
        />
    );
}

export default SearchRejectReasonPage;
