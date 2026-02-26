import React, {useImperativeHandle, useRef, useState} from 'react';
import {View} from 'react-native';
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
};

type DateFilterBaseProps = {
    /** The title displayed in the header */
    title: string;
    /** Default date values to initialize the filter with */
    defaultDateValues: SearchDateValues;
    /** The date presets to display (e.g. "This month", "Last month") */
    presets: SearchDatePreset[];
    /** Whether the search advanced filters form Onyx data is loading or not */
    isSearchAdvancedFiltersFormLoading?: boolean;
    /** Callback when the back button is pressed */
    onBackButtonPress: () => void;
    /** Callback when the filter is submitted with the selected date values */
    onSubmit: (values: SearchDateValues) => void;
    /** Callback when any date value changes (preset click, calendar save, modifier selection) */
    onDateValuesChange?: () => void;
    /** Callback when the date modifier screen is opened or closed (on/after/before) */
    onDateModifierChange?: (isOpen: boolean) => void;
    /** The ref handle */
    ref?: React.Ref<DateFilterBaseHandle>;
};

// Component uses ref as a prop, which is supported in modern React
function DateFilterBase({title, defaultDateValues, presets, isSearchAdvancedFiltersFormLoading, onBackButtonPress, onSubmit, onDateValuesChange, onDateModifierChange, ref}: DateFilterBaseProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const searchDatePresetFilterBaseRef = useRef<SearchDatePresetFilterBaseHandle>(null);
    const [selectedDateModifier, setSelectedDateModifier] = useState<SearchDateModifier | null>(null);

    const handleSelectDateModifier = (dateModifier: SearchDateModifier | null) => {
        setSelectedDateModifier(dateModifier);
        onDateModifierChange?.(!!dateModifier);
        onDateValuesChange?.();
    };

    useImperativeHandle(ref, () => ({
        getDateValues: () =>
            searchDatePresetFilterBaseRef.current?.getDateValues() ?? {
                [CONST.SEARCH.DATE_MODIFIERS.ON]: undefined,
                [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
                [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
            },
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

    const goBack = () => {
        if (selectedDateModifier) {
            setSelectedDateModifier(null);
            onDateModifierChange?.(false);
            return;
        }

        onBackButtonPress();
    };

    const computedTitle = getComputedTitle();

    const content = (
        <>
            <HeaderWithBackButton
                title={computedTitle}
                onBackButtonPress={goBack}
            />
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
            {!!selectedDateModifier && (
                <View style={[styles.ph5, styles.pb5]}>
                    <Button
                        text={translate('common.reset')}
                        onPress={reset}
                        large
                        style={styles.mb3}
                    />
                    <FormAlertWithSubmitButton
                        buttonText={translate('common.save')}
                        containerStyles={[styles.mt0]}
                        onSubmit={save}
                        enabledWhenOffline
                    />
                </View>
            )}
        </>
    );

    return content;
}

export type {DateFilterBaseHandle};
export default DateFilterBase;
