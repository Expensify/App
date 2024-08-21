import type {RouteProp} from '@react-navigation/native';
import React, {useCallback, useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import useLocalize from '@hooks/useLocalize';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as FormActions from '@userActions/FormActions';
import * as IOU from '@userActions/IOU';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/MoneyRequestHoldReasonForm';
import HoldReasonFormView from './HoldReasonFormView';

type HoldReasonPageRouteParams = {
    /** ID of the transaction the page was opened for */
    transactionID: string;

    /** ID of the report that user is providing hold reason to */
    reportID: string;

    /** Link to previous page */
    backTo: Route;
};

type HoldReasonPageProps = {
    /** Navigation route context info provided by react navigation */
    route: RouteProp<{params: HoldReasonPageRouteParams}>;
};

function HoldReasonPage({route}: HoldReasonPageProps) {
    const {translate} = useLocalize();

    const {transactionID, reportID, backTo} = route.params;

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID || -1}`);

    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
        if (ReportUtils.isReportUnsubmitted(report)) {
            return;
        }

        IOU.putOnHold(transactionID, values.comment, reportID);
        Navigation.navigate(backTo);
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM> = ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.COMMENT]);

            if (!values.comment) {
                errors.comment = translate('common.error.fieldRequired');
            }

            if (ReportUtils.isReportUnsubmitted(report)) {
                const formErrors = {};
                ErrorUtils.addErrorMessage(formErrors, 'reportModified', translate('common.error.requestModified'));
                FormActions.setErrors(ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM, formErrors);
            }

            return errors;
        },
        [report, translate],
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

HoldReasonPage.displayName = 'MoneyRequestHoldReasonPage';

export default HoldReasonPage;
