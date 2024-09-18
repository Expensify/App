import type {RouteProp} from '@react-navigation/native';
import React, {useCallback, useEffect} from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {useSearchContext} from '@components/Search/SearchContext';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import HoldReasonFormView from '@pages/iou/HoldReasonFormView';
import * as FormActions from '@userActions/FormActions';
import * as SearchActions from '@src/libs/actions/Search';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/MoneyRequestHoldReasonForm';

type SearchHoldReasonPageRouteParams = {
    /** Link to previous page */
    backTo: Route;

    transactionID?: string;

    reportID?: string;
};

type SearchHoldReasonPageProps = {
    /** Navigation route context info provided by react navigation */
    route: RouteProp<{params?: SearchHoldReasonPageRouteParams}>;
};

function SearchHoldReasonPage({route}: SearchHoldReasonPageProps) {
    const {translate} = useLocalize();

    const {currentSearchHash, selectedTransactions} = useSearchContext();
    const {backTo = '', transactionID = '', reportID = ''} = route.params ?? {};

    const selectedTransactionIDs = Object.keys(selectedTransactions);
    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
        SearchActions.holdMoneyRequestOnSearch(currentSearchHash, transactionID ? [transactionID] : selectedTransactionIDs, values.comment, reportID);
        Navigation.goBack();
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM> = ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.COMMENT]);

            if (!values.comment) {
                errors.comment = translate('common.error.fieldRequired');
            }

            return errors;
        },
        [translate],
    );

    useEffect(() => {
        FormActions.clearErrors(ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM);
        FormActions.clearErrorFields(ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM);
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
