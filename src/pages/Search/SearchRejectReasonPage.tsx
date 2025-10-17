import React, {useCallback, useEffect} from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {useSearchContext} from '@components/Search/SearchContext';
import useLocalize from '@hooks/useLocalize';
import {clearErrorFields, clearErrors} from '@libs/actions/FormActions';
import {rejectMoneyRequestsOnSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import type {SearchReportParamList} from '@navigation/types';
import RejectReasonFormView from '@pages/iou/RejectReasonFormView';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestRejectReasonForm';

function SearchRejectReasonPage({route}: PlatformStackScreenProps<Omit<SearchReportParamList, typeof SCREENS.SEARCH.REPORT_RHP>>) {
    const {translate} = useLocalize();
    const {backTo = ''} = route.params ?? {};
    const context = useSearchContext();

    const onSubmit = useCallback(
        ({comment}: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM>) => {
            rejectMoneyRequestsOnSearch(context.currentSearchHash, context.selectedTransactions, comment);
            context.clearSelectedTransactions();
            Navigation.goBack();
        },
        [context],
    );

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

SearchRejectReasonPage.displayName = 'SearchRejectReasonPage';

export default SearchRejectReasonPage;
