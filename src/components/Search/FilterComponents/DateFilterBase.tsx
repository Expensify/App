import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScrollView from '@components/ScrollView';
import type {SearchDatePreset} from '@components/Search/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDateModifierTitle, getDateRangeDisplayValueFromFormValue, getEmptyDateValues} from '@libs/SearchQueryUtils';
import type {SearchDateModifier} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {SearchDatePresetFilterBaseHandle, SearchDateValues} from './DatePresetFilterBase';
import DatePresetFilterBase from './DatePresetFilterBase';

type DateFilterBaseHandle = {
    /** Gets the current date values from the filter */
    getDateValues: () => SearchDateValues;
    /** Handles back navigation by closing the active date modifier before leaving the screen */
    goBack: () => void;
};

type DateFilterBaseProps = {
    /** The title displayed in the header. Required when shouldShowHeader is true. */
    title?: string;
    /** Default date values to initialize the filter with */
    defaultDateValues: SearchDateValues;
    /** The date presets to display (e.g. "This month", "Last month") */
    presets: SearchDatePreset[];
    /** Whether the search advanced filters form Onyx data is loading or not */
    isSearchAdvancedFiltersFormLoading?: boolean;
    /** Callback when the back button is pressed. Required when shouldShowHeader is true. */
    onBackButtonPress?: () => void;
    /** Callback when the filter is submitted with the selected date values */
    onSubmit: (values: SearchDateValues) => void;
    /** Callback when the filter is reset, used to persist cleared values without triggering navigation */
    onReset?: (values: SearchDateValues) => void;
    /** Callback when a date value changes (e.g. preset click or calendar save) */
    onDateValuesChange?: (values: SearchDateValues) => void;
    /** Controlled selected date modifier */
    selectedDateModifier?: SearchDateModifier | null;
    /** Callback for controlled selected date modifier */
    onSelectDateModifier?: (dateModifier: SearchDateModifier | null) => void;
    /** Callback when the date modifier screen is opened or closed (on/after/before) */
    onDateModifierChange?: (isOpen: boolean) => void;
    /** If true, the Reset/Save buttons are only shown when a date modifier is selected. */
    shouldShowButtonsOnlyWithDateModifier?: boolean;
    /** Whether to render the built-in HeaderWithBackButton. Defaults to true. */
    shouldShowHeader?: boolean;
    /** The ref handle */
    ref?: React.Ref<DateFilterBaseHandle>;
};

// Component uses ref as a prop, which is supported in modern React.
function DateFilterBase({
    title,
    defaultDateValues,
    presets,
    isSearchAdvancedFiltersFormLoading,
    onBackButtonPress,
    onSubmit,
    onReset,
    onDateValuesChange,
    onDateModifierChange,
    shouldShowButtonsOnlyWithDateModifier = false,
    shouldShowHeader = true,
    ref,
    selectedDateModifier: selectedDateModifierProp,
    onSelectDateModifier,
}: DateFilterBaseProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const normalizedDefaultDateValues = useMemo(() => ({...getEmptyDateValues(), ...defaultDateValues}), [defaultDateValues]);
    const searchDatePresetFilterBaseRef = useRef<SearchDatePresetFilterBaseHandle>(null);
    const [selectedDateModifierState, setSelectedDateModifierState] = useState<SearchDateModifier | null>(null);
    const [shouldShowRangeError, setShouldShowRangeError] = useState(false);
    const [rangeDisplayText, setRangeDisplayText] = useState(() =>
        getDateRangeDisplayValueFromFormValue(
            normalizedDefaultDateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE],
            normalizedDefaultDateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER],
            normalizedDefaultDateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE],
        ),
    );

    useEffect(() => {
        setRangeDisplayText(
            getDateRangeDisplayValueFromFormValue(
                normalizedDefaultDateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE],
                normalizedDefaultDateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER],
                normalizedDefaultDateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE],
            ),
        );
    }, [normalizedDefaultDateValues]);

    const handleDateValuesChange = useCallback(
        (values: SearchDateValues) => {
            setRangeDisplayText(
                getDateRangeDisplayValueFromFormValue(values[CONST.SEARCH.DATE_MODIFIERS.RANGE], values[CONST.SEARCH.DATE_MODIFIERS.AFTER], values[CONST.SEARCH.DATE_MODIFIERS.BEFORE]),
            );
            onDateValuesChange?.(values);
        },
        [onDateValuesChange],
    );

    const isDateModifierControlled = selectedDateModifierProp !== undefined;
    const selectedDateModifier = isDateModifierControlled ? selectedDateModifierProp : selectedDateModifierState;

    const setSelectedDateModifier = useCallback(
        (dateModifier: SearchDateModifier | null) => {
            if (isDateModifierControlled) {
                onSelectDateModifier?.(dateModifier);
                return;
            }
            setSelectedDateModifierState(dateModifier);
        },
        [isDateModifierControlled, onSelectDateModifier],
    );

    const handleSelectDateModifier = useCallback(
        (dateModifier: SearchDateModifier | null) => {
            setSelectedDateModifier(dateModifier);
            onDateModifierChange?.(!!dateModifier);
            onDateValuesChange?.(searchDatePresetFilterBaseRef.current?.getDateValues() ?? getEmptyDateValues());
        },
        [onDateModifierChange, onDateValuesChange, setSelectedDateModifier],
    );

    const goBack = useCallback(() => {
        if (selectedDateModifier) {
            if (selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE) {
                searchDatePresetFilterBaseRef.current?.restoreRangeToEntrySnapshot();
            }
            setSelectedDateModifier(null);
            setShouldShowRangeError(false);
            onDateModifierChange?.(false);
            return;
        }

        onBackButtonPress?.();
    }, [onBackButtonPress, onDateModifierChange, selectedDateModifier, setSelectedDateModifier]);

    useImperativeHandle(
        ref,
        () => ({
            getDateValues: () => searchDatePresetFilterBaseRef.current?.getDateValues() ?? getEmptyDateValues(),
            goBack,
        }),
        [goBack],
    );

    const computedTitle = getDateModifierTitle(selectedDateModifier, title ?? '', translate);

    const reset = useCallback(() => {
        if (!searchDatePresetFilterBaseRef.current) {
            return;
        }

        if (selectedDateModifier) {
            searchDatePresetFilterBaseRef.current.clearDateValueOfSelectedDateModifier();
            const dateValues = searchDatePresetFilterBaseRef.current.getDateValues();
            setSelectedDateModifier(null);
            setShouldShowRangeError(false);
            onDateModifierChange?.(false);
            onReset?.(dateValues);
            return;
        }

        searchDatePresetFilterBaseRef.current.clearDateValues();
        const dateValues = searchDatePresetFilterBaseRef.current.getDateValues();
        setShouldShowRangeError(false);
        onReset?.(dateValues);
    }, [onDateModifierChange, onReset, selectedDateModifier, setSelectedDateModifier]);

    const save = useCallback(() => {
        if (!searchDatePresetFilterBaseRef.current) {
            return;
        }

        if (selectedDateModifier) {
            if (!searchDatePresetFilterBaseRef.current.validate()) {
                return;
            }

            searchDatePresetFilterBaseRef.current.setDateValueOfSelectedDateModifier();
            const dateValues = searchDatePresetFilterBaseRef.current.getDateValues();
            setSelectedDateModifier(null);
            setShouldShowRangeError(false);
            onDateModifierChange?.(false);
            onSubmit(dateValues);
            return;
        }

        onSubmit(searchDatePresetFilterBaseRef.current.getDateValues());
    }, [onDateModifierChange, onSubmit, selectedDateModifier, setSelectedDateModifier]);

    const shouldShowActionButtons = !shouldShowButtonsOnlyWithDateModifier || !!selectedDateModifier;
    const shouldShowRangeSummary = selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE && !!rangeDisplayText;

    return (
        <View style={styles.flex1}>
            {shouldShowHeader && (
                <HeaderWithBackButton
                    title={computedTitle}
                    onBackButtonPress={goBack}
                />
            )}
            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={[styles.flexGrow1]}
            >
                <DatePresetFilterBase
                    ref={searchDatePresetFilterBaseRef}
                    defaultDateValues={normalizedDefaultDateValues}
                    selectedDateModifier={selectedDateModifier}
                    onSelectDateModifier={handleSelectDateModifier}
                    presets={presets}
                    isSearchAdvancedFiltersFormLoading={isSearchAdvancedFiltersFormLoading}
                    onDateValuesChange={handleDateValuesChange}
                    onRangeValidationErrorChange={setShouldShowRangeError}
                    forceVerticalCalendars
                />
            </ScrollView>
            {shouldShowRangeError && (
                <FormHelpMessage
                    isError
                    message={translate('search.errors.pleaseSelectDatesForBothFromAndTo')}
                    style={[styles.mh5, styles.mt2]}
                />
            )}
            {shouldShowRangeSummary && (
                <Text style={[styles.textLabelSupporting, styles.mh5, styles.mt2]}>
                    {`${translate('common.range')}: `}
                    <Text style={[styles.textLabel]}>{rangeDisplayText}</Text>
                </Text>
            )}
            {shouldShowActionButtons && (
                <>
                    {!selectedDateModifier && (
                        <Button
                            text={translate('common.reset')}
                            onPress={reset}
                            style={[styles.mh4, styles.mt4]}
                            large
                        />
                    )}
                    <FormAlertWithSubmitButton
                        buttonText={translate('common.save')}
                        containerStyles={[styles.m4, styles.mt3, styles.mb5]}
                        onSubmit={save}
                        enabledWhenOffline
                    />
                </>
            )}
        </View>
    );
}

export type {DateFilterBaseHandle};
export default DateFilterBase;
