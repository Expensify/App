import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import ValuePicker from '@components/ValuePicker';
import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {buildOOOCommand} from '@libs/ChronosUtils';
import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ChronosScheduleOOONavigatorParamList} from '@navigation/types';
import {addComment} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/ChronosScheduleOOOForm';

type ChronosScheduleOOOPageProps = PlatformStackScreenProps<ChronosScheduleOOONavigatorParamList, typeof SCREENS.CHRONOS_SCHEDULE_OOO_ROOT>;

function ChronosScheduleOOOPage({route}: ChronosScheduleOOOPageProps) {
    const {reportID} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {accountID: currentUserAccountID, timezone: timezoneParam} = useCurrentUserPersonalDetails();
    const isInSidePanel = useIsInSidePanel();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const ancestors = useAncestors(report);

    const timePeriodItems = [
        {value: 'AM', label: 'AM'},
        {value: 'PM', label: 'PM'},
    ];

    const durationUnitItems = [
        {value: CONST.CHRONOS.OOO_DURATION_UNITS.HOUR, label: translate('chronos.hour')},
        {value: CONST.CHRONOS.OOO_DURATION_UNITS.DAY, label: translate('chronos.day')},
        {value: CONST.CHRONOS.OOO_DURATION_UNITS.WEEK, label: translate('chronos.week')},
        {value: CONST.CHRONOS.OOO_DURATION_UNITS.MONTH, label: translate('chronos.month')},
    ];

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.CHRONOS_SCHEDULE_OOO_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.CHRONOS_SCHEDULE_OOO_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.CHRONOS_SCHEDULE_OOO_FORM> = {};

        if (!values[INPUT_IDS.DATE]?.trim()) {
            addErrorMessage(errors, INPUT_IDS.DATE, translate('chronos.dateRequired'));
        }

        const timeValue = values[INPUT_IDS.TIME]?.trim();
        if (timeValue && !/^(1[0-2]|0?[1-9])(:[0-5]\d)?$/.test(timeValue)) {
            addErrorMessage(errors, INPUT_IDS.TIME, translate('chronos.invalidTimeFormat'));
        }

        const durationAmount = values[INPUT_IDS.DURATION_AMOUNT]?.trim();
        if (durationAmount && !/^\d+$/.test(durationAmount)) {
            addErrorMessage(errors, INPUT_IDS.DURATION_AMOUNT, translate('chronos.enterANumber'));
        }

        const percentage = values[INPUT_IDS.WORKING_PERCENTAGE]?.replaceAll('%', '').trim();
        if (percentage && !/^\d+$/.test(percentage)) {
            addErrorMessage(errors, INPUT_IDS.WORKING_PERCENTAGE, translate('chronos.enterANumber'));
        }

        return errors;
    };

    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.CHRONOS_SCHEDULE_OOO_FORM>) => {
        const commandText = buildOOOCommand({
            date: values[INPUT_IDS.DATE],
            time: values[INPUT_IDS.TIME],
            timePeriod: values[INPUT_IDS.TIME_PERIOD],
            durationAmount: values[INPUT_IDS.DURATION_AMOUNT],
            durationUnit: values[INPUT_IDS.DURATION_UNIT],
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
                    />
                </View>
                <View style={[styles.flexRow, styles.gap2, styles.mb4]}>
                    <View style={styles.flex1}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.TIME}
                            label={translate('chronos.time')}
                            accessibilityLabel={translate('chronos.time')}
                            role={CONST.ROLE.PRESENTATION}
                            placeholder="12:30"
                        />
                    </View>
                    <View style={styles.flex1}>
                        <InputWrapper
                            InputComponent={ValuePicker}
                            inputID={INPUT_IDS.TIME_PERIOD}
                            label="AM/PM"
                            items={timePeriodItems}
                        />
                    </View>
                </View>
                <View style={[styles.flexRow, styles.gap2, styles.mb4]}>
                    <View style={styles.flex1}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.DURATION_AMOUNT}
                            label={translate('chronos.durationAmount')}
                            accessibilityLabel={translate('chronos.durationAmount')}
                            role={CONST.ROLE.PRESENTATION}
                            inputMode={CONST.INPUT_MODE.NUMERIC}
                            placeholder="1"
                        />
                    </View>
                    <View style={styles.flex1}>
                        <InputWrapper
                            InputComponent={ValuePicker}
                            inputID={INPUT_IDS.DURATION_UNIT}
                            defaultValue={CONST.CHRONOS.OOO_DURATION_UNITS.DAY}
                            label={translate('chronos.durationUnit')}
                            items={durationUnitItems}
                        />
                    </View>
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
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.WORKING_PERCENTAGE}
                        label={translate('chronos.workingPercentage')}
                        accessibilityLabel={translate('chronos.workingPercentage')}
                        role={CONST.ROLE.PRESENTATION}
                        inputMode={CONST.INPUT_MODE.NUMERIC}
                        placeholder="0"
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

ChronosScheduleOOOPage.displayName = 'ChronosScheduleOOOPage';

export default ChronosScheduleOOOPage;
