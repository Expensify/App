import React, {Component} from 'react';
import {
    Animated, TextInput, View, TouchableWithoutFeedback,
} from 'react-native';
import ExpensiTextInputLabel from './ExpensiTextInputLabel';
import {propTypes, defaultProps} from './propTypes';
import themeColors from '../../styles/themes/default';
import styles from '../../styles/styles';

const ACTIVE_LABEL_TRANSLATE_Y = -10;
const ACTIVE_LABEL_TRANSLATE_X = (translateX = -22) => translateX;
const ACTIVE_LABEL_SCALE = 0.8668;

const INACTIVE_LABEL_TRANSLATE_Y = 0;
const INACTIVE_LABEL_TRANSLATE_X = 0;
const INACTIVE_LABEL_SCALE = 1;

class BaseExpensiTextInput extends Component {
    constructor(props) {
        super(props);

        const hasValue = props.value.length > 0;

        this.state = {
            isFocused: false,
            labelTranslateY: new Animated.Value(hasValue ? ACTIVE_LABEL_TRANSLATE_Y : INACTIVE_LABEL_TRANSLATE_Y),
            labelTranslateX: new Animated.Value(hasValue
                ? ACTIVE_LABEL_TRANSLATE_X(props.translateX) : INACTIVE_LABEL_TRANSLATE_X),
            labelScale: new Animated.Value(hasValue ? ACTIVE_LABEL_SCALE : INACTIVE_LABEL_SCALE),
        };

        this.input = null;
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    onFocus() {
        if (this.props.onFocus) { this.props.onFocus(); }
        this.setState({isFocused: true});
        if (this.props.value.length === 0) {
            this.animateLabel(
                ACTIVE_LABEL_TRANSLATE_Y,
                ACTIVE_LABEL_TRANSLATE_X(this.props.translateX),
                ACTIVE_LABEL_SCALE,
            );
        }
    }

    onBlur() {
        if (this.props.onBlur) { this.props.onBlur(); }
        this.setState({isFocused: false});
        if (this.props.value.length === 0) {
            this.animateLabel(INACTIVE_LABEL_TRANSLATE_Y, INACTIVE_LABEL_TRANSLATE_X, INACTIVE_LABEL_SCALE);
        }
    }

    animateLabel(translateY, translateX, scale) {
        Animated.parallel([
            Animated.spring(this.state.labelTranslateY, {
                toValue: translateY,
                duration: 80,
                useNativeDriver: true,
            }),
            Animated.spring(this.state.labelTranslateX, {
                toValue: translateX,
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

    render() {
        const {
            label,
            value,
            placeholder,
            error,
            containerStyles,
            inputStyle,
            ignoreLabelTranslateX,
            innerRef,
            ...inputProps
        } = this.props;

        const hasLabel = Boolean(label.length);
        return (
            <View style={[styles.componentHeightLarge, ...containerStyles]}>
                <TouchableWithoutFeedback onPress={() => this.input.focus()}>
                    <View
                        style={[
                            styles.expensiTextInputContainer,
                            !hasLabel && styles.pv0,
                            this.state.isFocused && styles.borderColorFocus,
                            error && styles.borderColorDanger,
                        ]}
                    >
                        {hasLabel ? (
                            <ExpensiTextInputLabel
                                label={label}
                                labelTranslateX={
                                    ignoreLabelTranslateX
                                        ? new Animated.Value(0)
                                        : this.state.labelTranslateX
                                }
                                labelTranslateY={this.state.labelTranslateY}
                                labelScale={this.state.labelScale}
                            />
                        ) : null}
                        <TextInput
                            ref={(ref) => {
                                if (typeof innerRef === 'function') { innerRef(ref); }
                                this.input = ref;
                            }}
                            // eslint-disable-next-line
                            {...inputProps}
                            value={value}
                            placeholder={(this.state.isFocused || !label) ? placeholder : null}
                            placeholderTextColor={themeColors.placeholderText}
                            underlineColorAndroid="transparent"
                            style={inputStyle}
                            onFocus={this.onFocus}
                            onBlur={this.onBlur}
                        />
                    </View>
                </TouchableWithoutFeedback>
            </View>
        );
    }
}

BaseExpensiTextInput.propTypes = propTypes;
BaseExpensiTextInput.defaultProps = defaultProps;

export default BaseExpensiTextInput;
