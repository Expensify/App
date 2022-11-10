import React from 'react';
import PropTypes from 'prop-types';
import {View, TouchableOpacity} from 'react-native';
import styles from '../styles/styles';
import Checkbox from './Checkbox';
import Text from './Text';
import FormHelpMessage from './FormHelpMessage';

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
};

class CheckboxWithLabel extends React.Component {
    constructor(props) {
        super(props);

        this.isChecked = props.value || props.defaultValue || props.isChecked;
        this.LabelComponent = props.LabelComponent;

        this.toggleCheckbox = this.toggleCheckbox.bind(this);
    }

    toggleCheckbox() {
        this.props.onInputChange(!this.isChecked);
        this.isChecked = !this.isChecked;
    }

    render() {
        return (
            <View style={this.props.style}>
                <View style={[styles.flexRow, styles.alignItemsCenter]}>
                    <Checkbox
                        isChecked={this.isChecked}
                        onPress={this.toggleCheckbox}
                        label={this.props.label}
                        hasError={Boolean(this.props.errorText)}
                        forwardedRef={this.props.forwardedRef}
                    />
                    <TouchableOpacity
                        focusable={false}
                        onPress={this.toggleCheckbox}
                        style={[
                            styles.ml3,
                            styles.pr2,
                            styles.w100,
                            styles.flexRow,
                            styles.flexWrap,
                            styles.flexShrink1,
                            styles.alignItemsCenter,
                            styles.noSelect,
                        ]}
                    >
                        {this.props.label && (
                            <Text style={[styles.ml1]}>
                                {this.props.label}
                            </Text>
                        )}
                        {this.LabelComponent && (<this.LabelComponent />)}
                    </TouchableOpacity>
                </View>
                <FormHelpMessage message={this.props.errorText} />
            </View>
        );
    }
}

CheckboxWithLabel.propTypes = propTypes;
CheckboxWithLabel.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <CheckboxWithLabel {...props} forwardedRef={ref} />
));
