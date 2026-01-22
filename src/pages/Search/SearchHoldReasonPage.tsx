import React, {useCallback, useContext, useEffect} from 'react';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {useSearchContext} from '@components/Search/SearchContext';
import useAncestors from '@hooks/useAncestors';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {clearErrorFields, clearErrors} from '@libs/actions/FormActions';
import {putTransactionsOnHold} from '@libs/actions/IOU/Hold';
import {holdMoneyRequestOnSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getCollectionsFromSearchResults} from '@libs/SearchUIUtils';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import type {SearchReportActionsParamList} from '@navigation/types';
import HoldReasonFormView from '@pages/iou/HoldReasonFormView';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestHoldReasonForm';

type SearchHoldReasonPageProps =
    | PlatformStackScreenProps<SearchReportActionsParamList, typeof SCREENS.SEARCH.MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS>
    | PlatformStackScreenProps<SearchReportActionsParamList, typeof SCREENS.SEARCH.TRANSACTION_HOLD_REASON_RHP>;

function SearchHoldReasonPage({route}: SearchHoldReasonPageProps) {
    const {translate} = useLocalize();
    const {backTo = '', reportID} = route.params ?? {};
    const context = useSearchContext();
    const {reports: allReports, transactions: allTransactions} = getCollectionsFromSearchResults(context.currentSearchResults);
    const report = allReports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const ancestors = useAncestors(report);

    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {canBeMissing: true});
    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const onSubmit = useCallback(
        ({comment}: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
            if (isDelegateAccessRestricted) {
                showDelegateNoAccessModal();
                return;
            }

            if (route.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS) {
                putTransactionsOnHold(context.selectedTransactionIDs, comment, reportID, ancestors);
                context.clearSelectedTransactions(true);
            } else {
                holdMoneyRequestOnSearch(context.currentSearchHash, Object.keys(context.selectedTransactions), comment, allTransactions, allReportActions);
                context.clearSelectedTransactions();
            }

            Navigation.goBack();
        },
        [route.name, context, reportID, allTransactions, allReportActions, ancestors, isDelegateAccessRestricted, showDelegateNoAccessModal],
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

    const expenseCount = route.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS ? context.selectedTransactionIDs.length : Object.keys(context.selectedTransactions).length;

    return (
        <HoldReasonFormView
            onSubmit={onSubmit}
            validate={validate}
            expenseCount={expenseCount}
            backTo={backTo}
        />
    );
}

export default SearchHoldReasonPage;
