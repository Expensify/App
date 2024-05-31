import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type IconAsset from '@src/types/utils/IconAsset';
import OptionItem from './OptionItem';

type OptionsPickerItem = {
    /** A unique identifier for each option */
    key: string;

    /** Text to be displayed */
    title: string;

    /** Icon to be displayed above the title */
    icon: IconAsset;
};

type OptionsPickerProps = {
    /** Options list */
    options: OptionsPickerItem[];

    /** Selected option's identifier */
    selectedOption: string;

    /** Option select handler */
    onOptionSelected: (option: string) => void;

    /** Indicates whether the picker is disabled */
    isDisabled?: boolean;

    /** Optional style */
    style?: StyleProp<ViewStyle>;
};

function OptionsPicker({options, selectedOption, onOptionSelected, style, isDisabled = false}: OptionsPickerProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.flex1, style]}>
            {options.map((option, index) => (
                <React.Fragment key={option.key}>
                    <OptionItem
                        title={option.title}
                        icon={option.icon}
                        isSelected={selectedOption === option.key}
                        isDisabled={isDisabled}
                        onPress={() => onOptionSelected(option.key)}
                    />
                    {index < options.length - 1 && <View style={styles.mr3} />}
                </React.Fragment>
            ))}
        </View>
    );
}

export default OptionsPicker;
export type {OptionsPickerItem};
