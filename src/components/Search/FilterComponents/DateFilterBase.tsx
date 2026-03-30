import React, {useImperativeHandle, useRef, useState} from 'react';
import Button from '@components/Button';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScrollView from '@components/ScrollView';
import type {SearchDatePreset} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SearchDateModifier, SearchDateModifierLower} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {SearchDatePresetFilterBaseHandle, SearchDateValues} from './DatePresetFilterBase';
import DatePresetFilterBase from './DatePresetFilterBase';

type DateFilterBaseHandle = {
    /** Gets the current date values from the filter */
    getDateValues: () => SearchDateValues;
    /** Handles back navigation — closes date modifier if open, otherwise calls onBackButtonPress */
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
    /** Callback when a date value changes (e.g. preset click or calendar save) */
    onDateValuesChange?: (values: SearchDateValues) => void;
    /** Callback when the date modifier screen is opened or closed (on/after/before) */
    onDateModifierChange?: (isOpen: boolean) => void;
    /** If true, the Reset/Save buttons are only shown when a date modifier (On/After/Before) is selected. Defaults to false (always show buttons). */
    shouldShowButtonsOnlyWithDateModifier?: boolean;
    /** Whether to render the built-in HeaderWithBackButton. Defaults to true. Set to false when the parent provides its own header. */
    shouldShowHeader?: boolean;
    /** The ref handle */
    ref?: React.Ref<DateFilterBaseHandle>;
};

// Component uses ref as a prop, which is supported in modern React
function DateFilterBase({
    title,
    defaultDateValues,
    presets,
    isSearchAdvancedFiltersFormLoading,
    onBackButtonPress,
    onSubmit,
    onDateValuesChange,
    onDateModifierChange,
    shouldShowButtonsOnlyWithDateModifier = false,
    shouldShowHeader = true,
    ref,
}: DateFilterBaseProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const searchDatePresetFilterBaseRef = useRef<SearchDatePresetFilterBaseHandle>(null);
    const [selectedDateModifier, setSelectedDateModifier] = useState<SearchDateModifier | null>(null);

    const handleSelectDateModifier = (dateModifier: SearchDateModifier | null) => {
        setSelectedDateModifier(dateModifier);
        onDateModifierChange?.(!!dateModifier);
        if (onDateValuesChange) {
            const values = searchDatePresetFilterBaseRef.current?.getDateValues() ?? {
                [CONST.SEARCH.DATE_MODIFIERS.ON]: undefined,
                [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
                [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
            };
            onDateValuesChange(values);
        }
    };

    const goBack = () => {
        if (selectedDateModifier) {
            setSelectedDateModifier(null);
            onDateModifierChange?.(false);
            return;
        }

        onBackButtonPress?.();
    };

    useImperativeHandle(ref, () => ({
        getDateValues: () =>
            searchDatePresetFilterBaseRef.current?.getDateValues() ?? {
                [CONST.SEARCH.DATE_MODIFIERS.ON]: undefined,
                [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
                [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
            },
        goBack,
    }));

    function getComputedTitle() {
        if (selectedDateModifier) {
            return translate(`common.${selectedDateModifier.toLowerCase() as SearchDateModifierLower}`);
        }

        return title;
    }

    const reset = () => {
        if (!searchDatePresetFilterBaseRef.current) {
            return;
        }

        if (selectedDateModifier) {
            searchDatePresetFilterBaseRef.current.clearDateValueOfSelectedDateModifier();
            setSelectedDateModifier(null);
            onDateModifierChange?.(false);
            return;
        }

        searchDatePresetFilterBaseRef.current.clearDateValues();
    };

    const save = () => {
        if (!searchDatePresetFilterBaseRef.current) {
            return;
        }

        if (selectedDateModifier) {
            searchDatePresetFilterBaseRef.current.setDateValueOfSelectedDateModifier();
            setSelectedDateModifier(null);
            onDateModifierChange?.(false);
            return;
        }

        const dateValues = searchDatePresetFilterBaseRef.current.getDateValues();
        onSubmit(dateValues);
    };

    const computedTitle = getComputedTitle();

    const content = (
        <>
            {shouldShowHeader && (
                <HeaderWithBackButton
                    title={computedTitle}
                    onBackButtonPress={goBack}
                />
            )}
            <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                <DatePresetFilterBase
                    ref={searchDatePresetFilterBaseRef}
                    defaultDateValues={defaultDateValues}
                    selectedDateModifier={selectedDateModifier}
                    onSelectDateModifier={handleSelectDateModifier}
                    presets={presets}
                    isSearchAdvancedFiltersFormLoading={isSearchAdvancedFiltersFormLoading}
                    onDateValueChange={onDateValuesChange}
                />
            </ScrollView>
            {(!shouldShowButtonsOnlyWithDateModifier || !!selectedDateModifier) && (
                <>
                    <Button
                        text={translate('common.reset')}
                        onPress={reset}
                        style={[styles.mh4, styles.mt4]}
                        large
                    />
                    <FormAlertWithSubmitButton
                        buttonText={translate('common.save')}
                        containerStyles={[styles.m4, styles.mt3, styles.mb5]}
                        onSubmit={save}
                        enabledWhenOffline
                    />
                </>
            )}
        </>
    );

    return content;
}

export type {DateFilterBaseHandle};
export default DateFilterBase;
