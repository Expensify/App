import React, {useCallback, useContext, useEffect, useMemo} from 'react';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {useSearchContext} from '@components/Search/SearchContext';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import {clearErrorFields, clearErrors} from '@libs/actions/FormActions';
import {rejectMoneyRequestsOnSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import type {SearchReportActionsParamList} from '@navigation/types';
import RejectReasonFormView from '@pages/iou/RejectReasonFormView';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestRejectReasonForm';

type SearchRejectReasonPageProps =
    | PlatformStackScreenProps<SearchReportActionsParamList, typeof SCREENS.SEARCH.MONEY_REQUEST_REPORT_REJECT_TRANSACTIONS>
    | PlatformStackScreenProps<SearchReportActionsParamList, typeof SCREENS.SEARCH.SEARCH_REJECT_REASON_RHP>;

function SearchRejectReasonPage({route}: SearchRejectReasonPageProps) {
    const context = useSearchContext();
    const {reportID} = route.params ?? {};
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    // When coming from the report view, selectedTransactions is empty, build it from selectedTransactionIDs
    const selectedTransactionsForReject = useMemo(() => {
        if (route.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT_REJECT_TRANSACTIONS && reportID) {
            return context.selectedTransactionIDs.reduce<Record<string, {reportID: string}>>((acc, transactionID) => {
                acc[transactionID] = {reportID};
                return acc;
            }, {});
        }
        return context.selectedTransactions;
    }, [route.name, reportID, context.selectedTransactionIDs, context.selectedTransactions]);

    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const onSubmit = useCallback(
        ({comment}: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM>) => {
            if (isDelegateAccessRestricted) {
                showDelegateNoAccessModal();
                return;
            }

            const urlToNavigateBack = rejectMoneyRequestsOnSearch(context.currentSearchHash, selectedTransactionsForReject, comment, allPolicies, allReports, currentUserAccountID);
            if (route.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT_REJECT_TRANSACTIONS) {
                context.clearSelectedTransactions(true);
            } else {
                context.clearSelectedTransactions();
            }
            Navigation.dismissToSuperWideRHP();
            if (urlToNavigateBack) {
                Navigation.isNavigationReady().then(() => Navigation.goBack(urlToNavigateBack as Route));
            }
        },
        [context, allPolicies, allReports, route.name, selectedTransactionsForReject, isDelegateAccessRestricted, showDelegateNoAccessModal],
    );

    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM> = getFieldRequiredErrors(values, [INPUT_IDS.COMMENT]);
        return errors;
    }, []);

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
