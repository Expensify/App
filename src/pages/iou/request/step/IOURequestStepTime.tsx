import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import TimeModalPicker from '@components/TimeModalPicker';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import {addErrorMessage} from '@libs/ErrorUtils';
import {isValidMoneyRequestType} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getActivePoliciesWithExpenseChatAndPerDiemEnabled} from '@libs/PolicyUtils';
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

    /** Indicates whether the transaction data is loading */
    isLoadingTransaction?: boolean;

    /** The report linked to the transaction */
    report: OnyxEntry<Report>;
};

function IOURequestStepTime({
    route: {
        params: {action, iouType, reportID, transactionID, backTo},
        name,
    },
    transaction,
    isLoadingTransaction,
    report,
}: IOURequestStepTimeProps) {
    const styles = useThemeStyles();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getIOURequestPolicyID(transaction, report)}`, {canBeMissing: true});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const {translate} = useLocalize();
    const currentDateAttributes = transaction?.comment?.customUnit?.attributes?.dates;
    const currentStartDate = currentDateAttributes?.start ? DateUtils.extractDate(currentDateAttributes.start) : undefined;
    const currentEndDate = currentDateAttributes?.end ? DateUtils.extractDate(currentDateAttributes.end) : undefined;
    const isEditPage = name === SCREENS.MONEY_REQUEST.STEP_TIME_EDIT;
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFound = !isValidMoneyRequestType(iouType) || isEmptyObject(policy) || (isEditPage && isEmptyObject(transaction?.comment?.customUnit));
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const policiesWithPerDiemEnabled = useMemo(() => getActivePoliciesWithExpenseChatAndPerDiemEnabled(allPolicies, currentUserLogin), [allPolicies, currentUserLogin]);
    const hasMoreThanOnePolicyWithPerDiemEnabled = policiesWithPerDiemEnabled.length > 1;

    const navigateBack = () => {
        if (isEditPage) {
            Navigation.goBack(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, iouType, transactionID, reportID));
            return;
        }

        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }

        if (transaction?.isFromGlobalCreate) {
            if (hasMoreThanOnePolicyWithPerDiemEnabled) {
                Navigation.goBack(ROUTES.MONEY_REQUEST_STEP_DESTINATION.getRoute(action, iouType, transactionID, reportID));
                return;
            }

            // If there is only one per diem policy, we can't override the reportID that is already on the stack to make sure we go back to the right screen.
            Navigation.goBack();
        }

        Navigation.goBack(ROUTES.MONEY_REQUEST_CREATE_TAB_PER_DIEM.getRoute(action, iouType, transactionID, reportID));
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
        [CONST.IOU.TYPE.SEND]: translate('iou.paySomeone', ''),
        [CONST.IOU.TYPE.PAY]: translate('iou.paySomeone', ''),
        [CONST.IOU.TYPE.SPLIT]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.SPLIT_EXPENSE]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.TRACK]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.INVOICE]: translate('workspace.invoices.sendInvoice'),
        [CONST.IOU.TYPE.CREATE]: translate('iou.createExpense'),
    };

    if (isLoadingTransaction) {
        return <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />;
    }

    return (
        <StepScreenWrapper
            headerTitle={backTo ? translate('iou.time') : tabTitles[iouType]}
            onBackButtonPress={navigateBack}
            shouldShowNotFoundPage={shouldShowNotFound}
            shouldShowWrapper
            testID="IOURequestStepTime"
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

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepTimeWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepTime);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepTimeWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepTimeWithFullTransactionOrNotFound);

export default IOURequestStepTimeWithWritableReportOrNotFound;
