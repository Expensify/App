import React from 'react';
import PropTypes from 'prop-types';
import {View, TouchableOpacity} from 'react-native';
import _ from 'underscore';
import styles from '../styles/styles';
import Checkbox from './Checkbox';
import Text from './Text';
import InlineErrorText from './InlineErrorText';

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

    /** The default value for the checkbox */
    defaultValue: PropTypes.bool,

    /** React ref being forwarded to the Checkbox input */
    forwardedRef: PropTypes.func,

    /** The ID used to uniquely identify the input in a Form */
    inputID: PropTypes.string,

    /** Saves a draft of the input value when used in a form */
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
    defaultValue: false,
    forwardedRef: () => {},
};

class CheckboxWithLabel extends React.Component {
    constructor(props) {
        super(props);

        this.isChecked = props.defaultValue || props.isChecked;
        this.LabelComponent = props.LabelComponent;
        this.defaultStyles = [styles.flexRow, styles.alignItemsCenter];
        this.wrapperStyles = _.isArray(props.style) ? [...this.defaultStyles, ...props.style] : [...this.defaultStyles, props.style];

        this.toggleCheckbox = this.toggleCheckbox.bind(this);
    }

    toggleCheckbox() {
        this.props.onInputChange(!this.isChecked);
        this.isChecked = !this.isChecked;
    }

    render() {
        return (
            <>
                <View style={this.wrapperStyles}>
                    <Checkbox
                        isChecked={this.isChecked}
                        onPress={this.toggleCheckbox}
                        label={this.props.label}
                        hasError={Boolean(this.props.errorText)}
                        forwardedRef={this.props.forwardedRef}
                        inputID={this.props.inputID}
                        shouldSaveDraft={this.props.shouldSaveDraft}
                    />
                    <TouchableOpacity
                        onPress={this.toggleCheckbox}
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
                        {this.props.label && (
                            <Text style={[styles.ml1]}>
                                {this.props.label}
                            </Text>
                        )}
                        {this.LabelComponent && (<this.LabelComponent />)}
                    </TouchableOpacity>
                </View>
                <InlineErrorText styles={[styles.ml8]}>
                    {this.props.errorText}
                </InlineErrorText>
            </>
        );
    }
}

CheckboxWithLabel.propTypes = propTypes;
CheckboxWithLabel.defaultProps = defaultProps;
CheckboxWithLabel.displayName = 'CheckboxWithLabel';

export default React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <CheckboxWithLabel {...props} forwardedRef={ref} />
));
