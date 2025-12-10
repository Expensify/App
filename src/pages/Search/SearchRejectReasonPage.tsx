import React, {useCallback, useEffect} from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {useSearchContext} from '@components/Search/SearchContext';
import useOnyx from '@hooks/useOnyx';
import {clearErrorFields, clearErrors} from '@libs/actions/FormActions';
import {rejectMoneyRequestsOnSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import type {SearchReportActionsParamList} from '@navigation/types';
import RejectReasonFormView from '@pages/iou/RejectReasonFormView';
import {rejectTransactionsInBulk} from '@userActions/IOU';
import ONYXKEYS from '@src/ONYXKEYS';
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

    const report = reportID ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] : undefined;
    const policy = report?.policyID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`] : undefined;
    const totalReportTransactions = report?.transactionCount ?? 0;

    const onSubmit = useCallback(
        ({comment}: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM>) => {
            if (route.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT_REJECT_TRANSACTIONS && reportID) {
                rejectTransactionsInBulk(context.selectedTransactionIDs, reportID, comment, policy, totalReportTransactions);
                context.clearSelectedTransactions(true);
            } else {
                rejectMoneyRequestsOnSearch(context.currentSearchHash, context.selectedTransactions, comment, allPolicies, allReports);
                context.clearSelectedTransactions();
            }
            Navigation.goBack();
        },
        [context, allPolicies, allReports, route.name, reportID, policy, totalReportTransactions],
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

SearchRejectReasonPage.displayName = 'SearchRejectReasonPage';

export default SearchRejectReasonPage;
