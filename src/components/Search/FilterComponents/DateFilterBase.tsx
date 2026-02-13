import {format, parseISO} from 'date-fns';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScrollView from '@components/ScrollView';
import type {ReportFieldDateKey, SearchDateFilterKeys} from '@components/Search/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import {getDatePresets} from '@libs/SearchUIUtils';
import type {SearchDateModifier, SearchDateModifierLower} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import type {SearchDatePresetFilterBaseHandle, SearchDateValues} from './DatePresetFilterBase';
import DatePresetFilterBase from './DatePresetFilterBase';

type DateFilterBaseProps = {
    title: string;
    dateKey: SearchDateFilterKeys;
    back: () => void;
    onSubmit: (values: Record<string, string | null>) => void;
};

function DateFilterBase({title, dateKey, back, onSubmit}: DateFilterBaseProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const searchDatePresetFilterBaseRef = useRef<SearchDatePresetFilterBaseHandle>(null);
    const [searchAdvancedFiltersForm, searchAdvancedFiltersFormMetadata] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const isSearchAdvancedFiltersFormLoading = isLoadingOnyxValue(searchAdvancedFiltersFormMetadata);
    const [selectedDateModifier, setSelectedDateModifier] = useState<SearchDateModifier | null>(null);
    const [shouldShowRangeError, setShouldShowRangeError] = useState(false);
    const [trackedDateValues, setTrackedDateValues] = useState<SearchDateValues>({
        [CONST.SEARCH.DATE_MODIFIERS.ON]: undefined,
        [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
        [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
        [CONST.SEARCH.DATE_MODIFIERS.RANGE]: undefined,
    });

    const handleDateValuesChange = useCallback((dateValues: SearchDateValues) => {
        setTrackedDateValues(dateValues);
    }, []);

    const dateOnKey = dateKey.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)
        ? (dateKey.replace(CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX, CONST.SEARCH.REPORT_FIELD.ON_PREFIX) as ReportFieldDateKey)
        : (`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.ON}` as const);

    const dateBeforeKey = dateKey.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)
        ? (dateKey.replace(CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX, CONST.SEARCH.REPORT_FIELD.BEFORE_PREFIX) as ReportFieldDateKey)
        : (`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}` as const);

    const dateAfterKey = dateKey.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)
        ? (dateKey.replace(CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX, CONST.SEARCH.REPORT_FIELD.AFTER_PREFIX) as ReportFieldDateKey)
        : (`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}` as const);

    // Range key: For report fields, use GLOBAL_PREFIX + Range + suffix; for regular fields, use dateKey + Range
    const dateRangeKey = dateKey.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)
        ? (`${CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX}${CONST.SEARCH.DATE_MODIFIERS.RANGE}${dateKey.replace(CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX, '')}` as ReportFieldDateKey)
        : (`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.RANGE}` as const);

    const dateOnValue = searchAdvancedFiltersForm?.[dateOnKey];
    const dateBeforeValue = searchAdvancedFiltersForm?.[dateBeforeKey];
    const dateAfterValue = searchAdvancedFiltersForm?.[dateAfterKey];
    const dateRangeValue = searchAdvancedFiltersForm?.[dateRangeKey];

    const defaultDateValues = useMemo(
        () => ({
            [CONST.SEARCH.DATE_MODIFIERS.ON]: dateOnValue,
            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: dateBeforeValue,
            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: dateAfterValue,
            [CONST.SEARCH.DATE_MODIFIERS.RANGE]: dateRangeValue,
        }),
        [dateAfterValue, dateBeforeValue, dateOnValue, dateRangeValue],
    );

    const presets = useMemo(() => {
        const hasFeed = !!searchAdvancedFiltersForm?.feed?.length;
        return getDatePresets(dateKey, hasFeed);
    }, [dateKey, searchAdvancedFiltersForm?.feed]);

    const computedTitle = useMemo(() => {
        if (selectedDateModifier) {
            return translate(`common.${selectedDateModifier.toLowerCase() as SearchDateModifierLower}`);
        }

        return title;
    }, [selectedDateModifier, title, translate]);

    const reset = useCallback(() => {
        if (!searchDatePresetFilterBaseRef.current) {
            return;
        }

        if (selectedDateModifier) {
            searchDatePresetFilterBaseRef.current.clearDateValueOfSelectedDateModifier();
            // Update tracked state to reflect cleared values
            const clearedDateValues = searchDatePresetFilterBaseRef.current.getDateValues();
            setTrackedDateValues(clearedDateValues);
            setShouldShowRangeError(false);
            return;
        }

        searchDatePresetFilterBaseRef.current.clearDateValues();
    }, [selectedDateModifier]);

    const save = useCallback(() => {
        if (!searchDatePresetFilterBaseRef.current) {
            return;
        }

        if (selectedDateModifier) {
            // For Range, validate that both dates are selected
            if (selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE) {
                const dateValues = searchDatePresetFilterBaseRef.current.getDateValues();
                const hasFrom = !!dateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER];
                const hasTo = !!dateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE];

                if (!hasFrom || !hasTo) {
                    setShouldShowRangeError(true);
                    return;
                }
            }

            const updatedDateValues = searchDatePresetFilterBaseRef.current.setDateValueOfSelectedDateModifier();
            setTrackedDateValues(updatedDateValues);
            setSelectedDateModifier(null);
            setShouldShowRangeError(false);
            return;
        }

        const dateValues = searchDatePresetFilterBaseRef.current.getDateValues();
        onSubmit({
            [dateOnKey]: dateValues[CONST.SEARCH.DATE_MODIFIERS.ON] ?? null,
            [dateBeforeKey]: dateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE] ?? null,
            [dateAfterKey]: dateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER] ?? null,
            [dateRangeKey]: dateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE] ?? null,
        });
    }, [selectedDateModifier, dateOnKey, dateBeforeKey, dateAfterKey, dateRangeKey, onSubmit]);

    const goBack = () => {
        if (selectedDateModifier) {
            if (searchDatePresetFilterBaseRef.current && selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE) {
                const hasExistingRange = !!dateRangeValue;
                if (hasExistingRange) {
                    searchDatePresetFilterBaseRef.current.resetDateValuesToDefault();
                    setTrackedDateValues(defaultDateValues);
                } else {
                    searchDatePresetFilterBaseRef.current.clearDateValueOfSelectedDateModifier();
                    const clearedDateValues = searchDatePresetFilterBaseRef.current.getDateValues();
                    setTrackedDateValues(clearedDateValues);
                }
            }
            setSelectedDateModifier(null);
            setShouldShowRangeError(false);
            return;
        }

        back();
    };

    const isInRangeMode = selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE;
    const hasRangeFlag = !!trackedDateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE];
    // MUTUAL EXCLUSIVITY: Only show range values when Range flag is explicitly set
    // When in fresh Range mode (no flag), only show text after BOTH dates selected
    const rangeFromValue = hasRangeFlag ? trackedDateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER] : undefined;
    const rangeToValue = hasRangeFlag ? trackedDateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE] : undefined;

    // For fresh Range selection (no flag), only show text when BOTH dates selected
    const freshSelectionFrom = trackedDateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER];
    const freshSelectionTo = trackedDateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE];
    const hasBothFreshDates = !!(freshSelectionFrom && freshSelectionTo);
    const activeSelectionFrom = isInRangeMode && !hasRangeFlag && hasBothFreshDates ? freshSelectionFrom : undefined;
    const activeSelectionTo = isInRangeMode && !hasRangeFlag && hasBothFreshDates ? freshSelectionTo : undefined;

    const displayFrom = rangeFromValue || activeSelectionFrom;
    const displayTo = rangeToValue || activeSelectionTo;
    const hasRangeInput = !!(displayFrom ?? displayTo);
    let rangeDisplayText = '';
    if (displayFrom && displayTo) {
        rangeDisplayText = DateUtils.getFormattedDateRangeForSearch(displayFrom, displayTo, true);
    } else if (displayFrom || displayTo) {
        const singleRangeValue = displayFrom ?? displayTo;
        if (singleRangeValue) {
            rangeDisplayText = format(parseISO(singleRangeValue), 'MMM d, yyyy');
        }
    }

    return (
        <View style={styles.flex1}>
            <HeaderWithBackButton
                title={computedTitle}
                onBackButtonPress={goBack}
            />
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.pb5]}>
                <DatePresetFilterBase
                    ref={searchDatePresetFilterBaseRef}
                    defaultDateValues={defaultDateValues}
                    selectedDateModifier={selectedDateModifier}
                    onSelectDateModifier={setSelectedDateModifier}
                    presets={presets}
                    isSearchAdvancedFiltersFormLoading={isSearchAdvancedFiltersFormLoading}
                    shouldShowRangeError={shouldShowRangeError}
                    onDateValuesChange={handleDateValuesChange}
                    forceVerticalCalendars
                />
                {selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE && hasRangeInput && (
                    <Text style={[styles.textLabelSupporting, styles.mh5, styles.mt2]}>
                        {`${translate('common.range')}: `}
                        <Text style={[styles.textLabel]}>{rangeDisplayText}</Text>
                    </Text>
                )}
                <View style={styles.flexGrow1} />
                <Button
                    text={translate('common.reset')}
                    onPress={reset}
                    style={[styles.mh4, styles.mt4]}
                    large
                />
                <FormAlertWithSubmitButton
                    buttonText={translate('common.save')}
                    containerStyles={[styles.m4, styles.mt3]}
                    onSubmit={save}
                    enabledWhenOffline
                />
            </ScrollView>
        </View>
    );
}

export default DateFilterBase;
