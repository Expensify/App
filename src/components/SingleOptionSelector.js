import React from 'react';
import {Text} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import SelectCircle from './SelectCircle';
import styles from '../styles/styles';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import CONST from '../CONST';

const propTypes = {
    options: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string,
            label: PropTypes.string,
        }),
    ),
    selectedOptionKey: PropTypes.string,
    onSelectOption: PropTypes.func,
};

const defaultProps = {
    options: [],
    selectedOptionKey: '',
    onSelectOption: () => {},
};

function SingleOptionSelector({options, selectedOptionKey, onSelectOption}) {
    return (
        <>
            {_.map(options, (option) => (
                <PressableWithFeedback
                    key={option.key}
                    style={styles.singleOptionSelectorRow}
                    onPress={() => onSelectOption(option)}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                    accessibilityState={{checked: selectedOptionKey === option.key}}
                    aria-checked={selectedOptionKey === option.key}
                    accessibilityLabel={option.label}
                >
                    <SelectCircle isChecked={selectedOptionKey === option.key} />
                    <Text>{option.label}</Text>
                </PressableWithFeedback>
            ))}
        </>
    );
}

SingleOptionSelector.propTypes = propTypes;
SingleOptionSelector.defaultProps = defaultProps;
SingleOptionSelector.displayName = 'SingleOptionSelector';

export default SingleOptionSelector;
