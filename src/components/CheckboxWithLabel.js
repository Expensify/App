import React from 'react';
import PropTypes from 'prop-types';
import {View, TouchableOpacity} from 'react-native';
import _ from 'underscore';
import styles from '../styles/styles';
import Checkbox from './Checkbox';
import Text from './Text';
import InlineErrorText from './InlineErrorText';
import * as FormUtils from '../libs/FormUtils';

const propTypes = {
    /** Whether the checkbox is checked */
    isChecked: PropTypes.bool,

    /** Called when the checkbox or label is pressed */
    onInputChange: PropTypes.func.isRequired,

    /** Container styles */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** Text that appears next to check box */
    label: PropTypes.string,

    /** Component to display for label */
    LabelComponent: PropTypes.func,

    /** Error text to display */
    errorText: PropTypes.string,

    /** Indicates that the input is being used with the Form component */
    isFormInput: PropTypes.bool,

    /** The default value for the checkbox */
    defaultValue: PropTypes.bool,

    /** React ref being forwarded to the Checkbox input */
    forwardedRef: PropTypes.func,

    /**
     * The ID used to uniquely identify the input
     *
     * @param {Object} props - props passed to the input
     * @returns {Object} - returns an Error object if isFormInput is supplied but inputID is falsey or not a string
     */
    inputID: props => FormUtils.validateInputIDProps(props),

    /** Saves a draft of the input value when used in a form */
    shouldSaveDraft: PropTypes.bool,
};

const defaultProps = {
    isFormInput: false,
    inputID: undefined,
    style: [],
    label: undefined,
    LabelComponent: undefined,
    errorText: '',
    shouldSaveDraft: false,
    isChecked: false,
    defaultValue: false,
    forwardedRef: () => {},
};

const CheckboxWithLabel = (props) => {
    const LabelComponent = props.LabelComponent;
    const defaultStyles = [styles.flexRow, styles.alignItemsCenter];
    const wrapperStyles = _.isArray(props.style) ? [...defaultStyles, ...props.style] : [...defaultStyles, props.style];
    let isChecked = props.defaultValue ? props.defaultValue : props.isChecked;

    function toggleCheckbox() {
        props.onInputChange(!isChecked);
        isChecked = !isChecked;
    }

    if (!props.label && !LabelComponent) {
        throw new Error('Must provide at least label or LabelComponent prop');
    }
    return (
        <>
            <View style={wrapperStyles}>
                <Checkbox
                    isChecked={isChecked}
                    onPress={toggleCheckbox}
                    label={props.label}
                    hasError={Boolean(props.errorText)}
                    forwardedRef={props.forwardedRef}
                    isFormInput={props.isFormInput}
                    inputID={props.inputID}
                    shouldSaveDraft={props.shouldSaveDraft}
                />
                <TouchableOpacity
                    onPress={toggleCheckbox}
                    style={[
                        styles.ml3,
                        styles.pr2,
                        styles.w100,
                        styles.flexRow,
                        styles.flexWrap,
                        styles.flexShrink1,
                        styles.alignItemsCenter,
                    ]}
                >
                    {props.label && (
                        <Text style={[styles.ml1]}>
                            {props.label}
                        </Text>
                    )}
                    {LabelComponent && (<LabelComponent />)}
                </TouchableOpacity>
            </View>
            <InlineErrorText styles={[styles.ml8]}>
                {props.errorText}
            </InlineErrorText>
        </>
    );
};

CheckboxWithLabel.propTypes = propTypes;
CheckboxWithLabel.defaultProps = defaultProps;
CheckboxWithLabel.displayName = 'CheckboxWithLabel';

export default React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <CheckboxWithLabel {...props} forwardedRef={ref} />
));
