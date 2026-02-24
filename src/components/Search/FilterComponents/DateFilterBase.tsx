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
import {getRangeBoundariesFromFormValue} from '@libs/SearchQueryUtils';
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

    const emptyDateValues: SearchDateValues = useMemo(
        () => ({
            [CONST.SEARCH.DATE_MODIFIERS.ON]: undefined,
            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
            [CONST.SEARCH.DATE_MODIFIERS.RANGE]: undefined,
        }),
        [],
    );
    const searchDatePresetFilterBaseRef = useRef<SearchDatePresetFilterBaseHandle>(null);
    const [searchAdvancedFiltersForm, searchAdvancedFiltersFormMetadata] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const isSearchAdvancedFiltersFormLoading = isLoadingOnyxValue(searchAdvancedFiltersFormMetadata);
    const [selectedDateModifier, setSelectedDateModifier] = useState<SearchDateModifier | null>(null);
    const [shouldShowRangeError, setShouldShowRangeError] = useState(false);
    const [trackedDateValues, setTrackedDateValues] = useState<SearchDateValues>(emptyDateValues);

    const updateTrackedDateValues = useCallback((dateValues: SearchDateValues) => {
        setTrackedDateValues(dateValues);
    }, []);

    const handleDateValuesChange = useCallback(
        (dateValues: SearchDateValues) => {
            updateTrackedDateValues(dateValues);
        },
        [updateTrackedDateValues],
    );

    const dateOnKey = dateKey.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)
        ? (dateKey.replace(CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX, CONST.SEARCH.REPORT_FIELD.ON_PREFIX) as ReportFieldDateKey)
        : (`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.ON}` as const);

    const dateBeforeKey = dateKey.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)
        ? (dateKey.replace(CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX, CONST.SEARCH.REPORT_FIELD.BEFORE_PREFIX) as ReportFieldDateKey)
        : (`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}` as const);

    const dateAfterKey = dateKey.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)
        ? (dateKey.replace(CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX, CONST.SEARCH.REPORT_FIELD.AFTER_PREFIX) as ReportFieldDateKey)
        : (`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}` as const);

    const dateRangeKey = dateKey.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)
        ? (`${CONST.SEARCH.REPORT_FIELD.RANGE_PREFIX}${dateKey.replace(CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX, '')}` as ReportFieldDateKey)
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
            const clearedDateValues = searchDatePresetFilterBaseRef.current.clearDateValueOfSelectedDateModifier();
            updateTrackedDateValues(clearedDateValues);
            setSelectedDateModifier(null);
            setShouldShowRangeError(false);
            return;
        }

        updateTrackedDateValues(emptyDateValues);
        searchDatePresetFilterBaseRef.current.clearDateValues();
    }, [selectedDateModifier, emptyDateValues, updateTrackedDateValues]);

    const save = useCallback(() => {
        if (!searchDatePresetFilterBaseRef.current) {
            return;
        }

        if (selectedDateModifier) {
            if (!searchDatePresetFilterBaseRef.current.validate()) {
                return;
            }

            const updatedDateValues = searchDatePresetFilterBaseRef.current.setDateValueOfSelectedDateModifier();
            updateTrackedDateValues(updatedDateValues);
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
    }, [selectedDateModifier, dateOnKey, dateBeforeKey, dateAfterKey, dateRangeKey, onSubmit, updateTrackedDateValues]);

    const goBack = () => {
        if (selectedDateModifier) {
            if (searchDatePresetFilterBaseRef.current && selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE) {
                searchDatePresetFilterBaseRef.current.resetDateValuesToDefault();
                updateTrackedDateValues(defaultDateValues);
            }
            setSelectedDateModifier(null);
            setShouldShowRangeError(false);
            return;
        }

        back();
    };

    const hasRangeFlag = !!trackedDateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE];
    const rangeBoundaries = getRangeBoundariesFromFormValue(
        trackedDateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE],
        trackedDateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER],
        trackedDateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE],
    );
    const rangeFromValue = hasRangeFlag ? rangeBoundaries.from : undefined;
    const rangeToValue = hasRangeFlag ? rangeBoundaries.to : undefined;
    const displayFrom = rangeFromValue;
    const displayTo = rangeToValue;
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
                    onRangeValidationErrorChange={setShouldShowRangeError}
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
