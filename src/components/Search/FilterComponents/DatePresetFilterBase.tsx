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
import DateUtils from '@libs/DateUtils';
import {isSearchDatePreset} from '@libs/SearchQueryUtils';
import type {SearchDateModifier} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import RangeDatePicker from './RangeDatePicker';

type SearchDateValues = Record<SearchDateModifier, string | undefined>;

type DatePresetFilterBaseHandle = {
    /** Gets date values */
    getDateValues: () => SearchDateValues;

    /** Clears date values */
    clearDateValues: () => void;

    /** Sets the date value of the selected date modifier to the ephemeral date value (the selected date in calendar) and returns the updated values */
    setDateValueOfSelectedDateModifier: () => SearchDateValues;

    /** Clears the date value of the selected date modifier */
    clearDateValueOfSelectedDateModifier: () => void;

    /** Resets date values to the provided defaults */
    resetDateValuesToDefault: () => void;
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

    /** Whether the range error should be rendered inside the picker */
    shouldShowRangeErrorInPicker?: boolean;

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
function DatePresetFilterBase({
    defaultDateValues,
    selectedDateModifier,
    onSelectDateModifier,
    presets,
    isSearchAdvancedFiltersFormLoading,
    shouldShowRangeError = false,
    shouldShowRangeErrorInPicker = true,
    onDateValuesChange,
    forceVerticalCalendars = false,
    ref,
}: DatePresetFilterBaseProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const shouldShowHorizontalRule = !!presets?.length;

    const [dateValues, setDateValues] = useState<SearchDateValues>(defaultDateValues);
    const updateDateValues = useCallback(
        (updater: SearchDateValues | ((prevDateValues: SearchDateValues) => SearchDateValues)) => {
            setDateValues((prevDateValues) => {
                const nextDateValues = typeof updater === 'function' ? updater(prevDateValues) : updater;
                onDateValuesChange?.(nextDateValues);
                return nextDateValues;
            });
        },
        [onDateValuesChange],
    );

    useEffect(() => {
        if (isSearchAdvancedFiltersFormLoading) {
            return;
        }
        setDateValues(defaultDateValues);
    }, [isSearchAdvancedFiltersFormLoading, defaultDateValues]);

    const setDateValue = useCallback(
        (dateModifier: SearchDateModifier, value: string | undefined) => {
            updateDateValues((prevDateValues) => {
                // Preset values clear all other filters
                if (dateModifier === CONST.SEARCH.DATE_MODIFIERS.ON && isSearchDatePreset(value)) {
                    return {
                        [CONST.SEARCH.DATE_MODIFIERS.ON]: value,
                        [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
                        [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
                        [CONST.SEARCH.DATE_MODIFIERS.RANGE]: undefined,
                    };
                }

                // If a preset was set, clear it when setting any other modifier
                if (dateModifier !== CONST.SEARCH.DATE_MODIFIERS.ON && isSearchDatePreset(prevDateValues[CONST.SEARCH.DATE_MODIFIERS.ON])) {
                    return {
                        ...prevDateValues,
                        [dateModifier]: value,
                        [CONST.SEARCH.DATE_MODIFIERS.ON]: undefined,
                    };
                }

                // Setting RANGE: clear ON only (AFTER and BEFORE are set separately)
                if (dateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE) {
                    return {
                        ...prevDateValues,
                        [CONST.SEARCH.DATE_MODIFIERS.ON]: undefined,
                        [CONST.SEARCH.DATE_MODIFIERS.RANGE]: value,
                    };
                }

                // Setting ON, AFTER, or BEFORE individually
                if (dateModifier === CONST.SEARCH.DATE_MODIFIERS.ON || dateModifier === CONST.SEARCH.DATE_MODIFIERS.AFTER || dateModifier === CONST.SEARCH.DATE_MODIFIERS.BEFORE) {
                    const isInRangeMode = selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE;

                    if (isInRangeMode) {
                        // In Range mode: building the range, clear ON, keep RANGE flag
                        return {
                            ...prevDateValues,
                            [dateModifier]: value,
                            [CONST.SEARCH.DATE_MODIFIERS.ON]: undefined,
                        };
                    }

                    // Not in Range mode: clear RANGE and handle individual filters
                    if (dateModifier === CONST.SEARCH.DATE_MODIFIERS.ON && !!prevDateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE]) {
                        // ON overrides everything including any Range values
                        return {
                            [CONST.SEARCH.DATE_MODIFIERS.ON]: value,
                            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
                            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
                            [CONST.SEARCH.DATE_MODIFIERS.RANGE]: undefined,
                        };
                    }

                    // Otherwise: Just clear RANGE flag, keep all other values
                    return {
                        ...prevDateValues,
                        [dateModifier]: value,
                        [CONST.SEARCH.DATE_MODIFIERS.RANGE]: undefined,
                    };
                }

                return {...prevDateValues, [dateModifier]: value};
            });
        },
        [updateDateValues, selectedDateModifier],
    );

    const dateDisplayValues = useMemo<SearchDateValues>(() => {
        const dateOn = dateValues[CONST.SEARCH.DATE_MODIFIERS.ON];
        const dateAfter = dateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER];
        const dateBefore = dateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE];
        // Treat as Range mode ONLY if explicitly set via RANGE flag
        const isRangeMode = !!dateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE];

        return {
            // dateOn could be a preset e.g. Last month which should not be displayed as the On field
            [CONST.SEARCH.DATE_MODIFIERS.ON]: isSearchDatePreset(dateOn) ? undefined : dateOn,
            // Show After/Before on their items only when NOT in Range mode
            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: isRangeMode ? undefined : dateAfter,
            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: isRangeMode ? undefined : dateBefore,
            // Show Range only when RANGE flag is set and both dates exist
            [CONST.SEARCH.DATE_MODIFIERS.RANGE]: isRangeMode && dateAfter && dateBefore ? 'range' : undefined,
        };
    }, [dateValues]);

    const getInitialEphemeralDateValue = useCallback((dateModifier: SearchDateModifier | null) => (dateModifier ? dateDisplayValues[dateModifier] : undefined), [dateDisplayValues]);
    const [ephemeralDateValue, setEphemeralDateValue] = useState<string | undefined>(() => getInitialEphemeralDateValue(selectedDateModifier));
    const resetEphemeralDateValue = useCallback(
        (dateModifier: SearchDateModifier | null) => setEphemeralDateValue(getInitialEphemeralDateValue(dateModifier)),
        [getInitialEphemeralDateValue],
    );

    // Separate ephemeral state for Range mode to avoid showing individual AFTER/BEFORE values
    const [rangeEphemeralValues, setRangeEphemeralValues] = useState<{from?: string; to?: string}>({});

    const selectDateModifier = useCallback(
        (dateModifier: SearchDateModifier | null) => {
            resetEphemeralDateValue(dateModifier);

            // When entering Range mode
            if (dateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE) {
                if (dateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE]) {
                    // Load existing Range values from saved state
                    setRangeEphemeralValues({
                        from: dateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER],
                        to: dateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE],
                    });
                } else {
                    // Start fresh with empty range values
                    setRangeEphemeralValues({});
                }
            }

            onSelectDateModifier(dateModifier);
        },
        [resetEphemeralDateValue, onSelectDateModifier, dateValues],
    );

    useImperativeHandle(
        ref,
        () => ({
            getDateValues() {
                return dateValues;
            },

            resetDateValuesToDefault() {
                updateDateValues(defaultDateValues);
            },

            clearDateValues() {
                updateDateValues({
                    [CONST.SEARCH.DATE_MODIFIERS.ON]: undefined,
                    [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
                    [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
                    [CONST.SEARCH.DATE_MODIFIERS.RANGE]: undefined,
                });
            },

            setDateValueOfSelectedDateModifier() {
                if (!selectedDateModifier) {
                    return dateValues;
                }

                // For Range, mark as Range mode (values are already set via setDateValue)
                if (selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE) {
                    const updatedValues = {...dateValues, [CONST.SEARCH.DATE_MODIFIERS.RANGE]: 'range'};
                    setDateValue(CONST.SEARCH.DATE_MODIFIERS.RANGE, 'range');
                    return updatedValues;
                }

                // Compute the new values synchronously based on setDateValue logic
                let updatedValues: SearchDateValues;

                // Preset values clear all other filters
                if (selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.ON && isSearchDatePreset(ephemeralDateValue)) {
                    updatedValues = {
                        [CONST.SEARCH.DATE_MODIFIERS.ON]: ephemeralDateValue,
                        [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
                        [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
                        [CONST.SEARCH.DATE_MODIFIERS.RANGE]: undefined,
                    };
                } else if (selectedDateModifier !== CONST.SEARCH.DATE_MODIFIERS.ON && isSearchDatePreset(dateValues[CONST.SEARCH.DATE_MODIFIERS.ON])) {
                    updatedValues = {
                        ...dateValues,
                        [selectedDateModifier]: ephemeralDateValue,
                        [CONST.SEARCH.DATE_MODIFIERS.ON]: undefined,
                    };
                } else if (
                    selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.ON ||
                    selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.AFTER ||
                    selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.BEFORE
                ) {
                    // Setting ON, AFTER, or BEFORE individually
                    const hadRange = !!dateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE];

                    if (selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.ON && hadRange) {
                        // ON overrides everything including any Range values
                        updatedValues = {
                            [CONST.SEARCH.DATE_MODIFIERS.ON]: ephemeralDateValue,
                            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
                            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
                            [CONST.SEARCH.DATE_MODIFIERS.RANGE]: undefined,
                        };
                    } else {
                        // AFTER and BEFORE: Just clear RANGE flag, keep all other values
                        updatedValues = {
                            ...dateValues,
                            [selectedDateModifier]: ephemeralDateValue,
                            [CONST.SEARCH.DATE_MODIFIERS.RANGE]: undefined,
                        };
                    }
                } else {
                    updatedValues = {...dateValues, [selectedDateModifier]: ephemeralDateValue};
                }

                // Update state asynchronously
                setDateValue(selectedDateModifier, ephemeralDateValue);

                // Return the computed values immediately
                return updatedValues;
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
        [selectedDateModifier, dateValues, defaultDateValues, ephemeralDateValue, setDateValue, updateDateValues],
    );

    const rangeFromValue = dateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER];
    const rangeToValue = dateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE];
    const rangeDescription =
        dateDisplayValues[CONST.SEARCH.DATE_MODIFIERS.RANGE] && rangeFromValue && rangeToValue ? DateUtils.getFormattedDateRangeForSearch(rangeFromValue, rangeToValue, true) : undefined;

    if (!selectedDateModifier) {
        return (
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
                    description={rangeDescription}
                    onPress={() => selectDateModifier(CONST.SEARCH.DATE_MODIFIERS.RANGE)}
                />
            </>
        );
    }

    if (selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE) {
        // Use ephemeral state for Range mode to keep it separate from individual filters
        return (
            <RangeDatePicker
                fromValue={rangeEphemeralValues.from}
                toValue={rangeEphemeralValues.to}
                onFromSelected={(date) => {
                    setRangeEphemeralValues((prev) => ({...prev, from: date}));
                    setDateValue(CONST.SEARCH.DATE_MODIFIERS.AFTER, date);
                }}
                onToSelected={(date) => {
                    setRangeEphemeralValues((prev) => ({...prev, to: date}));
                    setDateValue(CONST.SEARCH.DATE_MODIFIERS.BEFORE, date);
                }}
                shouldShowError={shouldShowRangeErrorInPicker ? shouldShowRangeError : false}
                forceVertical={forceVerticalCalendars}
            />
        );
    }

    return (
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
