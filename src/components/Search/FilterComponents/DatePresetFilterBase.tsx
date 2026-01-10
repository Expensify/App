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
import type {SearchDateModifier} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';

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
function DatePresetFilterBase({defaultDateValues, selectedDateModifier, onSelectDateModifier, presets, isSearchAdvancedFiltersFormLoading, ref}: DatePresetFilterBaseProps) {
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

    const setDateValue = useCallback((dateModifier: SearchDateModifier, value: string | undefined) => {
        setDateValues((prevDateValues) => {
            if (dateModifier === CONST.SEARCH.DATE_MODIFIERS.ON && isSearchDatePreset(value)) {
                return {
                    [CONST.SEARCH.DATE_MODIFIERS.ON]: value,
                    [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
                    [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
                };
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
    }, []);

    const dateDisplayValues = useMemo<SearchDateValues>(() => {
        const dateOn = dateValues[CONST.SEARCH.DATE_MODIFIERS.ON];
        const dateAfter = dateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER];
        const dateBefore = dateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE];

        return {
            // dateOn could be a preset e.g. Last month which should not be displayed as the On field
            [CONST.SEARCH.DATE_MODIFIERS.ON]: isSearchDatePreset(dateOn) ? undefined : dateOn,
            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: dateAfter,
            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: dateBefore,
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
                setDateValues({[CONST.SEARCH.DATE_MODIFIERS.ON]: undefined, [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined, [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined});
            },

            setDateValueOfSelectedDateModifier() {
                if (!selectedDateModifier) {
                    return;
                }

                setDateValue(selectedDateModifier, ephemeralDateValue);
            },

            clearDateValueOfSelectedDateModifier() {
                if (!selectedDateModifier) {
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
        </>
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
