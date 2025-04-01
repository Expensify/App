import React, {useCallback, useEffect} from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {useMoneyRequestReportContext} from '@components/MoneyRequestReportView/MoneyRequestReportContext';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import HoldReasonFormView from '@pages/iou/HoldReasonFormView';
import {clearErrorFields, clearErrors} from '@userActions/FormActions';
import {holdMoneyRequestOnMoneyRequestReport} from '@src/libs/actions/Search';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/MoneyRequestHoldReasonForm';

type SearchMoneyRequestReportHoldReasonPageRouteParams = {
    /** Link to previous page */
    backTo: Route;

    reportID: string;
};

type SearchMoneyRequestReportHoldReasonPageProps = {
    /** Navigation route context info provided by react navigation */
    route: PlatformStackRouteProp<{params?: SearchMoneyRequestReportHoldReasonPageRouteParams}>;
};

function SearchMoneyRequestReportHoldReasonPage({route}: SearchMoneyRequestReportHoldReasonPageProps) {
    const {translate} = useLocalize();

    const {backTo = '', reportID = ''} = route.params ?? {};
    const {selectedTransactionsID, setSelectedTransactionsID} = useMoneyRequestReportContext(reportID);

    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
        holdMoneyRequestOnMoneyRequestReport(selectedTransactionsID, values.comment);
        setSelectedTransactionsID([...selectedTransactionsID]); // It's needed so the actions in header are recalculated

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
