import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {FilterButtonsProps} from './types';

/**
 * Renders a row of filter toggle buttons for filtering table data.
 * Commonly used for status filters like All/Assigned/Unassigned.
 */
function FilterButtons({options, activeValue, onPress, style}: FilterButtonsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.flexRow, styles.gap2, style]}>
            {options.map((option) => (
                <Button
                    key={option.value}
                    text={translate(option.labelKey)}
                    onPress={() => onPress(option.value)}
                    small
                    success={activeValue === option.value}
                />
            ))}
        </View>
    );
}

FilterButtons.displayName = 'FilterButtons';

export default FilterButtons;
