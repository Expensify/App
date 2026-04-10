import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {Ref} from 'react';
import CalendarPicker from '@components/DatePicker/CalendarPicker';
import MenuItem from '@components/MenuItem';
import type {SearchDatePreset} from '@components/Search/types';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import SpacerView from '@components/SpacerView';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SearchDateValues} from '@libs/SearchQueryUtils';
import {getDateRangeDisplayValueFromFormValue, getEmptyDateValues, getRangeBoundariesFromFormValue, getRangeQueryValue, isSearchDatePreset} from '@libs/SearchQueryUtils';
import type {SearchDateModifier, SearchDateModifierLower} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import RangeDatePicker from './RangeDatePicker';

type CustomDateModifier = Exclude<SearchDateModifier, typeof CONST.SEARCH.DATE_MODIFIERS.RANGE>;

const normalizeDateValues = (dateValues: Partial<SearchDateValues> | SearchDateValues): SearchDateValues => ({
    ...getEmptyDateValues(),
    ...dateValues,
});

const getExclusiveDateValues = (dateModifier: SearchDateModifier, value: string | undefined): SearchDateValues => {
    const exclusiveValues = getEmptyDateValues();
    exclusiveValues[dateModifier] = value;
    return exclusiveValues;
};

function getCustomDateModifierFromDateValues(dateValues: SearchDateValues): CustomDateModifier {
    const onValue = dateValues[CONST.SEARCH.DATE_MODIFIERS.ON];

    if (onValue && !isSearchDatePreset(onValue)) {
        return CONST.SEARCH.DATE_MODIFIERS.ON;
    }

    if (dateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE]) {
        return CONST.SEARCH.DATE_MODIFIERS.BEFORE;
    }

    if (dateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER]) {
        return CONST.SEARCH.DATE_MODIFIERS.AFTER;
    }

    // Default to `On` when no custom date values are set and the custom date page is opened.
    return CONST.SEARCH.DATE_MODIFIERS.ON;
}

function isCustomDateModifier(dateModifier: SearchDateModifier | null): dateModifier is CustomDateModifier {
    return !!dateModifier && dateModifier !== CONST.SEARCH.DATE_MODIFIERS.RANGE;
}

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

    /** Callback when date values change */
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
 * - The date values are uncontrolled. This avoids duplicating the setDateValue logic and exposing ephemeral picker state.
 *
 * There are cases where the parent is required to alter the internal date values, e.g. reset values. In those cases, use the ref handle.
 */
function DatePresetFilterBase({
    defaultDateValues,
    selectedDateModifier,
    onSelectDateModifier,
    presets,
    isSearchAdvancedFiltersFormLoading,
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
    const customDateTitle = translate('search.filters.date.customDate');
    const customRangeTitle = translate('search.filters.date.customRange');
    const normalizedDefaultDateValues = useMemo(() => normalizeDateValues(defaultDateValues), [defaultDateValues]);

    const getRangeDisplayTextFromDateValues = useCallback((dateValues: SearchDateValues) => {
        const rangeValue = dateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE];
        if (!rangeValue) {
            return '';
        }
        return getDateRangeDisplayValueFromFormValue(rangeValue, dateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER], dateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE]);
    }, []);

    const getRangeEphemeralValuesFromDateValues = useCallback((dateValues: SearchDateValues) => {
        const rangeBoundaries = getRangeBoundariesFromFormValue(dateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE]);

        return {
            from: rangeBoundaries.from,
            to: rangeBoundaries.to,
        };
    }, []);

    const notifyDateValuesChange = useCallback(
        (values: SearchDateValues) => {
            onDateValuesChange?.(values);
        },
        [onDateValuesChange],
    );

    const [dateValues, setDateValues] = useState<SearchDateValues>(normalizedDefaultDateValues);
    const dateValuesRef = useRef<SearchDateValues>(normalizedDefaultDateValues);
    const updateDateValues = useCallback(
        (updater: SearchDateValues | ((prevDateValues: SearchDateValues) => SearchDateValues), shouldNotify = true) => {
            const nextDateValues = typeof updater === 'function' ? updater(dateValuesRef.current) : updater;
            dateValuesRef.current = nextDateValues;
            setDateValues(nextDateValues);

            if (shouldNotify) {
                notifyDateValuesChange(nextDateValues);
            }
        },
        [notifyDateValuesChange],
    );

    useEffect(() => {
        if (isSearchAdvancedFiltersFormLoading) {
            return;
        }

        const currentDateValues = dateValuesRef.current;
        const hasDefaultValuesChanged =
            currentDateValues[CONST.SEARCH.DATE_MODIFIERS.ON] !== normalizedDefaultDateValues[CONST.SEARCH.DATE_MODIFIERS.ON] ||
            currentDateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER] !== normalizedDefaultDateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER] ||
            currentDateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE] !== normalizedDefaultDateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE] ||
            currentDateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE] !== normalizedDefaultDateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE];

        if (!hasDefaultValuesChanged) {
            return;
        }

        dateValuesRef.current = normalizedDefaultDateValues;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDateValues(normalizedDefaultDateValues);
    }, [isSearchAdvancedFiltersFormLoading, normalizedDefaultDateValues]);

    const setDateValue = useCallback(
        (dateModifier: SearchDateModifier, value: string | undefined) => {
            updateDateValues((prevDateValues) => {
                if (dateModifier === CONST.SEARCH.DATE_MODIFIERS.ON && isSearchDatePreset(value)) {
                    return getExclusiveDateValues(dateModifier, value);
                }

                if (dateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE) {
                    return {...prevDateValues, [dateModifier]: value};
                }

                if (dateModifier !== CONST.SEARCH.DATE_MODIFIERS.ON && isSearchDatePreset(prevDateValues[CONST.SEARCH.DATE_MODIFIERS.ON])) {
                    return {
                        ...prevDateValues,
                        [dateModifier]: value,
                        [CONST.SEARCH.DATE_MODIFIERS.ON]: undefined,
                    };
                }

                return {...prevDateValues, [dateModifier]: value};
            });
        },
        [updateDateValues],
    );

    const setExclusiveDateValue = useCallback(
        (dateModifier: SearchDateModifier, value: string | undefined) => {
            updateDateValues(getExclusiveDateValues(dateModifier, value));
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

    const [rangeEphemeralValues, setRangeEphemeralValues] = useState<{from?: string; to?: string}>(() => getRangeEphemeralValuesFromDateValues(normalizedDefaultDateValues));

    // Synchronize dateValues when rangeEphemeralValues change, keeping the side effect
    // out of the setRangeEphemeralValues state updater to avoid unpredictable batching on Android.
    useEffect(() => {
        if (selectedDateModifier !== CONST.SEARCH.DATE_MODIFIERS.RANGE) {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDateValue(CONST.SEARCH.DATE_MODIFIERS.RANGE, getRangeQueryValue(rangeEphemeralValues.from, rangeEphemeralValues.to) || undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rangeEphemeralValues.from, rangeEphemeralValues.to]);

    // Used to discard unsaved range picks when the user leaves Range mode without saving.
    const rangeEntrySnapshotRef = useRef<string | undefined>(undefined);

    const selectDateModifier = useCallback(
        (dateModifier: SearchDateModifier | null) => {
            const isSwitchingBetweenCustomDateModifiers = isCustomDateModifier(selectedDateModifier) && isCustomDateModifier(dateModifier);
            if (!isSwitchingBetweenCustomDateModifiers) {
                resetEphemeralDateValue(dateModifier);
            }

            onRangeValidationErrorChange?.(false);

            if (dateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE) {
                const currentDateValues = dateValuesRef.current;
                rangeEntrySnapshotRef.current = currentDateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE];
                setRangeEphemeralValues(getRangeEphemeralValuesFromDateValues(currentDateValues));
            }

            onSelectDateModifier(dateModifier);
        },
        [getRangeEphemeralValuesFromDateValues, onRangeValidationErrorChange, onSelectDateModifier, resetEphemeralDateValue, selectedDateModifier],
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
                updateDateValues(normalizedDefaultDateValues);
                onRangeValidationErrorChange?.(false);
            },

            validate() {
                return validate();
            },

            clearDateValues() {
                updateDateValues(getEmptyDateValues());
                setEphemeralDateValue(undefined);
                setRangeEphemeralValues({});
                onRangeValidationErrorChange?.(false);
            },

            setDateValueOfSelectedDateModifier() {
                if (!selectedDateModifier) {
                    return;
                }

                const updatedValue =
                    selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE ? getRangeQueryValue(rangeEphemeralValues.from, rangeEphemeralValues.to) || undefined : ephemeralDateValue;
                if (updatedValue === undefined) {
                    return;
                }

                updateDateValues(getExclusiveDateValues(selectedDateModifier, updatedValue));
            },

            clearDateValueOfSelectedDateModifier() {
                if (!selectedDateModifier) {
                    return;
                }

                const currentDateValues = dateValuesRef.current;
                updateDateValues({...currentDateValues, [selectedDateModifier]: undefined});

                if (selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE) {
                    setRangeEphemeralValues({});
                } else {
                    setEphemeralDateValue(undefined);
                }

                onRangeValidationErrorChange?.(false);
            },

            restoreRangeToEntrySnapshot() {
                const updatedValues = {
                    ...dateValuesRef.current,
                    [CONST.SEARCH.DATE_MODIFIERS.RANGE]: rangeEntrySnapshotRef.current,
                };

                updateDateValues(updatedValues);
                setRangeEphemeralValues(getRangeEphemeralValuesFromDateValues(updatedValues));
                onRangeValidationErrorChange?.(false);
            },
        }),
        [
            ephemeralDateValue,
            getRangeDisplayTextFromDateValues,
            getRangeEphemeralValuesFromDateValues,
            normalizedDefaultDateValues,
            onRangeValidationErrorChange,
            rangeEphemeralValues.from,
            rangeEphemeralValues.to,
            selectedDateModifier,
            updateDateValues,
            validate,
        ],
    );

    const rangeDescription = getRangeDisplayTextFromDateValues(dateValues) || undefined;
    const customDateModifier = useMemo(() => getCustomDateModifierFromDateValues(dateValues), [dateValues]);

    const customDateDescription = useMemo(() => {
        const customDateValue = dateDisplayValues[customDateModifier];
        if (!customDateValue) {
            return undefined;
        }

        return `${translate(`common.${customDateModifier.toLowerCase() as SearchDateModifierLower}`)} ${customDateValue}`;
    }, [customDateModifier, dateDisplayValues, translate]);
    const handleSingleDateSelected = useCallback((date: string) => {
        setEphemeralDateValue(date);
    }, []);
    const selectCustomDateMode = useCallback(() => selectDateModifier(customDateModifier), [customDateModifier, selectDateModifier]);

    if (!selectedDateModifier) {
        return (
            <>
                {presets?.map((preset) => (
                    <SingleSelectListItem
                        key={preset}
                        keyForList={preset}
                        showTooltip
                        item={{
                            keyForList: preset,
                            text: translate(`search.filters.date.presets.${preset}`),
                            isSelected: dateValues[CONST.SEARCH.DATE_MODIFIERS.ON] === preset,
                        }}
                        onSelectRow={() => setExclusiveDateValue(CONST.SEARCH.DATE_MODIFIERS.ON, preset)}
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
                    title={customDateTitle}
                    description={customDateDescription}
                    onPress={selectCustomDateMode}
                />
                <MenuItem
                    shouldShowRightIcon
                    viewMode={CONST.OPTION_MODE.COMPACT}
                    title={customRangeTitle}
                    description={rangeDescription}
                    onPress={() => selectDateModifier(CONST.SEARCH.DATE_MODIFIERS.RANGE)}
                />
            </>
        );
    }

    if (selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE) {
        return (
            <RangeDatePicker
                fromValue={rangeEphemeralValues.from}
                toValue={rangeEphemeralValues.to}
                onFromSelected={(date) => {
                    setRangeEphemeralValues((prev) => ({...prev, from: date}));
                    onRangeValidationErrorChange?.(false);
                }}
                onToSelected={(date) => {
                    setRangeEphemeralValues((prev) => ({...prev, to: date}));
                    onRangeValidationErrorChange?.(false);
                }}
                forceVertical={forceVerticalCalendars}
            />
        );
    }

    return (
        <>
            <CalendarPicker
                value={ephemeralDateValue}
                onSelected={handleSingleDateSelected}
                minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
            />
            <SpacerView
                shouldShow
                style={[StyleUtils.getBorderColorStyle(theme.border), styles.mh3]}
            />
            {CONST.SEARCH.CUSTOM_DATE_MODIFIERS.map((dateModifier) => (
                <SingleSelectListItem
                    key={dateModifier}
                    keyForList={dateModifier}
                    showTooltip
                    item={{
                        keyForList: dateModifier,
                        text: translate(`common.${dateModifier.toLowerCase() as SearchDateModifierLower}`),
                        isSelected: selectedDateModifier === dateModifier,
                    }}
                    onSelectRow={() => selectDateModifier(dateModifier)}
                    wrapperStyle={styles.flexReset}
                />
            ))}
        </>
    );
}

export type {SearchDateValues, DatePresetFilterBaseHandle as SearchDatePresetFilterBaseHandle};

export default DatePresetFilterBase;
