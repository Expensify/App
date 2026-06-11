import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import DateFilterBase from '@components/Search/FilterComponents/DateFilterBase';
import type {DateFilterBaseHandle} from '@components/Search/FilterComponents/DateFilterBase';
import useFullscreenAdvancedFilters from '@components/Search/FilterDropdowns/AdvancedFilters/useFullscreenAdvancedFilters';
import type {SearchDateFilterKeys} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDateModifierTitle} from '@libs/SearchQueryUtils';
import type {SearchDateValues} from '@libs/SearchQueryUtils';
import {getDatePresets} from '@libs/SearchUIUtils';
import type {SearchDateModifier} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

type DateFilterComponentProps = {
    filterKey: SearchDateFilterKeys;
    value: SearchDateValues;
    hasFeed: boolean;
    onChange: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

function DateFilterComponent({filterKey, value: initialValue, hasFeed, onChange}: DateFilterComponentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const fullscreen = useFullscreenAdvancedFilters();
    const dateFilterRef = useRef<DateFilterBaseHandle>(null);

    const [selectedDateModifier, setSelectedDateModifier] = useState<SearchDateModifier | null>(null);
    const [value, setValue] = useState(initialValue);

    const getDateFormValues = (dateValues: SearchDateValues) => {
        const dateFormValues: Record<string, string | undefined> = {};
        dateFormValues[`${filterKey}On`] = dateValues[CONST.SEARCH.DATE_MODIFIERS.ON];
        dateFormValues[`${filterKey}After`] = dateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER];
        dateFormValues[`${filterKey}Before`] = dateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE];
        dateFormValues[`${filterKey}Range`] = dateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE];
        return dateFormValues as Partial<SearchAdvancedFiltersForm>;
    };

    const onDateChange = (selectedDates: SearchDateValues) => {
        if (fullscreen) {
            setValue(selectedDates);
            return;
        }

        onChange(getDateFormValues(selectedDates));
    };

    return (
        <View style={[styles.flex1, !fullscreen && styles.pt2]}>
            {!!selectedDateModifier && (
                <HeaderWithBackButton
                    style={[styles.h10]}
                    subtitle={selectedDateModifier ? getDateModifierTitle(selectedDateModifier, '', translate) : ''}
                    onBackButtonPress={() => dateFilterRef.current?.goBack()}
                />
            )}
            <DateFilterBase
                ref={dateFilterRef}
                style={fullscreen ? styles.flex1 : styles.flexShrink1}
                shouldShowHeader={false}
                onDateValuesChange={(values) => {
                    if (selectedDateModifier) {
                        return;
                    }
                    onDateChange(values);
                }}
                selectedDateModifier={selectedDateModifier}
                onSelectDateModifier={setSelectedDateModifier}
                defaultDateValues={value}
                presets={getDatePresets(filterKey, hasFeed)}
                onSubmit={onDateChange}
                shouldShowActionButtons={false}
            />
            {(!!selectedDateModifier || fullscreen) && (
                <Button
                    style={[styles.ph5, styles.pb5, styles.pt3]}
                    success
                    medium={!fullscreen}
                    large={fullscreen}
                    text={translate(selectedDateModifier ? 'common.apply' : 'common.confirm')}
                    pressOnEnter
                    onPress={() => {
                        if (selectedDateModifier) {
                            dateFilterRef.current?.save();
                            return;
                        }
                        onChange(getDateFormValues(value));
                    }}
                />
            )}
        </View>
    );
}

export default DateFilterComponent;
