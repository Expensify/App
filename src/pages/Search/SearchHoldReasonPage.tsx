import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';

import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
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
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestHoldReasonForm';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {transactionViolationsByIDsSelector} from '@selectors/TransactionViolations';
import React, {useCallback, useEffect, useMemo} from 'react';

type SearchHoldReasonPageProps =
    | PlatformStackScreenProps<SearchReportActionsParamList, typeof SCREENS.SEARCH.DYNAMIC_MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS>
    | PlatformStackScreenProps<SearchReportActionsParamList, typeof SCREENS.SEARCH.TRANSACTION_HOLD_REASON_RHP>;

function SearchHoldReasonPage({route}: SearchHoldReasonPageProps) {
    const {translate} = useLocalize();
    const isBulkHold = route.name === SCREENS.SEARCH.DYNAMIC_MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS;
    const {reportID} = route.params ?? {};
    const dynamicBackPath = useDynamicBackPath(DYNAMIC_ROUTES.HOLD_TRANSACTIONS.path);
    const backTo = isBulkHold ? dynamicBackPath : route.params.backTo;
    const {selectedTransactionIDs, selectedTransactions} = useSearchSelectionContext();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {accountID: currentUserAccountID, login: currentUserLogin} = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

    const relevantTransactionIDs = useMemo(() => (isBulkHold ? selectedTransactionIDs : Object.keys(selectedTransactions)), [isBulkHold, selectedTransactionIDs, selectedTransactions]);
    const [selectedTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {selector: transactionViolationsByIDsSelector(relevantTransactionIDs)});
    const {isOffline} = useNetwork();
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {
        selector: isTrackIntentUserSelector,
    });

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
            if (isBulkHold) {
                putTransactionsOnHold(
                    selectedTransactionIDs,
                    comment,
                    reportID,
                    isOffline,
                    currentUserLogin ?? '',
                    currentUserAccountID,
                    selectedTransactionViolations,
                    isTrackIntentUser,
                    delegateAccountID,
                    ancestors,
                );
                clearSelectedTransactions(true);
            } else {
                const transactionIDs = Object.keys(selectedTransactions);
                for (const transactionID of transactionIDs) {
                    const transactionThreadReportID = selectedTransactions[transactionID].reportAction?.childReportID;
                    const transactionViolations = selectedTransactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`];
                    putOnHold(
                        transactionID,
                        comment,
                        transactionThreadReportID,
                        isOffline,
                        currentUserLogin ?? '',
                        currentUserAccountID,
                        transactionViolations,
                        isTrackIntentUser,
                        delegateAccountID,
                        ancestors,
                    );
                }
                clearSelectedTransactions();
            }

            Navigation.goBack();
        },
        [
            isDelegateAccessRestricted,
            isBulkHold,
            showDelegateNoAccessModal,
            selectedTransactionIDs,
            reportID,
            isOffline,
            ancestors,
            clearSelectedTransactions,
            selectedTransactions,
            currentUserLogin,
            currentUserAccountID,
            selectedTransactionViolations,
            isTrackIntentUser,
            delegateAccountID,
        ],
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

    const expenseCount = isBulkHold ? selectedTransactionIDs.length : Object.keys(selectedTransactions).length;

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
