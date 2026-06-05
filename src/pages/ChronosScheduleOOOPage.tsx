import {addDays, addMonths, differenceInCalendarDays, format, parseISO} from 'date-fns';
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import AmountForm from '@components/AmountForm';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
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
import {buildOOOCommand} from '@libs/ChronosUtils';
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

type ChronosScheduleOOOPageProps = PlatformStackScreenProps<ChronosScheduleOOONavigatorParamList, typeof SCREENS.CHRONOS_SCHEDULE_OOO_ROOT>;

/**
 * Parse a YYYY-MM-DD string into a Date, returning null when invalid.
 */
function parseDate(value: string): Date | null {
    if (!value) {
        return null;
    }
    const parsed = parseISO(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Backend semantics for "ooo {start} for N {unit}": the OOO ends at start + interval - 1 second.
 * For full-day units, the calendar end date is therefore start + interval - 1 day.
 */
function computeEndDate(startDate: string, durationAmount: string, durationUnit: string): string {
    const start = parseDate(startDate);
    if (!start) {
        return '';
    }
    const sanitized = replaceCommasWithPeriod((durationAmount ?? '').trim());
    const amount = Number.parseFloat(sanitized);
    if (!Number.isFinite(amount) || amount <= 0) {
        return startDate;
    }
    const whole = Math.floor(amount);
    switch (durationUnit) {
        case CONST.CHRONOS.OOO_DURATION_UNITS.DAY:
            return format(addDays(start, Math.max(0, whole - 1)), CONST.DATE.FNS_FORMAT_STRING);
        case CONST.CHRONOS.OOO_DURATION_UNITS.WEEK:
            return format(addDays(start, Math.max(0, whole * 7 - 1)), CONST.DATE.FNS_FORMAT_STRING);
        case CONST.CHRONOS.OOO_DURATION_UNITS.MONTH:
            return format(addDays(addMonths(start, whole), -1), CONST.DATE.FNS_FORMAT_STRING);
        case CONST.CHRONOS.OOO_DURATION_UNITS.HOUR:
        default:
            return startDate;
    }
}

/**
 * Inverse of `computeEndDate` for the day unit: end - start + 1 (inclusive of both days).
 * Returns null when the dates are missing or the end precedes the start.
 */
function computeDurationDays(startDate: string, endDate: string): number | null {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (!start || !end) {
        return null;
    }
    const diff = differenceInCalendarDays(end, start);
    if (diff < 0) {
        return null;
    }
    return diff + 1;
}

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
    const ancestors = useAncestors(report);

    const durationUnitItems = useMemo(
        () => [
            {value: CONST.CHRONOS.OOO_DURATION_UNITS.HOUR, label: translate('chronos.hour')},
            {value: CONST.CHRONOS.OOO_DURATION_UNITS.DAY, label: translate('chronos.day')},
            {value: CONST.CHRONOS.OOO_DURATION_UNITS.WEEK, label: translate('chronos.week')},
            {value: CONST.CHRONOS.OOO_DURATION_UNITS.MONTH, label: translate('chronos.month')},
        ],
        [translate],
    );

    const durationUnitButtonLabel = durationUnitItems.find((item) => item.value === selectedDurationUnit)?.label ?? '';

    const startDateAsDate = useMemo(() => parseDate(startDate), [startDate]);

    const onDurationUnitSelected = useCallback(
        (item: ValuePickerItem) => {
            if (item.value) {
                setSelectedDurationUnit(item.value);
                if (startDate && durationAmount) {
                    setEndDate(computeEndDate(startDate, durationAmount, item.value));
                }
            }
            setIsDurationUnitModalVisible(false);
        },
        [startDate, durationAmount],
    );

    const handleStartDateChange = useCallback(
        (newStartDate: string) => {
            setStartDate(newStartDate);
            if (!newStartDate || !durationAmount) {
                return;
            }
            setEndDate(computeEndDate(newStartDate, durationAmount, selectedDurationUnit));
        },
        [durationAmount, selectedDurationUnit],
    );

    const handleDurationAmountChange = useCallback(
        (newDurationAmount: string) => {
            setDurationAmount(newDurationAmount);
            if (!startDate || !newDurationAmount) {
                return;
            }
            setEndDate(computeEndDate(startDate, newDurationAmount, selectedDurationUnit));
        },
        [startDate, selectedDurationUnit],
    );

    const handleEndDateChange = useCallback(
        (newEndDate: string) => {
            setEndDate(newEndDate);
            if (!startDate || !newEndDate) {
                return;
            }
            const days = computeDurationDays(startDate, newEndDate);
            if (days === null) {
                return;
            }
            setSelectedDurationUnit(CONST.CHRONOS.OOO_DURATION_UNITS.DAY);
            setDurationAmount(String(days));
        },
        [startDate],
    );

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
                        label={translate('chronos.date')}
                        value={startDate}
                        onValueChange={(value) => handleStartDateChange(value as string)}
                    />
                </View>
                <View style={styles.mb4}>
                    <InputWrapper
                        InputComponent={DatePicker}
                        inputID={INPUT_IDS.END_DATE}
                        label={translate('chronos.endDate')}
                        value={endDate}
                        minDate={startDateAsDate ?? undefined}
                        onValueChange={(value) => handleEndDateChange(value as string)}
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
                        InputComponent={AmountForm}
                        inputID={INPUT_IDS.DURATION_AMOUNT}
                        label={translate('chronos.durationAmount')}
                        displayAsTextInput
                        hideCurrencySymbol
                        shouldShowCurrencyButton
                        currencyButtonLabel={durationUnitButtonLabel}
                        currencyButtonAccessibilityLabel={`${translate('common.select')}, ${durationUnitButtonLabel}`}
                        currency={CONST.CURRENCY.USD}
                        decimals={2}
                        value={durationAmount}
                        onValueChange={(value) => handleDurationAmountChange(value as string)}
                        onCurrencyButtonPress={() => setIsDurationUnitModalVisible(true)}
                        isCurrencyPressable
                    />
                    <ValueSelectorModal
                        isVisible={isDurationUnitModalVisible}
                        label={translate('chronos.durationUnit')}
                        selectedItem={durationUnitItems.find((item) => item.value === selectedDurationUnit)}
                        items={durationUnitItems}
                        onClose={() => setIsDurationUnitModalVisible(false)}
                        onItemSelected={onDurationUnitSelected}
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
