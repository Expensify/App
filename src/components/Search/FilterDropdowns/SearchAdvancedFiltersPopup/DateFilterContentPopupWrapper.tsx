import DateFilterContent from '@components/Search/FilterComponents/AdvancedFilters/DateFilterContent';
import type {DateFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';

import useThemeStyles from '@hooks/useThemeStyles';

import type {SearchDateModifier} from '@libs/SearchUIUtils';

import React, {useState} from 'react';
import {View} from 'react-native';

function DateFilterContentPopupWrapper({baseFilterKey, value, hasFeed, onChange}: DateFilterContentWrapperProps) {
    const styles = useThemeStyles();
    const [selectedDateModifier, setSelectedDateModifier] = useState<SearchDateModifier | null>(null);

    return (
        <View style={[styles.flex1, selectedDateModifier ? styles.pt2 : styles.pv2]}>
            <DateFilterContent
                baseFilterKey={baseFilterKey}
                value={value}
                hasFeed={hasFeed}
                selectedDateModifier={selectedDateModifier}
                style={[styles.flexShrink1]}
                onDateModifierSelected={setSelectedDateModifier}
                onChange={onChange}
            />
        </View>
    );
}

export default DateFilterContentPopupWrapper;
