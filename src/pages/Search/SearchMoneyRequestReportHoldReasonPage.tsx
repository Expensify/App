import React, {useCallback, useEffect} from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {useMoneyRequestReportContext} from '@components/MoneyRequestReportView/MoneyRequestReportContext';
import useLocalize from '@hooks/useLocalize';
import {putOnHold} from '@libs/actions/IOU';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchReportParamList} from '@libs/Navigation/types';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import HoldReasonFormView from '@pages/iou/HoldReasonFormView';
import {clearErrorFields, clearErrors} from '@userActions/FormActions';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestHoldReasonForm';

function SearchMoneyRequestReportHoldReasonPage({route}: PlatformStackScreenProps<SearchReportParamList, typeof SCREENS.SEARCH.TRANSACTION_HOLD_REASON_RHP>) {
    const {translate} = useLocalize();

    const {backTo, reportID} = route.params;
    const {selectedTransactionsID, setSelectedTransactionsID} = useMoneyRequestReportContext(reportID);

    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
        const firstTransactionID = selectedTransactionsID.at(0);
        if (!firstTransactionID) {
            return;
        }

        putOnHold(firstTransactionID, values.comment, reportID);

        // We need to do this so the actions in header are correctly updated
        setSelectedTransactionsID([...selectedTransactionsID]);
        Navigation.goBack();
    };

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

    return (
        <HoldReasonFormView
            onSubmit={onSubmit}
            validate={validate}
            backTo={backTo}
        />
    );
}

SearchMoneyRequestReportHoldReasonPage.displayName = 'SearchMoneyRequestReportHoldReasonPage';

export default SearchMoneyRequestReportHoldReasonPage;
