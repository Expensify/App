import type {RouteProp} from '@react-navigation/native';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as FormActions from '@userActions/FormActions';
import * as IOU from '@userActions/IOU';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/MoneyRequestHoldReasonForm';

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
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const {transactionID, reportID, backTo} = route.params;

    const report = ReportUtils.getReport(reportID);

    // We first check if the report is part of a policy - if not, then it's a personal request (1:1 request)
    // For personal requests, we need to allow both users to put the request on hold
    const isWorkspaceRequest = ReportUtils.isReportInGroupPolicy(report);
    const parentReportAction = ReportActionsUtils.getReportAction(report?.parentReportID ?? '-1', report?.parentReportActionID ?? '-1');

    const navigateBack = () => {
        Navigation.navigate(backTo);
    };

    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
        // We have extra isWorkspaceRequest condition since, for 1:1 requests, canEditMoneyRequest will rightly return false
        // as we do not allow requestee to edit fields like description and amount.
        // But, we still want the requestee to be able to put the request on hold
        if (!ReportUtils.canEditMoneyRequest(parentReportAction) && isWorkspaceRequest) {
            return;
        }

        IOU.putOnHold(transactionID, values.comment, reportID);
        navigateBack();
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
            if (!ReportUtils.canEditMoneyRequest(parentReportAction) && isWorkspaceRequest) {
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
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={HoldReasonPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('iou.holdExpense')}
                onBackButtonPress={navigateBack}
            />
            <FormProvider
                formID="moneyHoldReasonForm"
                submitButtonText={translate('iou.holdExpense')}
                style={[styles.flexGrow1, styles.ph5]}
                onSubmit={onSubmit}
                validate={validate}
                enabledWhenOffline
            >
                <Text style={styles.mb6}>{translate('iou.explainHold')}</Text>
                <View>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.COMMENT}
                        valueType="string"
                        name="comment"
                        defaultValue={undefined}
                        label={translate('iou.reason')}
                        accessibilityLabel={translate('iou.reason')}
                        ref={inputCallbackRef}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

HoldReasonPage.displayName = 'MoneyRequestHoldReasonPage';

export default HoldReasonPage;
