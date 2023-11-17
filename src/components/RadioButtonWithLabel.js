import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import useThemeStyles from '@styles/useThemeStyles';
import FormHelpMessage from './FormHelpMessage';
import * as Pressables from './Pressable';
import RadioButton from './RadioButton';
import Text from './Text';

const propTypes = {
    /** Whether the radioButton is checked */
    isChecked: PropTypes.bool.isRequired,

    /** Called when the radioButton or label is pressed */
    onPress: PropTypes.func.isRequired,

    /** Container styles */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** Text that appears next to check box */
    label: PropTypes.string,

    /** Component to display for label */
    LabelComponent: PropTypes.func,

    /** Should the input be styled for errors  */
    hasError: PropTypes.bool,

    /** Error text to display */
    errorText: PropTypes.string,
};

const defaultProps = {
    style: [],
    label: undefined,
    LabelComponent: undefined,
    hasError: false,
    errorText: '',
};

const PressableWithFeedback = Pressables.PressableWithFeedback;

function RadioButtonWithLabel(props) {
    const styles = useThemeStyles();
    const LabelComponent = props.LabelComponent;
    const defaultStyles = [styles.flexRow, styles.alignItemsCenter];
    const wrapperStyles = _.isArray(props.style) ? [...defaultStyles, ...props.style] : [...defaultStyles, props.style];

    if (!props.label && !LabelComponent) {
        throw new Error('Must provide at least label or LabelComponent prop');
    }
    return (
        <>
            <View style={wrapperStyles}>
                <RadioButton
                    isChecked={props.isChecked}
                    onPress={props.onPress}
                    accessibilityLabel={props.label}
                    hasError={props.hasError}
                />
                <PressableWithFeedback
                    tabIndex={-1}
                    accessible={false}
                    onPress={() => props.onPress()}
                    style={[styles.flexRow, styles.flexWrap, styles.flexShrink1, styles.alignItemsCenter]}
                    wrapperStyle={[styles.ml3, styles.pr2, styles.w100]}
                    // disable hover style when disabled
                    hoverDimmingValue={0.8}
                    pressDimmingValue={0.5}
                >
                    {Boolean(props.label) && <Text style={[styles.ml1]}>{props.label}</Text>}
                    {Boolean(LabelComponent) && <LabelComponent />}
                </PressableWithFeedback>
            </View>
            <FormHelpMessage message={props.errorText} />
        </>
    );
}

RadioButtonWithLabel.propTypes = propTypes;
RadioButtonWithLabel.defaultProps = defaultProps;
RadioButtonWithLabel.displayName = 'RadioButtonWithLabel';

export default RadioButtonWithLabel;
