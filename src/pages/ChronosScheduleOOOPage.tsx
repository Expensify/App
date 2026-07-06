import AmountForm from '@components/AmountForm';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {NumberWithSymbolFormRef} from '@components/NumberWithSymbolForm';
import PercentageForm from '@components/PercentageForm';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import type {ValuePickerItem} from '@components/ValuePicker/types';
import ValueSelectorModal from '@components/ValuePicker/ValueSelectorModal';

import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {buildOOOCommand, computeDurationDays, computeEndDate, parseDate} from '@libs/ChronosUtils';
import {addErrorMessage} from '@libs/ErrorUtils';
import {replaceCommasWithPeriod} from '@libs/MoneyRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {ChronosScheduleOOONavigatorParamList} from '@navigation/types';

import {addComment} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/ChronosScheduleOOOForm';

import {differenceInCalendarDays} from 'date-fns';
import React, {useRef, useState} from 'react';
import {View} from 'react-native';

type ChronosScheduleOOOPageProps = PlatformStackScreenProps<ChronosScheduleOOONavigatorParamList, typeof SCREENS.CHRONOS_SCHEDULE_OOO_ROOT>;

function ChronosScheduleOOOPage({route}: ChronosScheduleOOOPageProps) {
    const {reportID} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {accountID: currentUserAccountID, timezone: timezoneParam} = useCurrentUserPersonalDetails();
    const isInSidePanel = useIsInSidePanel();
    const delegateAccountID = useDelegateAccountID();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [isDurationUnitModalVisible, setIsDurationUnitModalVisible] = useState(false);
    const [selectedDurationUnit, setSelectedDurationUnit] = useState<string>(CONST.CHRONOS.OOO_DURATION_UNITS.DAY);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [durationAmount, setDurationAmount] = useState('');
    const durationAmountRef = useRef<NumberWithSymbolFormRef | null>(null);
    const lastEditedRef = useRef<'duration' | 'endDate' | null>(null);
    const ancestors = useAncestors(report);

    const durationUnitItems = [
        {value: CONST.CHRONOS.OOO_DURATION_UNITS.HOUR, label: translate('chronos.hour')},
        {value: CONST.CHRONOS.OOO_DURATION_UNITS.DAY, label: translate('chronos.day')},
        {value: CONST.CHRONOS.OOO_DURATION_UNITS.WEEK, label: translate('chronos.week')},
        {value: CONST.CHRONOS.OOO_DURATION_UNITS.MONTH, label: translate('chronos.month')},
    ];

    const durationUnitButtonLabel = durationUnitItems.find((item) => item.value === selectedDurationUnit)?.label ?? '';

    const startDateAsDate = parseDate(startDate);

    const applyDurationDays = (days: number) => {
        setSelectedDurationUnit(CONST.CHRONOS.OOO_DURATION_UNITS.DAY);
        setDurationAmount(String(days));
        durationAmountRef.current?.updateNumber(String(days));
    };

    const applyDurationUnit = (item: ValuePickerItem) => {
        if (item.value) {
            lastEditedRef.current = 'duration';
            setSelectedDurationUnit(item.value);
            if (startDate && durationAmount) {
                setEndDate(computeEndDate(startDate, durationAmount, item.value));
            }
        }
        setIsDurationUnitModalVisible(false);
    };

    const applyStartDate = (newStartDate: string) => {
        setStartDate(newStartDate);
        if (!newStartDate) {
            return;
        }
        // When the user's most recent intent was to pin an end date, keep that end date and recompute duration.
        if (endDate && lastEditedRef.current !== 'duration') {
            const days = computeDurationDays(newStartDate, endDate);
            if (days === null) {
                // The new start date is after the pinned end date, so the range is no longer valid.
                setEndDate('');
            } else {
                applyDurationDays(days);
            }
            return;
        }
        if (!durationAmount) {
            return;
        }
        setEndDate(computeEndDate(newStartDate, durationAmount, selectedDurationUnit));
    };

    const applyDurationAmount = (newDurationAmount: string) => {
        lastEditedRef.current = 'duration';
        setDurationAmount(newDurationAmount);
        if (!startDate || !newDurationAmount) {
            return;
        }
        setEndDate(computeEndDate(startDate, newDurationAmount, selectedDurationUnit));
    };

    const applyEndDate = (newEndDate: string) => {
        lastEditedRef.current = 'endDate';
        setEndDate(newEndDate);
        if (!startDate || !newEndDate) {
            return;
        }
        const days = computeDurationDays(startDate, newEndDate);
        if (days === null) {
            return;
        }
        applyDurationDays(days);
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.CHRONOS_SCHEDULE_OOO_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.CHRONOS_SCHEDULE_OOO_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.CHRONOS_SCHEDULE_OOO_FORM> = {};

        if (!values[INPUT_IDS.DATE]?.trim()) {
            addErrorMessage(errors, INPUT_IDS.DATE, translate('chronos.dateRequired'));
        }

        const start = parseDate(values[INPUT_IDS.DATE] ?? '');
        const end = parseDate(values[INPUT_IDS.END_DATE] ?? '');
        if (start && end && differenceInCalendarDays(end, start) < 0) {
            addErrorMessage(errors, INPUT_IDS.END_DATE, translate('chronos.endDateBeforeStart'));
        }

        const timeValue = values[INPUT_IDS.TIME]?.trim();
        if (timeValue && !/^([01]?\d|2[0-3])(:[0-5]\d)?$/.test(timeValue)) {
            addErrorMessage(errors, INPUT_IDS.TIME, translate('chronos.invalidTimeFormat'));
        }

        const durationAmountValue = values[INPUT_IDS.DURATION_AMOUNT]?.trim();
        if (durationAmountValue && !/^\d+(\.\d+)?$/.test(replaceCommasWithPeriod(durationAmountValue))) {
            addErrorMessage(errors, INPUT_IDS.DURATION_AMOUNT, translate('chronos.enterANumber'));
        }

        const percentage = values[INPUT_IDS.WORKING_PERCENTAGE]?.replaceAll('%', '').trim();
        if (percentage && !/^\d+(\.\d+)?$/.test(replaceCommasWithPeriod(percentage))) {
            addErrorMessage(errors, INPUT_IDS.WORKING_PERCENTAGE, translate('chronos.enterANumber'));
        }

        return errors;
    };

    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.CHRONOS_SCHEDULE_OOO_FORM>) => {
        const commandText = buildOOOCommand({
            date: values[INPUT_IDS.DATE],
            time: values[INPUT_IDS.TIME],
            durationAmount: values[INPUT_IDS.DURATION_AMOUNT],
            durationUnit: selectedDurationUnit,
            reason: values[INPUT_IDS.REASON],
            workingPercentage: values[INPUT_IDS.WORKING_PERCENTAGE],
        });

        addComment({
            report,
            notifyReportID: reportID,
            ancestors,
            text: commandText,
            timezoneParam: timezoneParam ?? CONST.DEFAULT_TIME_ZONE,
            currentUserAccountID,
            shouldPlaySound: false,
            isInSidePanel,
            delegateAccountID,
        });

        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID="ChronosScheduleOOOPage"
        >
            <HeaderWithBackButton
                title={translate('chronos.scheduleOOOTitle')}
                onBackButtonPress={Navigation.goBack}
            />
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.CHRONOS_SCHEDULE_OOO_FORM}
                onSubmit={onSubmit}
                validate={validate}
                submitButtonText={translate('chronos.scheduleOOO')}
                enabledWhenOffline
            >
                <View style={styles.mb4}>
                    <InputWrapper
                        InputComponent={DatePicker}
                        inputID={INPUT_IDS.DATE}
                        valueType="string"
                        label={translate('chronos.date')}
                        value={startDate}
                        onValueChange={applyStartDate}
                    />
                </View>
                <View style={styles.mb4}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.TIME}
                        label={translate('chronos.time')}
                        accessibilityLabel={translate('chronos.time')}
                        role={CONST.ROLE.PRESENTATION}
                        placeholder="14:30"
                    />
                </View>
                <View style={styles.mb4}>
                    <InputWrapper
                        InputComponent={DatePicker}
                        inputID={INPUT_IDS.END_DATE}
                        valueType="string"
                        label={translate('chronos.endDate')}
                        value={endDate}
                        minDate={startDateAsDate ?? undefined}
                        onValueChange={applyEndDate}
                    />
                </View>
                <View style={styles.mb4}>
                    <InputWrapper
                        InputComponent={AmountForm}
                        inputID={INPUT_IDS.DURATION_AMOUNT}
                        valueType="string"
                        label={translate('chronos.durationAmount')}
                        displayAsTextInput
                        hideCurrencySymbol
                        shouldShowCurrencyButton
                        currencyButtonLabel={durationUnitButtonLabel}
                        currencyButtonAccessibilityLabel={`${translate('common.select')}, ${durationUnitButtonLabel}`}
                        currency={CONST.CURRENCY.USD}
                        decimals={2}
                        value={durationAmount}
                        onValueChange={applyDurationAmount}
                        onCurrencyButtonPress={() => setIsDurationUnitModalVisible(true)}
                        isCurrencyPressable
                        numberFormRef={durationAmountRef}
                    />
                    <ValueSelectorModal
                        isVisible={isDurationUnitModalVisible}
                        label={translate('chronos.durationUnit')}
                        selectedItem={durationUnitItems.find((item) => item.value === selectedDurationUnit)}
                        items={durationUnitItems}
                        onClose={() => setIsDurationUnitModalVisible(false)}
                        onItemSelected={applyDurationUnit}
                        onBackdropPress={Navigation.dismissModal}
                        shouldEnableKeyboardAvoidingView={false}
                    />
                </View>
                <View style={styles.mb4}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.REASON}
                        label={translate('chronos.reason')}
                        accessibilityLabel={translate('chronos.reason')}
                        role={CONST.ROLE.PRESENTATION}
                        placeholder="on vacation"
                    />
                </View>
                <View style={styles.mb4}>
                    <InputWrapper
                        InputComponent={PercentageForm}
                        inputID={INPUT_IDS.WORKING_PERCENTAGE}
                        label={translate('chronos.workingPercentage')}
                        allowDecimal
                        role={CONST.ROLE.PRESENTATION}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

ChronosScheduleOOOPage.displayName = 'ChronosScheduleOOOPage';

export default ChronosScheduleOOOPage;
