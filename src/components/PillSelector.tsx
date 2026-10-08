import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import {PressableWithFeedback} from './Pressable';
import Text from './Text';

type PillSelectorOption<TKey extends string> = {
    /** Unique key of the option, passed back on selection */
    key: TKey;

    /** Text shown inside the pill */
    text: string;
};

type PillSelectorProps<TKey extends string> = {
    /** Options rendered as pills, in display order */
    options: Array<PillSelectorOption<TKey>>;

    /** Key of the selected option */
    selectedKey: TKey | undefined;

    /** Called with the key of the pressed pill */
    onSelect: (key: TKey) => void;

    /** Styles for the wrapping row */
    style?: StyleProp<ViewStyle>;
};

function PillSelector<TKey extends string>({options, selectedKey, onSelect, style}: PillSelectorProps<TKey>) {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View
            style={[styles.flexRow, styles.flexWrap, styles.gap2, style]}
            role={CONST.ROLE.RADIOGROUP}
        >
            {options.map((option) => {
                const isSelected = option.key === selectedKey;
                return (
                    <PressableWithFeedback
                        key={option.key}
                        onPress={() => onSelect(option.key)}
                        accessibilityLabel={option.text}
                        role={CONST.ROLE.RADIO}
                        accessibilityState={{checked: isSelected}}
                        sentryLabel={CONST.SENTRY_LABEL.PILL_SELECTOR.PILL}
                        wrapperStyle={styles.flexShrink0}
                    >
                        {({hovered}) => (
                            <View style={[styles.tabSelectorButton, styles.tabBackground(hovered, isSelected, false, isSelected ? theme.border : theme.appBG)]}>
                                <Text style={styles.tabText(isSelected)}>{option.text}</Text>
                            </View>
                        )}
                    </PressableWithFeedback>
                );
            })}
        </View>
    );
}

export default PillSelector;
export type {PillSelectorOption};
