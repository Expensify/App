import {getReportPolicyID} from '@selectors/Report';
import React, {useCallback, useContext, useEffect} from 'react';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {useSearchContext} from '@components/Search/SearchContext';
import {WideRHPContext} from '@components/WideRHPContextProvider';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import getIsSmallScreenWidth from '@libs/getIsSmallScreenWidth';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList, SearchReportActionsParamList} from '@libs/Navigation/types';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import {clearErrorFields, clearErrors} from '@userActions/FormActions';
import {rejectMoneyRequest} from '@userActions/IOU';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestRejectReasonForm';
import RejectReasonFormView from './RejectReasonFormView';

type RejectReasonPageProps =
    | PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.REJECT>
    | PlatformStackScreenProps<SearchReportActionsParamList, typeof SCREENS.SEARCH.TRANSACTION_HOLD_REASON_RHP>;

function RejectReasonPage({route}: RejectReasonPageProps) {
    const {translate} = useLocalize();

    const {transactionID, reportID, backTo} = route.params;
    const {actions} = useSearchContext();
    const {removeTransaction} = actions;
    const [reportPolicyID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`, {canBeMissing: false, selector: getReportPolicyID});
    const policy = usePolicy(reportPolicyID);
    const [allBetas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: false});
    const {superWideRHPRouteKeys} = useContext(WideRHPContext);

    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM>) => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }

        const urlToNavigateBack = rejectMoneyRequest(transactionID, reportID, values.comment, policy, allBetas);
        removeTransaction(transactionID);
        // If the super wide rhp is not opened, dismiss the entire modal.
        if (superWideRHPRouteKeys.length > 0) {
            Navigation.dismissToSuperWideRHP();
        } else {
            Navigation.dismissModal();
        }
        if (urlToNavigateBack && getIsSmallScreenWidth()) {
            Navigation.isNavigationReady().then(() => Navigation.goBack(urlToNavigateBack));
        }
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM> = getFieldRequiredErrors(values, [INPUT_IDS.COMMENT]);

            if (!values.comment) {
                errors.comment = translate('common.error.fieldRequired');
            }
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
            backTo={backTo}
        />
    );
}

export default RejectReasonPage;
