import React, {useCallback, useEffect} from 'react';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {clearErrorFields, clearErrors} from '@libs/actions/FormActions';
import {putOnHold, putTransactionsOnHold} from '@libs/actions/IOU/Hold';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
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
    const {selectedTransactionIDs, selectedTransactions} = useSearchStateContext();
    const {clearSelectedTransactions} = useSearchActionsContext();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const {isOffline} = useNetwork();

    const selectedTransactionsList = Object.values(selectedTransactions);
    const isSubmitter = report ? report.ownerAccountID === currentUserAccountID : selectedTransactionsList.some((t) => t.ownerAccountID === currentUserAccountID);

    const ancestors = useAncestors(report);
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const onSubmit = useCallback(
        ({comment}: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
            if (isDelegateAccessRestricted) {
                showDelegateNoAccessModal();
                return;
            }
            if (route.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS) {
                putTransactionsOnHold(selectedTransactionIDs, comment, reportID, isOffline, ancestors);
                clearSelectedTransactions(true);
            } else {
                const transactionIDs = Object.keys(selectedTransactions);
                for (const transactionID of transactionIDs) {
                    const transactionThreadReportID = selectedTransactions[transactionID].reportAction?.childReportID;
                    putOnHold(transactionID, comment, transactionThreadReportID, isOffline, ancestors);
                }
                clearSelectedTransactions();
            }

            Navigation.goBack();
        },
        [route.name, selectedTransactionIDs, selectedTransactions, clearSelectedTransactions, reportID, ancestors, isOffline, isDelegateAccessRestricted, showDelegateNoAccessModal],
    );

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM> = getFieldRequiredErrors(values, [INPUT_IDS.COMMENT], translate);

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

    const expenseCount = route.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS ? selectedTransactionIDs.length : Object.keys(selectedTransactions).length;

    return (
        <HoldReasonFormView
            onSubmit={onSubmit}
            validate={validate}
            expenseCount={expenseCount}
            backTo={backTo}
            isSubmitter={isSubmitter}
        />
    );
}

export default SearchHoldReasonPage;
