import React, {Fragment} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';
import OptionItem from './OptionItem';

type OptionsPickerItem<TKey extends string> = {
    /** A unique identifier for each option */
    key: TKey;

    /** Text to be displayed */
    title: TranslationPaths;

    /** Icon to be displayed above the title */
    icon: IconAsset;
};

type OptionsPickerProps<TKey extends string> = {
    /** Options list */
    options: Array<OptionsPickerItem<TKey>>;

    /** Selected option's identifier */
    selectedOption: TKey;

    /** Option select handler */
    onOptionSelected: (option: TKey) => void;

    /** Indicates whether the picker is disabled */
    isDisabled?: boolean;

    /** Optional style */
    style?: StyleProp<ViewStyle>;
};

function OptionsPicker<TKey extends string>({options, selectedOption, onOptionSelected, style, isDisabled}: OptionsPickerProps<TKey>) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    if (shouldUseNarrowLayout) {
        return (
            <View style={[styles.flexColumn, styles.flex1, style]}>
                {options.map((option, index) => (
                    <Fragment key={option.key}>
                        <OptionItem
                            title={option.title}
                            icon={option.icon}
                            isSelected={selectedOption === option.key}
                            isDisabled={isDisabled}
                            onPress={() => onOptionSelected(option.key)}
                        />
                        {index < options.length - 1 && <View style={styles.mb3} />}
                    </Fragment>
                ))}
            </View>
        );
    }

    return (
        <View style={[styles.flexRow, styles.flex1, style]}>
            {options.map((option, index) => (
                <Fragment key={option.key}>
                    <OptionItem
                        title={option.title}
                        icon={option.icon}
                        isSelected={selectedOption === option.key}
                        isDisabled={isDisabled}
                        onPress={() => onOptionSelected(option.key)}
                    />
                    {index < options.length - 1 && <View style={styles.mr3} />}
                </Fragment>
            ))}
        </View>
    );
}

export default OptionsPicker;
export type {OptionsPickerItem};
