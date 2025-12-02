import React, {useCallback, useEffect} from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {useSearchContext} from '@components/Search/SearchContext';
import useLocalize from '@hooks/useLocalize';
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
    const {removeTransaction} = useSearchContext();

    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM>) => {
        const urlToNavigateBack = rejectMoneyRequest(transactionID, reportID, values.comment);
        removeTransaction(transactionID);
        Navigation.dismissModal();
        if (urlToNavigateBack) {
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

RejectReasonPage.displayName = 'RejectReasonPage';

export default RejectReasonPage;
