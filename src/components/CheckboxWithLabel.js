import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import _ from 'underscore';
import styles from '../styles/styles';
import Checkbox from './Checkbox';
import Text from './Text';
import FormHelpMessage from './FormHelpMessage';
import variables from '../styles/variables';
import PressableWithFeedback from './Pressable/PressableWithFeedback';

/**
 * Returns an error if the required props are not provided
 * @param {Object} props
 * @returns {Error|null}
 */
const requiredPropsCheck = (props) => {
    if (!props.label && !props.LabelComponent) {
        return new Error('One of "label" or "LabelComponent" must be provided');
    }

    if (props.label && typeof props.label !== 'string') {
        return new Error('Prop "label" must be a string');
    }

    if (props.LabelComponent && typeof props.LabelComponent !== 'function') {
        return new Error('Prop "LabelComponent" must be a function');
    }
};

const propTypes = {
    /** Whether the checkbox is checked */
    isChecked: PropTypes.bool,

    /** Called when the checkbox or label is pressed */
    onInputChange: PropTypes.func.isRequired,

    /** Container styles */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** Text that appears next to check box */
    label: requiredPropsCheck,

    /** Component to display for label */
    LabelComponent: requiredPropsCheck,

    /** Error text to display */
    errorText: PropTypes.string,

    /** Value for checkbox. This prop is intended to be set by Form.js only */
    value: PropTypes.bool,

    /** The default value for the checkbox */
    defaultValue: PropTypes.bool,

    /** React ref being forwarded to the Checkbox input */
    forwardedRef: PropTypes.func,

    /** The ID used to uniquely identify the input in a Form */
    /* eslint-disable-next-line react/no-unused-prop-types */
    inputID: PropTypes.string,

    /** Saves a draft of the input value when used in a form */
    /* eslint-disable-next-line react/no-unused-prop-types */
    shouldSaveDraft: PropTypes.bool,

    /** An accessibility label for the checkbox */
    accessibilityLabel: PropTypes.string,
};

const defaultProps = {
    inputID: undefined,
    style: [],
    label: undefined,
    LabelComponent: undefined,
    errorText: '',
    shouldSaveDraft: false,
    isChecked: false,
    value: false,
    defaultValue: false,
    forwardedRef: () => {},
    accessibilityLabel: undefined,
};

function CheckboxWithLabel(props) {
    // We need to pick the first value that is strictly a boolean
    // https://github.com/Expensify/App/issues/16885#issuecomment-1520846065
    const [isChecked, setIsChecked] = useState(() => _.find([props.value, props.defaultValue, props.isChecked], (value) => _.isBoolean(value)));

    const toggleCheckbox = () => {
        const newState = !isChecked;
        props.onInputChange(newState);
        setIsChecked(newState);
    };

    const LabelComponent = props.LabelComponent;

    return (
        <View style={props.style}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.breakWord]}>
                <Checkbox
                    isChecked={isChecked}
                    onPress={toggleCheckbox}
                    label={props.label}
                    style={[styles.checkboxWithLabelCheckboxStyle]}
                    hasError={Boolean(props.errorText)}
                    forwardedRef={props.forwardedRef}
                    accessibilityLabel={props.accessibilityLabel || props.label}
                />
                <PressableWithFeedback
                    focusable={false}
                    accessible={false}
                    onPress={toggleCheckbox}
                    pressDimmingValue={variables.checkboxLabelActiveOpacity}
                    // We want to disable hover dimming
                    hoverDimmingValue={variables.checkboxLabelHoverOpacity}
                    style={[styles.flexRow, styles.alignItemsCenter, styles.noSelect, styles.w100]}
                    wrapperStyle={[styles.ml3, styles.pr2, styles.w100, styles.flexWrap, styles.flexShrink1]}
                >
                    {props.label && <Text style={[styles.ml1]}>{props.label}</Text>}
                    {LabelComponent && <LabelComponent />}
                </PressableWithFeedback>
            </View>
            <FormHelpMessage message={props.errorText} />
        </View>
    );
}

CheckboxWithLabel.propTypes = propTypes;
CheckboxWithLabel.defaultProps = defaultProps;
CheckboxWithLabel.displayName = 'CheckboxWithLabel';

const CheckboxWithLabelWithRef = React.forwardRef((props, ref) => (
    <CheckboxWithLabel
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

CheckboxWithLabelWithRef.displayName = 'CheckboxWithLabelWithRef';

export default CheckboxWithLabelWithRef;
