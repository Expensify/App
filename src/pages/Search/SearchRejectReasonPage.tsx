import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {useAllReportsTransactionsAndViolations} from '@components/OnyxListItemProvider';
import {useSearchQueryContext, useSearchResultsContext, useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';
import {getRowsCheckedInExcludedGroups} from '@components/Search/selectionBuilders';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {clearErrorFields, clearErrors} from '@libs/actions/FormActions';
import {queueBulkExpenseAction, rejectMoneyRequestsOnSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getAllMatchingExpenseActionQuery} from '@libs/SearchUIUtils';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';

import type {SearchReportActionsParamList} from '@navigation/types';

import RejectReasonFormView from '@pages/iou/RejectReasonFormView';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestRejectReasonForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useEffect} from 'react';

type SearchRejectReasonPageProps =
    | PlatformStackScreenProps<SearchReportActionsParamList, typeof SCREENS.SEARCH.MONEY_REQUEST_REPORT_REJECT_TRANSACTIONS>
    | PlatformStackScreenProps<SearchReportActionsParamList, typeof SCREENS.SEARCH.SEARCH_REJECT_REASON_RHP>;

function SearchRejectReasonPage({route}: SearchRejectReasonPageProps) {
    const {selectedTransactionIDs, selectedTransactions, excludedTransactions, areAllMatchingItemsSelected} = useSearchSelectionContext();
    const {currentSearchHash, currentSearchKey, currentSearchQueryJSON} = useSearchQueryContext();
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
    const selectedTransactionsForReject =
        route.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT_REJECT_TRANSACTIONS && reportID
            ? selectedTransactionIDs.reduce<
                  Record<
                      string,
                      {
                          reportID: string;
                      }
                  >
              >((acc, transactionID) => {
                  acc[transactionID] = {
                      reportID,
                  };
                  return acc;
              }, {})
            : selectedTransactions;

    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    // "Select all" can cover more expenses than are loaded, so the backend rejects every match.
    const shouldQueueOnServer = route.name === SCREENS.SEARCH.SEARCH_REJECT_REASON_RHP && areAllMatchingItemsSelected;
    const rejectTransactions = (transactionsToReject: Parameters<typeof rejectMoneyRequestsOnSearch>[0]['selectedTransactions'], comment: string) =>
        rejectMoneyRequestsOnSearch({
            hash: currentSearchHash,
            selectedTransactions: transactionsToReject,
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
    const onSubmit = ({comment}: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM>) => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }

        if (shouldQueueOnServer) {
            queueBulkExpenseAction(
                CONST.SEARCH.BULK_ACTION_TYPES.REJECT,
                getAllMatchingExpenseActionQuery(currentSearchQueryJSON, excludedTransactions, currentSearchResults?.data, currentSearchKey),
                comment,
            );
            // The query leaves out every expense in an excluded group, so the ones checked again inside it are rejected here.
            const rowsToReject = Object.fromEntries(
                Object.entries(getRowsCheckedInExcludedGroups(selectedTransactions, excludedTransactions)).filter(([, transaction]) => transaction.canReject),
            );
            if (!isEmptyObject(rowsToReject)) {
                rejectTransactions(rowsToReject, comment);
            }
            clearSelectedTransactions();
            Navigation.dismissToSuperWideRHP();
            return;
        }

        const urlToNavigateBack = rejectTransactions(selectedTransactionsForReject, comment);
        if (route.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT_REJECT_TRANSACTIONS) {
            clearSelectedTransactions(true);
        } else {
            clearSelectedTransactions();
        }
        Navigation.dismissToSuperWideRHP();
        if (urlToNavigateBack) {
            Navigation.isNavigationReady().then(() => Navigation.goBack(urlToNavigateBack as Route));
        }
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM> = getFieldRequiredErrors(values, [INPUT_IDS.COMMENT], translate);
        return errors;
    };

    useEffect(() => {
        clearErrors(ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM);
        clearErrorFields(ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM);
    }, []);

    return (
        <RejectReasonFormView
            onSubmit={onSubmit}
            validate={validate}
            enabledWhenOffline={!shouldQueueOnServer}
        />
    );
}

export default SearchRejectReasonPage;
