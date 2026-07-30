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
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import {getIOURequestPolicyID, setMoneyRequestDateAttribute} from '@userActions/IOU/MoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
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

type DynamicIOURequestStepTimeProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_TIME | typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_TIME_EDIT> & {
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Indicates whether the transaction data is loading */
    isLoadingTransaction?: boolean;

    /** The report linked to the transaction */
    report: OnyxEntry<Report>;
};

function DynamicIOURequestStepTime({
    route: {
        params: {action, iouType, reportID, transactionID, backToReport},
        name,
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
    const isEditPage = name === SCREENS.MONEY_REQUEST.DYNAMIC_STEP_TIME_EDIT;

    const shouldShowNotFound = !isValidMoneyRequestType(iouType) || isEmptyObject(policy) || (isEditPage && isEmptyObject(transaction?.comment?.customUnit));

    // Back removes this step's dynamic suffix from the current URL. In edit mode the suffix (`time-edit`) sits on the
    // confirmation base, so back returns to confirmation. In the wizard flow the suffix (`time`) sits on the destination
    // base (multi-policy) or the start base (single-policy), so back returns to whichever preceding step was appended to.
    const backPath = useDynamicBackPath(isEditPage ? DYNAMIC_ROUTES.MONEY_REQUEST_STEP_TIME_EDIT.path : DYNAMIC_ROUTES.MONEY_REQUEST_STEP_TIME.path);

    const navigateBack = () => {
        Navigation.goBack(backPath);
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

        if (isEditPage) {
            navigateBack();
        } else {
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_SUBRATE.getRoute(action, iouType, transactionID, reportID, backToReport));
        }
    };

    const tabTitles = {
        [CONST.IOU.TYPE.REQUEST]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.SUBMIT]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.SEND]: translate('iou.paySomeone', ''),
        [CONST.IOU.TYPE.PAY]: translate('iou.paySomeone', ''),
        [CONST.IOU.TYPE.SPLIT]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.SPLIT_EXPENSE]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.TRACK]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.INVOICE]: translate('workspace.invoices.sendInvoice'),
        [CONST.IOU.TYPE.CREATE]: translate('iou.createExpense'),
    };

    if (isLoadingTransaction) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'IOURequestStepTime',
            isLoadingTransaction,
        };
        return (
            <FullScreenLoadingIndicator
                style={[styles.flex1, styles.pRelative]}
                reasonAttributes={reasonAttributes}
            />
        );
    }

    return (
        <StepScreenWrapper
            headerTitle={isEditPage ? translate('iou.time') : tabTitles[iouType]}
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
                <InputWrapper
                    InputComponent={DatePicker}
                    inputID={INPUT_IDS.START_DATE}
                    label={translate('iou.startDate')}
                    defaultValue={currentStartDate}
                    maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                />
                <View style={[styles.mt2, styles.mhn5]}>
                    <InputWrapper
                        InputComponent={TimeModalPicker}
                        inputID={INPUT_IDS.START_TIME}
                        label={translate('iou.startTime')}
                        defaultValue={currentDateAttributes?.start}
                    />
                </View>
                <InputWrapper
                    InputComponent={DatePicker}
                    inputID={INPUT_IDS.END_DATE}
                    label={translate('iou.endDate')}
                    defaultValue={currentEndDate}
                    maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                />
                <View style={[styles.mt2, styles.mhn5]}>
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
