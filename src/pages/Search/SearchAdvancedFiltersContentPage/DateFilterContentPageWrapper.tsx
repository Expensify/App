import Button from '@components/Button';
import DateFilterContent from '@components/Search/FilterComponents/AdvancedFilters/DateFilterContent';
import type {DateFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {SearchDateModifier} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

import React, {useState} from 'react';
import {View} from 'react-native';

function DateFilterContentPageWrapper({baseFilterKey, value: initialValue, hasFeed, onChange}: DateFilterContentWrapperProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [value, setValue] = useState(initialValue);
    const [selectedDateModifier, setSelectedDateModifier] = useState<SearchDateModifier | null>(null);

    return (
        <View style={[styles.flex1]}>
            <DateFilterContent
                baseFilterKey={baseFilterKey}
                value={value}
                selectedDateModifier={selectedDateModifier}
                hasFeed={hasFeed}
                size={CONST.BUTTON_SIZE.LARGE}
                style={[styles.flex1]}
                onDateModifierSelected={setSelectedDateModifier}
                onChange={setValue}
            />
            {!selectedDateModifier && (
                <Button
                    style={[styles.ph5, styles.pb5, styles.pt3]}
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    onPress={() => onChange(value)}
                >
                    <Button.KeyboardShortcut />
                    <Button.Text>{translate('common.confirm')}</Button.Text>
                </Button>
            )}
        </View>
    );
}

export default DateFilterContentPageWrapper;
