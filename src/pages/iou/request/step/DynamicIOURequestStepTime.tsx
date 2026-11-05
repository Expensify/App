import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import TimeModalPicker from '@components/TimeModalPicker';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';
import {addErrorMessage} from '@libs/ErrorUtils';
import {isValidMoneyRequestType} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';

import {getIOURequestPolicyID, setMoneyRequestDateAttribute} from '@userActions/IOU/MoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestTimeForm';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type DynamicIOURequestStepTimeProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_TIME_EDIT> & {
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    isLoadingTransaction?: boolean;

    /** The report linked to the transaction */
    report: OnyxEntry<Report>;
};

function DynamicIOURequestStepTime({
    route: {
        params: {action, iouType, transactionID},
    },
    transaction,
    isLoadingTransaction,
    report,
}: DynamicIOURequestStepTimeProps) {
    const styles = useThemeStyles();
    const iouPolicyID = getIOURequestPolicyID(transaction, report);
    const {policy} = usePolicyForTransaction({
        transaction,
        reportPolicyID: iouPolicyID,
        action,
        iouType,
        isPerDiemRequest: true,
    });

    const {translate} = useLocalize();
    const currentDateAttributes = transaction?.comment?.customUnit?.attributes?.dates;
    const currentStartDate = currentDateAttributes?.start ? DateUtils.extractDate(currentDateAttributes.start) : undefined;
    const currentEndDate = currentDateAttributes?.end ? DateUtils.extractDate(currentDateAttributes.end) : undefined;
    const shouldShowNotFound = !isValidMoneyRequestType(iouType) || isEmptyObject(policy) || isEmptyObject(transaction?.comment?.customUnit);

    const editBackPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_TIME_EDIT.path);

    const navigateBack = () => {
        Navigation.goBack(editBackPath);
    };

    const validate = (value: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_TIME_FORM>) => {
        const errors = {};
        const newStart = DateUtils.combineDateAndTime(value.startTime, value.startDate);
        const newEnd = DateUtils.combineDateAndTime(value.endTime, value.endDate);

        const isValid = DateUtils.isValidStartEndTimeRange({startTime: newStart, endTime: newEnd});

        if (!isValid) {
            addErrorMessage(errors, INPUT_IDS.END_TIME, translate('common.error.invalidTimeShouldBeFuture'));
        }

        return errors;
    };

    const updateTime = (value: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_TIME_FORM>) => {
        const newStart = DateUtils.combineDateAndTime(value.startTime, value.startDate);
        const newEnd = DateUtils.combineDateAndTime(value.endTime, value.endDate);

        setMoneyRequestDateAttribute(transactionID, newStart, newEnd);
        navigateBack();
    };

    if (isLoadingTransaction) {
        return <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />;
    }

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.time')}
            onBackButtonPress={navigateBack}
            shouldShowNotFoundPage={shouldShowNotFound}
            shouldShowWrapper
            testID="DynamicIOURequestStepTime"
            includeSafeAreaPaddingBottom
        >
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_TIME_FORM}
                validate={validate}
                onSubmit={updateTime}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View style={styles.mv2}>
                    <InputWrapper
                        InputComponent={DatePicker}
                        inputID={INPUT_IDS.START_DATE}
                        label={translate('iou.startDate')}
                        defaultValue={currentStartDate}
                        maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                    />
                </View>
                {/* The time rows carry the form's own horizontal margin, which the page padding already provides. */}
                <View style={styles.mhn4}>
                    <InputWrapper
                        InputComponent={TimeModalPicker}
                        inputID={INPUT_IDS.START_TIME}
                        label={translate('iou.startTime')}
                        defaultValue={currentDateAttributes?.start}
                    />
                </View>
                <View style={styles.mv2}>
                    <InputWrapper
                        InputComponent={DatePicker}
                        inputID={INPUT_IDS.END_DATE}
                        label={translate('iou.endDate')}
                        defaultValue={currentEndDate}
                        maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                    />
                </View>
                <View style={styles.mhn4}>
                    <InputWrapper
                        InputComponent={TimeModalPicker}
                        inputID={INPUT_IDS.END_TIME}
                        label={translate('iou.endTime')}
                        defaultValue={currentDateAttributes?.end}
                    />
                </View>
            </FormProvider>
        </StepScreenWrapper>
    );
}

const DynamicIOURequestStepTimeWithFullTransactionOrNotFound = withFullTransactionOrNotFound(DynamicIOURequestStepTime);

const DynamicIOURequestStepTimeWithWritableReportOrNotFound = withWritableReportOrNotFound(DynamicIOURequestStepTimeWithFullTransactionOrNotFound);

export default DynamicIOURequestStepTimeWithWritableReportOrNotFound;
