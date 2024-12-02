import React, {useCallback, useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import useLocalize from '@hooks/useLocalize';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList, SearchReportParamList} from '@libs/Navigation/types';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as FormActions from '@userActions/FormActions';
import * as IOU from '@userActions/IOU';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestHoldReasonForm';
import HoldReasonFormView from './HoldReasonFormView';

type HoldReasonPageProps =
    | PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.HOLD>
    | PlatformStackScreenProps<SearchReportParamList, typeof SCREENS.SEARCH.TRANSACTION_HOLD_REASON_RHP>;

function HoldReasonPage({route}: HoldReasonPageProps) {
    const {translate} = useLocalize();

    const {transactionID, reportID, backTo, searchHash} = route.params;

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID || -1}`);

    // We first check if the report is part of a policy - if not, then it's a personal request (1:1 request)
    // For personal requests, we need to allow both users to put the request on hold
    const isWorkspaceRequest = ReportUtils.isReportInGroupPolicy(report);
    const parentReportAction = ReportActionsUtils.getReportAction(report?.parentReportID ?? '-1', report?.parentReportActionID ?? '-1');

    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
        // We have extra isWorkspaceRequest condition since, for 1:1 requests, canEditMoneyRequest will rightly return false
        // as we do not allow requestee to edit fields like description and amount.
        // But, we still want the requestee to be able to put the request on hold
        if (ReportActionsUtils.isMoneyRequestAction(parentReportAction) && !ReportUtils.canEditMoneyRequest(parentReportAction) && isWorkspaceRequest) {
            return;
        }

        IOU.putOnHold(transactionID, values.comment, reportID, searchHash);
        Navigation.navigate(backTo);
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM> = ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.COMMENT]);

            if (!values.comment) {
                errors.comment = translate('common.error.fieldRequired');
            }
            // We have extra isWorkspaceRequest condition since, for 1:1 requests, canEditMoneyRequest will rightly return false
            // as we do not allow requestee to edit fields like description and amount.
            // But, we still want the requestee to be able to put the request on hold
            if (ReportActionsUtils.isMoneyRequestAction(parentReportAction) && !ReportUtils.canEditMoneyRequest(parentReportAction) && isWorkspaceRequest) {
                const formErrors = {};
                ErrorUtils.addErrorMessage(formErrors, 'reportModified', translate('common.error.requestModified'));
                FormActions.setErrors(ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM, formErrors);
            }

            return errors;
        },
        [parentReportAction, isWorkspaceRequest, translate],
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
