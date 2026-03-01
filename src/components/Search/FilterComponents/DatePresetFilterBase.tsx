import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
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
import {getDateRangeDisplayValueFromFormValue, getRangeBoundariesFromFormValue, getRangeQueryValue, isSearchDatePreset} from '@libs/SearchQueryUtils';
import type {SearchDateModifier} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import RangeDatePicker from './RangeDatePicker';
import SearchDatePickerDay from './SearchDatePickerDay';

type SearchDateValues = Record<SearchDateModifier, string | undefined>;

type DatePresetFilterBaseHandle = {
    /** Gets date values */
    getDateValues: () => SearchDateValues;

    /** Gets the formatted range display text for current date values */
    getRangeDisplayText: () => string;

    /** Clears date values */
    clearDateValues: () => void;

    /** Sets the date value of the selected date modifier to the ephemeral date value (the selected date in calendar) */
    setDateValueOfSelectedDateModifier: () => void;

    /** Clears the date value of the selected date modifier */
    clearDateValueOfSelectedDateModifier: () => void;

    /** Restores the Range value to what it was when Range mode was entered, discarding any unsaved ephemeral picks */
    restoreRangeToEntrySnapshot: () => void;

    /** Resets date values to the provided defaults */
    resetDateValuesToDefault: () => void;

    /** Validates the selected date modifier input */
    validate: () => boolean;
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

    /** Callback when range validation error changes */
    onRangeValidationErrorChange?: (shouldShowRangeError: boolean) => void;

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
    onRangeValidationErrorChange,
    forceVerticalCalendars = false,
    ref,
}: DatePresetFilterBaseProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const shouldShowHorizontalRule = !!presets?.length;

    const getRangeDisplayTextFromDateValues = useCallback((dateValues: SearchDateValues) => {
        const rangeValue = dateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE];
        if (!rangeValue) {
            return '';
        }
        return getDateRangeDisplayValueFromFormValue(rangeValue, dateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER], dateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE]);
    }, []);

    const [dateValues, setDateValues] = useState<SearchDateValues>(defaultDateValues);
    const dateValuesRef = useRef<SearchDateValues>(defaultDateValues);
    const updateDateValues = useCallback((updater: SearchDateValues | ((prevDateValues: SearchDateValues) => SearchDateValues)) => {
        const nextDateValues = typeof updater === 'function' ? updater(dateValuesRef.current) : updater;
        dateValuesRef.current = nextDateValues;
        setDateValues(nextDateValues);
    }, []);

    useEffect(() => {
        onDateValuesChange?.(dateValues);
    }, [onDateValuesChange, dateValues]);

    useEffect(() => {
        if (isSearchAdvancedFiltersFormLoading) {
            return;
        }
        const currentDateValues = dateValuesRef.current;
        const hasDefaultValuesChanged =
            currentDateValues[CONST.SEARCH.DATE_MODIFIERS.ON] !== defaultDateValues[CONST.SEARCH.DATE_MODIFIERS.ON] ||
            currentDateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER] !== defaultDateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER] ||
            currentDateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE] !== defaultDateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE] ||
            currentDateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE] !== defaultDateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE];

        if (!hasDefaultValuesChanged) {
            return;
        }
        dateValuesRef.current = defaultDateValues;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDateValues(defaultDateValues);
    }, [isSearchAdvancedFiltersFormLoading, defaultDateValues]);

    const setDateValue = useCallback(
        (dateModifier: SearchDateModifier, value: string | undefined) => {
            updateDateValues((prevDateValues) => {
                return {...prevDateValues, [dateModifier]: value};
            });
        },
        [updateDateValues],
    );

    const dateDisplayValues = useMemo<SearchDateValues>(() => {
        const dateOn = dateValues[CONST.SEARCH.DATE_MODIFIERS.ON];
        const dateAfter = dateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER];
        const dateBefore = dateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE];
        return {
            // dateOn could be a preset e.g. Last month which should not be displayed as the On field
            [CONST.SEARCH.DATE_MODIFIERS.ON]: isSearchDatePreset(dateOn) ? undefined : dateOn,
            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: dateAfter,
            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: dateBefore,
            [CONST.SEARCH.DATE_MODIFIERS.RANGE]: dateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE] ? 'range' : undefined,
        };
    }, [dateValues]);

    const getInitialEphemeralDateValue = useCallback((dateModifier: SearchDateModifier | null) => (dateModifier ? dateDisplayValues[dateModifier] : undefined), [dateDisplayValues]);
    const [ephemeralDateValue, setEphemeralDateValue] = useState<string | undefined>(() => getInitialEphemeralDateValue(selectedDateModifier));
    const resetEphemeralDateValue = useCallback(
        (dateModifier: SearchDateModifier | null) => setEphemeralDateValue(getInitialEphemeralDateValue(dateModifier)),
        [getInitialEphemeralDateValue],
    );

    // Separate ephemeral state for Range mode calendar selections
    const [rangeEphemeralValues, setRangeEphemeralValues] = useState<{from?: string; to?: string}>(() => {
        const rangeBoundaries = getRangeBoundariesFromFormValue(defaultDateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE]);
        return {
            from: rangeBoundaries.from,
            to: rangeBoundaries.to,
        };
    });

    // Snapshot of the RANGE value at the moment the user enters Range mode.
    // Used to discard unsaved ephemeral picks when pressing back.
    const rangeEntrySnapshotRef = useRef<string | undefined>(undefined);

    const selectDateModifier = useCallback(
        (dateModifier: SearchDateModifier | null) => {
            resetEphemeralDateValue(dateModifier);
            onRangeValidationErrorChange?.(false);

            if (dateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE) {
                const currentDateValues = dateValues;
                // Snapshot the committed range value before the user makes ephemeral picks
                rangeEntrySnapshotRef.current = currentDateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE];
                const rangeBoundaries = getRangeBoundariesFromFormValue(
                    currentDateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE],
                    currentDateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER],
                    currentDateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE],
                );
                setRangeEphemeralValues({
                    from: rangeBoundaries.from,
                    to: rangeBoundaries.to,
                });
            }

            onSelectDateModifier(dateModifier);
        },
        [resetEphemeralDateValue, onSelectDateModifier, onRangeValidationErrorChange, dateValues],
    );

    const validate = useCallback(() => {
        if (selectedDateModifier !== CONST.SEARCH.DATE_MODIFIERS.RANGE) {
            onRangeValidationErrorChange?.(false);
            return true;
        }

        const isValid = !!(rangeEphemeralValues.from && rangeEphemeralValues.to);
        onRangeValidationErrorChange?.(!isValid);
        return isValid;
    }, [onRangeValidationErrorChange, rangeEphemeralValues.from, rangeEphemeralValues.to, selectedDateModifier]);

    useImperativeHandle(
        ref,
        () => ({
            getDateValues() {
                return dateValuesRef.current;
            },

            getRangeDisplayText() {
                return getRangeDisplayTextFromDateValues(dateValuesRef.current);
            },

            resetDateValuesToDefault() {
                dateValuesRef.current = defaultDateValues;
                updateDateValues(defaultDateValues);
                onRangeValidationErrorChange?.(false);
            },

            validate() {
                return validate();
            },

            clearDateValues() {
                const clearedValues = {
                    [CONST.SEARCH.DATE_MODIFIERS.ON]: undefined,
                    [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
                    [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
                    [CONST.SEARCH.DATE_MODIFIERS.RANGE]: undefined,
                };
                dateValuesRef.current = clearedValues;
                updateDateValues(clearedValues);
                onRangeValidationErrorChange?.(false);
            },

            setDateValueOfSelectedDateModifier() {
                if (!selectedDateModifier) {
                    return;
                }

                const currentDateValues = dateValuesRef.current;
                // For Range, mark as Range mode without altering ON/AFTER/BEFORE values.
                if (selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE) {
                    const rangeValue = getRangeQueryValue(rangeEphemeralValues.from, rangeEphemeralValues.to) || undefined;
                    const updatedValues = {...currentDateValues, [CONST.SEARCH.DATE_MODIFIERS.RANGE]: rangeValue};
                    dateValuesRef.current = updatedValues;
                    setDateValue(CONST.SEARCH.DATE_MODIFIERS.RANGE, rangeValue);
                    return;
                }

                const updatedValues = {...currentDateValues, [selectedDateModifier]: ephemeralDateValue};
                dateValuesRef.current = updatedValues;
                setDateValue(selectedDateModifier, ephemeralDateValue);
            },

            clearDateValueOfSelectedDateModifier() {
                if (!selectedDateModifier) {
                    return;
                }

                const currentDateValues = dateValuesRef.current;
                // Range flag is independent metadata and should not clear ON/AFTER/BEFORE values.
                if (selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE) {
                    const updatedValues = {...currentDateValues, [CONST.SEARCH.DATE_MODIFIERS.RANGE]: undefined};
                    dateValuesRef.current = updatedValues;
                    setRangeEphemeralValues({});
                    setDateValue(CONST.SEARCH.DATE_MODIFIERS.RANGE, undefined);
                    onRangeValidationErrorChange?.(false);
                    return;
                }

                const updatedValues = {...currentDateValues, [selectedDateModifier]: undefined};
                dateValuesRef.current = updatedValues;
                setDateValue(selectedDateModifier, undefined);
                onRangeValidationErrorChange?.(false);
            },

            restoreRangeToEntrySnapshot() {
                const snapshotValue = rangeEntrySnapshotRef.current;
                const currentDateValues = dateValuesRef.current;
                const updatedValues = {...currentDateValues, [CONST.SEARCH.DATE_MODIFIERS.RANGE]: snapshotValue};
                dateValuesRef.current = updatedValues;
                updateDateValues(updatedValues);
                onRangeValidationErrorChange?.(false);
            },
        }),
        [
            selectedDateModifier,
            defaultDateValues,
            ephemeralDateValue,
            rangeEphemeralValues.from,
            rangeEphemeralValues.to,
            getRangeDisplayTextFromDateValues,
            setDateValue,
            updateDateValues,
            validate,
            onRangeValidationErrorChange,
        ],
    );

    const rangeDescription = getRangeDisplayTextFromDateValues(dateValues) || undefined;

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
                    setRangeEphemeralValues((prev) => {
                        const nextValues = {...prev, from: date};
                        setDateValue(CONST.SEARCH.DATE_MODIFIERS.RANGE, getRangeQueryValue(nextValues.from, nextValues.to) || undefined);
                        return nextValues;
                    });
                }}
                onToSelected={(date) => {
                    setRangeEphemeralValues((prev) => {
                        const nextValues = {...prev, to: date};
                        setDateValue(CONST.SEARCH.DATE_MODIFIERS.RANGE, getRangeQueryValue(nextValues.from, nextValues.to) || undefined);
                        return nextValues;
                    });
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
            DayComponent={SearchDatePickerDay}
        />
    );
}

export type {SearchDateValues, DatePresetFilterBaseHandle as SearchDatePresetFilterBaseHandle};
export default DatePresetFilterBase;
