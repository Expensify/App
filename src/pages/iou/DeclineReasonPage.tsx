import React, {useCallback, useEffect} from 'react';
import {InteractionManager} from 'react-native';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList, SearchReportParamList} from '@libs/Navigation/types';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import {clearErrorFields, clearErrors} from '@userActions/FormActions';
import {declineMoneyRequest} from '@userActions/IOU';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestHoldReasonForm';
import DeclineReasonFormView from './DeclineReasonFormView';

type DeclineReasonPageProps =
    | PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.DECLINE>
    | PlatformStackScreenProps<SearchReportParamList, typeof SCREENS.SEARCH.TRANSACTION_HOLD_REASON_RHP>;

function DeclineReasonPage({route}: DeclineReasonPageProps) {
    const {translate} = useLocalize();

    const {transactionID, reportID, backTo} = route.params;

    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_DECLINE_FORM>) => {
        const urlToNavigateBack = declineMoneyRequest(transactionID, reportID, values.comment);
        Navigation.dismissModal();
        if (urlToNavigateBack) {
            InteractionManager.runAfterInteractions(() => {
                Navigation.navigate(urlToNavigateBack);
            });
        }
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_DECLINE_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.MONEY_REQUEST_DECLINE_FORM> = getFieldRequiredErrors(values, [INPUT_IDS.COMMENT]);

            if (!values.comment) {
                errors.comment = translate('common.error.fieldRequired');
            }
            return errors;
        },
        [translate],
    );

    useEffect(() => {
        clearErrors(ONYXKEYS.FORMS.MONEY_REQUEST_DECLINE_FORM);
        clearErrorFields(ONYXKEYS.FORMS.MONEY_REQUEST_DECLINE_FORM);
    }, []);

    return (
        <DeclineReasonFormView
            onSubmit={onSubmit}
            validate={validate}
            backTo={backTo}
        />
    );
}

DeclineReasonPage.displayName = 'DeclineReasonPage';

export default DeclineReasonPage;
