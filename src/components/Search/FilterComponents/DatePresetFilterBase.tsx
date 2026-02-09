import React, {useCallback, useEffect, useImperativeHandle, useMemo, useState} from 'react';
import type {Ref} from 'react';
import CalendarPicker from '@components/DatePicker/CalendarPicker';
import MenuItem from '@components/MenuItem';
import type {SearchDatePreset} from '@components/Search/types';
import SingleSelectListItem from '@components/SelectionListWithSections/SingleSelectListItem';
import SpacerView from '@components/SpacerView';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isSearchDatePreset} from '@libs/SearchQueryUtils';
import DateUtils from '@libs/DateUtils';
import type {SearchDateModifier} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import RangeDatePicker from './RangeDatePicker';

type SearchDateValues = Record<SearchDateModifier, string | undefined>;

type DatePresetFilterBaseHandle = {
    /** Gets date values */
    getDateValues: () => SearchDateValues;

    /** Clears date values */
    clearDateValues: () => void;

    /** Sets the date value of the selected date modifier to the ephemeral date value (the selected date in calendar) */
    setDateValueOfSelectedDateModifier: () => void;

    /** Clears the date value of the selected date modifier */
    clearDateValueOfSelectedDateModifier: () => void;
};

type DatePresetFilterBaseProps = {
    /** Default date values */
    defaultDateValues: SearchDateValues;

    /** Selected date modifier */
    selectedDateModifier: SearchDateModifier | null;

    /** Callback when a date modifier is selected */
    onSelectDateModifier: (dateModifier: SearchDateModifier | null) => void;

    /** The date presets */
    presets?: SearchDatePreset[];

    /** Whether the search advanced filters form Onyx data is loading or not */
    isSearchAdvancedFiltersFormLoading?: boolean;

    /** Whether to show the range validation error */
    shouldShowRangeError?: boolean;

    /** Callback when date values change (useful for parent to track range display text) */
    onDateValuesChange?: (dateValues: SearchDateValues) => void;

    /** Force vertical stacking of calendars in range picker */
    forceVerticalCalendars?: boolean;

    /** The ref handle */
    ref: Ref<DatePresetFilterBaseHandle>;
};

/**
 * SearchDatePresetFilterBase is a partially controlled component:
 * - The selected date modifier is controlled.
 * - The date values are uncontrolled. This is done to avoid duplicating the `setDateValue` logic and also to avoid exposing the `ephemeralDateValue` state.
 *
 * There are cases where the parent is required to alter the internal date values e.g. reset the values, in such cases you should use the ref handle.
 * Typically you are expected to use this component with a save and a reset button.
 * - On save: if a date modifier is selected (i.e. user clicked save at the calendar picker) you should `setDateValueOfSelectedDateModifier` otherwise `getDateValues`
 * - On reset: if a date modifier is selected (i.e. user clicked reset at the calendar picker) you should `clearDateValueOfSelectedDateModifier` otherwise `clearDateValues`
 */
function DatePresetFilterBase({defaultDateValues, selectedDateModifier, onSelectDateModifier, presets, isSearchAdvancedFiltersFormLoading, shouldShowRangeError = false, onDateValuesChange, forceVerticalCalendars = false, ref}: DatePresetFilterBaseProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const shouldShowHorizontalRule = !!presets?.length;

    const [dateValues, setDateValues] = useState<SearchDateValues>(defaultDateValues);

    useEffect(() => {
        if (isSearchAdvancedFiltersFormLoading) {
            return;
        }
        setDateValues(defaultDateValues);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSearchAdvancedFiltersFormLoading]);

    useEffect(() => {
        onDateValuesChange?.(dateValues);
    }, [dateValues, onDateValuesChange]);

    const setDateValue = useCallback((dateModifier: SearchDateModifier, value: string | undefined) => {
        setDateValues((prevDateValues) => {
            if (dateModifier === CONST.SEARCH.DATE_MODIFIERS.ON && isSearchDatePreset(value)) {
                return {
                    [CONST.SEARCH.DATE_MODIFIERS.ON]: value,
                    [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
                    [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
                    [CONST.SEARCH.DATE_MODIFIERS.RANGE]: undefined,
                };
            }

            if (dateModifier !== CONST.SEARCH.DATE_MODIFIERS.ON && isSearchDatePreset(prevDateValues[CONST.SEARCH.DATE_MODIFIERS.ON])) {
                return {
                    ...prevDateValues,
                    [dateModifier]: value,
                    [CONST.SEARCH.DATE_MODIFIERS.ON]: undefined,
                };
            }

            // When setting After or Before individually, clear Range mode
            if (dateModifier === CONST.SEARCH.DATE_MODIFIERS.AFTER || dateModifier === CONST.SEARCH.DATE_MODIFIERS.BEFORE) {
                return {...prevDateValues, [dateModifier]: value, [CONST.SEARCH.DATE_MODIFIERS.RANGE]: undefined};
            }

            return {...prevDateValues, [dateModifier]: value};
        });
    }, []);

    const dateDisplayValues = useMemo<SearchDateValues>(() => {
        const dateOn = dateValues[CONST.SEARCH.DATE_MODIFIERS.ON];
        const dateAfter = dateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER];
        const dateBefore = dateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE];
        const isRangeMode = !!dateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE];

        return {
            // dateOn could be a preset e.g. Last month which should not be displayed as the On field
            [CONST.SEARCH.DATE_MODIFIERS.ON]: isSearchDatePreset(dateOn) ? undefined : dateOn,
            // Show After/Before on their items only when NOT in Range mode
            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: isRangeMode ? undefined : dateAfter,
            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: isRangeMode ? undefined : dateBefore,
            // Show Range only when explicitly in Range mode AND both dates are set
            [CONST.SEARCH.DATE_MODIFIERS.RANGE]: isRangeMode && dateAfter && dateBefore ? 'range' : undefined,
        };
    }, [dateValues]);

    const getInitialEphemeralDateValue = useCallback((dateModifier: SearchDateModifier | null) => (dateModifier ? dateDisplayValues[dateModifier] : undefined), [dateDisplayValues]);
    const [ephemeralDateValue, setEphemeralDateValue] = useState<string | undefined>(() => getInitialEphemeralDateValue(selectedDateModifier));
    const resetEphemeralDateValue = useCallback(
        (dateModifier: SearchDateModifier | null) => setEphemeralDateValue(getInitialEphemeralDateValue(dateModifier)),
        [getInitialEphemeralDateValue],
    );

    const selectDateModifier = useCallback(
        (dateModifier: SearchDateModifier | null) => {
            resetEphemeralDateValue(dateModifier);
            onSelectDateModifier(dateModifier);
        },
        [resetEphemeralDateValue, onSelectDateModifier],
    );

    useImperativeHandle(
        ref,
        () => ({
            getDateValues() {
                return dateValues;
            },

            clearDateValues() {
                setDateValues({
                    [CONST.SEARCH.DATE_MODIFIERS.ON]: undefined,
                    [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
                    [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
                    [CONST.SEARCH.DATE_MODIFIERS.RANGE]: undefined,
                });
            },

            setDateValueOfSelectedDateModifier() {
                if (!selectedDateModifier) {
                    return;
                }

                // For Range, mark as Range mode (values are already set via setDateValue)
                if (selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE) {
                    setDateValue(CONST.SEARCH.DATE_MODIFIERS.RANGE, 'range');
                    return;
                }

                setDateValue(selectedDateModifier, ephemeralDateValue);
            },

            clearDateValueOfSelectedDateModifier() {
                if (!selectedDateModifier) {
                    return;
                }

                // For Range, clear Range flag and both After and Before values
                if (selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE) {
                    setDateValue(CONST.SEARCH.DATE_MODIFIERS.RANGE, undefined);
                    setDateValue(CONST.SEARCH.DATE_MODIFIERS.AFTER, undefined);
                    setDateValue(CONST.SEARCH.DATE_MODIFIERS.BEFORE, undefined);
                    return;
                }

                setDateValue(selectedDateModifier, undefined);
            },
        }),
        [selectedDateModifier, dateValues, ephemeralDateValue, setDateValue],
    );

    return !selectedDateModifier ? (
        <>
            {presets?.map((preset) => (
                <SingleSelectListItem
                    key={preset}
                    showTooltip
                    item={{
                        text: translate(`search.filters.date.presets.${preset}`),
                        isSelected: dateValues[CONST.SEARCH.DATE_MODIFIERS.ON] === preset,
                    }}
                    onSelectRow={() => setDateValue(CONST.SEARCH.DATE_MODIFIERS.ON, preset)}
                    wrapperStyle={styles.flexReset}
                />
            ))}
            {shouldShowHorizontalRule && (
                <SpacerView
                    shouldShow
                    style={[StyleUtils.getBorderColorStyle(theme.border), styles.mh3]}
                />
            )}
            <MenuItem
                shouldShowRightIcon
                viewMode={CONST.OPTION_MODE.COMPACT}
                title={translate('common.on')}
                description={dateDisplayValues[CONST.SEARCH.DATE_MODIFIERS.ON]}
                onPress={() => selectDateModifier(CONST.SEARCH.DATE_MODIFIERS.ON)}
            />
            <MenuItem
                shouldShowRightIcon
                viewMode={CONST.OPTION_MODE.COMPACT}
                title={translate('common.after')}
                description={dateDisplayValues[CONST.SEARCH.DATE_MODIFIERS.AFTER]}
                onPress={() => selectDateModifier(CONST.SEARCH.DATE_MODIFIERS.AFTER)}
            />
            <MenuItem
                shouldShowRightIcon
                viewMode={CONST.OPTION_MODE.COMPACT}
                title={translate('common.before')}
                description={dateDisplayValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE]}
                onPress={() => selectDateModifier(CONST.SEARCH.DATE_MODIFIERS.BEFORE)}
            />
            <MenuItem
                shouldShowRightIcon
                viewMode={CONST.OPTION_MODE.COMPACT}
                title={translate('common.range')}
                description={
                    dateDisplayValues[CONST.SEARCH.DATE_MODIFIERS.RANGE] && dateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER] && dateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE]
                        ? DateUtils.getFormattedDateRangeForSearch(
                              dateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER] as string,
                              dateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE] as string,
                              true,
                          )
                        : undefined
                }
                onPress={() => selectDateModifier(CONST.SEARCH.DATE_MODIFIERS.RANGE)}
            />
        </>
    ) : selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE ? (
        <RangeDatePicker
            fromValue={dateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER]}
            toValue={dateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE]}
            onFromSelected={(date) => setDateValue(CONST.SEARCH.DATE_MODIFIERS.AFTER, date)}
            onToSelected={(date) => setDateValue(CONST.SEARCH.DATE_MODIFIERS.BEFORE, date)}
            shouldShowError={shouldShowRangeError}
            forceVertical={forceVerticalCalendars}
        />
    ) : (
        <CalendarPicker
            value={ephemeralDateValue}
            onSelected={setEphemeralDateValue}
            minDate={CONST.CALENDAR_PICKER.MIN_DATE}
            maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
        />
    );
}

export type {SearchDateValues, DatePresetFilterBaseHandle as SearchDatePresetFilterBaseHandle};
export default DatePresetFilterBase;
