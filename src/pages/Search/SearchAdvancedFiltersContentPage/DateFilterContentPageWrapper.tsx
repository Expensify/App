import React, {useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import DateFilterContent from '@components/Search/FilterComponents/AdvancedFilters/DateFilterContent';
import type {DateFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SearchDateModifier} from '@libs/SearchUIUtils';

function DateFilterContentPageWrapper({filterKey, value: initialValue, hasFeed, onChange}: DateFilterContentWrapperProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [value, setValue] = useState(initialValue);
    const [selectedDateModifier, setSelectedDateModifier] = useState<SearchDateModifier | null>(null);

    return (
        <View style={[styles.flex1]}>
            <DateFilterContent
                filterKey={filterKey}
                value={value}
                selectedDateModifier={selectedDateModifier}
                hasFeed={hasFeed}
                largeButton
                style={[styles.flex1]}
                onDateModifierSelected={setSelectedDateModifier}
                onChange={setValue}
            />
            {!selectedDateModifier && (
                <Button
                    style={[styles.ph5, styles.pb5, styles.pt3]}
                    success
                    large
                    text={translate('common.confirm')}
                    pressOnEnter
                    onPress={() => onChange(value)}
                />
            )}
        </View>
    );
}

export default DateFilterContentPageWrapper;
