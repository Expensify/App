import React, {useCallback, useEffect} from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {useSearchContext} from '@components/Search/SearchContext';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {clearErrorFields, clearErrors} from '@libs/actions/FormActions';
import {rejectMoneyRequestsOnSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import RejectReasonFormView from '@pages/iou/RejectReasonFormView';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/MoneyRequestRejectReasonForm';

function SearchRejectReasonPage() {
    const {translate} = useLocalize();
    const context = useSearchContext();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const onSubmit = useCallback(
        ({comment}: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM>) => {
            rejectMoneyRequestsOnSearch(context.currentSearchHash, context.selectedTransactions, comment, allPolicies, allReports);
            context.clearSelectedTransactions();
            Navigation.goBack();
        },
        [context, allPolicies, allReports],
    );

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM> = getFieldRequiredErrors(values, [INPUT_IDS.COMMENT]);
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
        />
    );
}

SearchRejectReasonPage.displayName = 'SearchRejectReasonPage';

export default SearchRejectReasonPage;
