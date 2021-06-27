import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {
    Animated, TextInput,
} from 'react-native';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import ExpensiTextInputWrapper from './ExpensiTextInputWrapper';

const ACTIVE_LABEL_TRANSLATE_Y = -20;
const ACTIVE_LABEL_SCALE = 0.8668;

const INACTIVE_LABEL_TRANSLATE_Y = 0;
const INACTIVE_LABEL_SCALE = 1;

const propTypes = {
    /** Input label */
    label: PropTypes.string,

    /** Input value */
    value: PropTypes.string.isRequired,

    /** Input value placeholder */
    placeholder: PropTypes.string,

    /** Callback that is called when the text input is focused. */
    onFocusExtra: PropTypes.func,

    /** Callback that is called when the text input is blurred. */
    onBlurExtra: PropTypes.func,

    /** Input with error  */
    error: PropTypes.bool,

    /** Styles for the outermost container for this component. */
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Input width */
    fullWidth: PropTypes.bool,
};

const defaultProps = {
    label: '',
    placeholder: '',
    error: false,
    onFocusExtra: null,
    onBlurExtra: null,
    containerStyles: [],
    fullWidth: true,
};

class ExpensiTextInput extends Component {
    constructor(props) {
        super(props);

        const hasValue = props.value.length > 0;

        this.state = {
            isFocused: false,
            labelTranslateY: new Animated.Value(hasValue ? ACTIVE_LABEL_TRANSLATE_Y : INACTIVE_LABEL_TRANSLATE_Y),
            labelScale: new Animated.Value(hasValue ? ACTIVE_LABEL_SCALE : INACTIVE_LABEL_SCALE),
        };

        this.input = null;
    }

    animateLabel = (translateY, scale) => {
        Animated.parallel([
            Animated.spring(this.state.labelTranslateY, {
                toValue: translateY,
                duration: 80,
                useNativeDriver: true,
            }),
            Animated.spring(this.state.labelScale, {
                toValue: scale,
                duration: 80,
                useNativeDriver: true,
            }),
        ]).start();
    }

    onFocus = () => {
        if (this.props.onFocusExtra) { this.props.onFocusExtra(); }
        this.setState({isFocused: true});
        if (this.props.value.length === 0) {
            this.animateLabel(ACTIVE_LABEL_TRANSLATE_Y, ACTIVE_LABEL_SCALE);
        }
    }

    onBlur = () => {
        if (this.props.onBlurExtra) { this.props.onBlurExtra(); }
        this.setState({isFocused: false});
        if (this.props.value.length === 0) {
            this.animateLabel(INACTIVE_LABEL_TRANSLATE_Y, INACTIVE_LABEL_SCALE);
        }
    }

    focus = () => this.input.focus()

    render() {
        const {
            label, value, placeholder, error, containerStyles, ...inputProps
        } = this.props;
        const {
            isFocused, labelTranslateY, labelScale,
        } = this.state;

        return (
            <ExpensiTextInputWrapper
                containerStyles={containerStyles}
                label={label}
                isFocused={isFocused}
                error={error}
                labelTranslateY={labelTranslateY}
                labelTranslateX={0}
                labelScale={labelScale}
                onPress={this.focus}
            >
                <TextInput
                    ref={ref => this.input = ref}
                    value={value}
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                    placeholder={isFocused || !label ? placeholder : null}
                    placeholderTextColor={themeColors.placeholderText}
                    style={styles.expensiTextInput}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                    {...inputProps}
                />
            </ExpensiTextInputWrapper>
        );
    }
}

ExpensiTextInput.propTypes = propTypes;
ExpensiTextInput.defaultProps = defaultProps;

export default ExpensiTextInput;
