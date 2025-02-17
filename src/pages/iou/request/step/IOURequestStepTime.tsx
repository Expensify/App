import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import TimeModalPicker from '@components/TimeModalPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import {addErrorMessage} from '@libs/ErrorUtils';
import {isValidMoneyRequestType} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getIOURequestPolicyID, setMoneyRequestDateAttribute} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestTimeForm';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepTimeProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_TIME | typeof SCREENS.MONEY_REQUEST.STEP_TIME_EDIT> & {
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** The report linked to the transaction */
    report: OnyxEntry<Report>;
};

function IOURequestStepTime({
    route: {
        params: {action, iouType, reportID, transactionID, backTo},
        name,
    },
    transaction,
    report,
}: IOURequestStepTimeProps) {
    const styles = useThemeStyles();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getIOURequestPolicyID(transaction, report)}`);
    const {translate} = useLocalize();
    const currentDateAttributes = transaction?.comment?.customUnit?.attributes?.dates;
    const currentStartDate = currentDateAttributes?.start ? DateUtils.extractDate(currentDateAttributes.start) : undefined;
    const currentEndDate = currentDateAttributes?.end ? DateUtils.extractDate(currentDateAttributes.end) : undefined;
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFound = !isValidMoneyRequestType(iouType) || isEmptyObject(transaction?.comment?.customUnit) || isEmptyObject(policy);
    const isEditPage = name === SCREENS.MONEY_REQUEST.STEP_TIME_EDIT;

    const navigateBack = () => {
        if (isEditPage) {
            Navigation.goBack(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, iouType, transactionID, reportID));
            return;
        }

        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }
        Navigation.goBack(ROUTES.MONEY_REQUEST_STEP_DESTINATION.getRoute(action, iouType, transactionID, reportID));
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
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_SUBRATE.getRoute(action, iouType, transactionID, reportID));
        }
    };

    const tabTitles = {
        [CONST.IOU.TYPE.REQUEST]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.SUBMIT]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.SEND]: translate('iou.paySomeone', {name: ''}),
        [CONST.IOU.TYPE.PAY]: translate('iou.paySomeone', {name: ''}),
        [CONST.IOU.TYPE.SPLIT]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.TRACK]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.INVOICE]: translate('workspace.invoices.sendInvoice'),
        [CONST.IOU.TYPE.CREATE]: translate('iou.createExpense'),
    };

    return (
        <StepScreenWrapper
            headerTitle={backTo ? translate('iou.time') : tabTitles[iouType]}
            onBackButtonPress={navigateBack}
            shouldShowNotFoundPage={shouldShowNotFound}
            shouldShowWrapper
            testID={IOURequestStepTime.displayName}
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
                    minDate={CONST.CALENDAR_PICKER.MIN_DATE}
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
                    minDate={CONST.CALENDAR_PICKER.MIN_DATE}
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

IOURequestStepTime.displayName = 'IOURequestStepTime';

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepTimeWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepTime);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepTimeWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepTimeWithFullTransactionOrNotFound);

export default IOURequestStepTimeWithWritableReportOrNotFound;
