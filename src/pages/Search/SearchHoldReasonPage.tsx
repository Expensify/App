import React, {useCallback, useEffect} from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {useSearchContext} from '@components/Search/SearchContext';
import useLocalize from '@hooks/useLocalize';
import {clearErrorFields, clearErrors} from '@libs/actions/FormActions';
import {holdMoneyRequestOnSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import type {SearchReportParamList} from '@navigation/types';
import HoldReasonFormView from '@pages/iou/HoldReasonFormView';
import {putTransactionsOnHold} from '@userActions/IOU';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestHoldReasonForm';

function SearchHoldReasonPage({route}: PlatformStackScreenProps<Omit<SearchReportParamList, typeof SCREENS.SEARCH.REPORT_RHP>>) {
    const {translate} = useLocalize();
    const {backTo = '', reportID} = route.params ?? {};
    const context = useSearchContext();

    const onSubmit = useCallback(
        ({comment}: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
            if (route.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS) {
                putTransactionsOnHold(context.selectedTransactionIDs, comment, reportID);
                context.clearSelectedTransactions(true);
            } else {
                holdMoneyRequestOnSearch(context.currentSearchHash, Object.keys(context.selectedTransactions), comment);
                context.clearSelectedTransactions();
            }

            Navigation.goBack();
        },
        [route.name, context, reportID],
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

    return (
        <HoldReasonFormView
            onSubmit={onSubmit}
            validate={validate}
            backTo={backTo}
        />
    );
}

SearchHoldReasonPage.displayName = 'SearchHoldReasonPage';

export default SearchHoldReasonPage;
