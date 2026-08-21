import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import TimeModalPicker from '@components/TimeModalPicker';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';
import {addErrorMessage} from '@libs/ErrorUtils';
import {isValidMoneyRequestType} from '@libs/IOUUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getActivePoliciesWithExpenseChatAndPerDiemEnabled} from '@libs/PolicyUtils';

import {getIOURequestPolicyID, setMoneyRequestDateAttribute} from '@userActions/IOU/MoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestTimeForm';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useMemo} from 'react';
import {View} from 'react-native';

import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import buildPerDiemTimeBasePath from './perDiemTimeBasePath';
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
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
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

    const editBackPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_TIME_EDIT.path);
    const policiesWithPerDiemEnabled = useMemo(() => getActivePoliciesWithExpenseChatAndPerDiemEnabled(allPolicies, currentUserLogin), [allPolicies, currentUserLogin]);
    const hasMoreThanOnePolicyWithPerDiemEnabled = policiesWithPerDiemEnabled.length > 1;

    const buildTimeBasePath = () => buildPerDiemTimeBasePath({transaction, action, iouType, transactionID, reportID, backToReport, hasMoreThanOnePolicyWithPerDiemEnabled});

    const navigateBack = () => {
        if (isEditPage) {
            Navigation.goBack(editBackPath);
            return;
        }

        if (transaction?.isFromGlobalCreate || iouType === CONST.IOU.TYPE.TRACK) {
            // We want to navigate to the destination step only when the first step was the workspace selector.
            if (hasMoreThanOnePolicyWithPerDiemEnabled) {
                Navigation.goBack(buildTimeBasePath());
                return;
            }

            // If there is only one per diem policy, we can't override the reportID that is already on the stack to make sure we go back to the right screen.
            Navigation.goBack();
            return;
        }

        Navigation.goBack(ROUTES.MONEY_REQUEST_CREATE_TAB_PER_DIEM.getRoute(action, iouType, transactionID, reportID, backToReport));
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
            Navigation.navigate(
                createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_SUBRATE.getRoute(), createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_TIME.path, buildTimeBasePath())),
            );
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
