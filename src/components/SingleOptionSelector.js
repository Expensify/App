import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {View} from 'react-native';
import SelectCircle from './SelectCircle';
import styles from '../styles/styles';
import CONST from '../CONST';
import Text from './Text';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** Array of options for the selector, key is a unique identifier, label is a localize key that will be translated and displayed */
    options: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string,
            label: PropTypes.string,
        }),
    ),

    /** Key of the option that is currently selected */
    selectedOptionKey: PropTypes.string,

    /** Function to be called when an option is selected */
    onSelectOption: PropTypes.func,
    ...withLocalizePropTypes,
};

const defaultProps = {
    options: [],
    selectedOptionKey: undefined,
    onSelectOption: () => {},
};

function SingleOptionSelector({options, selectedOptionKey, onSelectOption, translate}) {
    return (
        <View style={styles.pt4}>
            {_.map(options, (option) => (
                <View
                    style={styles.flexRow}
                    key={option.key}
                >
                    <PressableWithoutFeedback
                        style={styles.singleOptionSelectorRow}
                        onPress={() => onSelectOption(option)}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        accessibilityState={{checked: selectedOptionKey === option.key}}
                        aria-checked={selectedOptionKey === option.key}
                        accessibilityLabel={option.label}
                    >
                        <SelectCircle
                            isChecked={selectedOptionKey ? selectedOptionKey === option.key : false}
                            styles={[styles.ml0, styles.singleOptionSelectorCircle]}
                        />
                        <Text>{translate(option.label)}</Text>
                    </PressableWithoutFeedback>
                </View>
            ))}
        </View>
    );
}

SingleOptionSelector.propTypes = propTypes;
SingleOptionSelector.defaultProps = defaultProps;
SingleOptionSelector.displayName = 'SingleOptionSelector';

export default withLocalize(SingleOptionSelector);
