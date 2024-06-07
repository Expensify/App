import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import SelectCircle from './SelectCircle';
import Text from './Text';

type Item = {
    key: string;
    label: TranslationPaths;
};

type SingleOptionSelectorProps = {
    /** Array of options for the selector, key is a unique identifier, label is a localize key that will be translated and displayed */
    options?: Item[];

    /** Key of the option that is currently selected */
    selectedOptionKey?: string;

    /** Function to be called when an option is selected */
    onSelectOption?: (item: Item) => void;

    /** Styles for the option row element */
    optionRowStyles?: StyleProp<ViewStyle>;

    /** Styles for the select circle */
    selectCircleStyles?: StyleProp<ViewStyle>;
};

function SingleOptionSelector({options = [], selectedOptionKey, onSelectOption = () => {}, optionRowStyles, selectCircleStyles}: SingleOptionSelectorProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    return (
        <View style={styles.pt4}>
            {options.map((option) => (
                <View
                    style={styles.flexRow}
                    key={option.key}
                >
                    <PressableWithoutFeedback
                        style={[styles.singleOptionSelectorRow, optionRowStyles]}
                        onPress={() => onSelectOption(option)}
                        role={CONST.ROLE.BUTTON}
                        accessibilityState={{checked: selectedOptionKey === option.key}}
                        aria-checked={selectedOptionKey === option.key}
                        accessibilityLabel={option.label}
                    >
                        <SelectCircle
                            isChecked={selectedOptionKey ? selectedOptionKey === option.key : false}
                            selectCircleStyles={[styles.ml0, styles.singleOptionSelectorCircle, selectCircleStyles]}
                        />
                        <Text>{translate(option.label)}</Text>
                    </PressableWithoutFeedback>
                </View>
            ))}
        </View>
    );
}

SingleOptionSelector.displayName = 'SingleOptionSelector';

export default SingleOptionSelector;
