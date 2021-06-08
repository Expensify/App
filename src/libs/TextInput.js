import React, {Component} from 'react';

import {
    Animated, Text, TextInput, View,
} from 'react-native';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';

const ACTIVE_LABEL_TRANSLATE_Y = -12;
const ACTIVE_LABEL_TRANSLATE_X = -5;
const ACTIVE_LABEL_SCALE = 0.85;

const INACTIVE_LABEL_TRANSLATE_Y = 0;
const INACTIVE_LABEL_TRANSLATE_X = 0;
const INACTIVE_LABEL_SCALE = 1;

class ExpensiTextInput extends Component {
    constructor(props) {
        super(props);

        const hasValue = props.value.length > 0;

        console.log(hasValue);

        this.state = {
            isFocused: false,
            labelTranslateY: new Animated.Value(hasValue ? ACTIVE_LABEL_TRANSLATE_Y : INACTIVE_LABEL_TRANSLATE_Y),
            labelTranslateX: new Animated.Value(hasValue ? ACTIVE_LABEL_TRANSLATE_X : INACTIVE_LABEL_TRANSLATE_X),
            labelScale: new Animated.Value(hasValue ? ACTIVE_LABEL_SCALE : INACTIVE_LABEL_SCALE),
        };

        this.input = null;
    }

    animateLabel = (translateY, translateX, scale) => {
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

    onFocus = () => {
        this.setState({isFocused: true});

        if (this.props.value.length === 0) {
            this.animateLabel(ACTIVE_LABEL_TRANSLATE_Y, ACTIVE_LABEL_TRANSLATE_X, ACTIVE_LABEL_SCALE);
        }
    }

    onBlur = () => {
        this.setState({isFocused: false});
        if (this.props.value.length === 0) {
            this.animateLabel(INACTIVE_LABEL_TRANSLATE_Y, INACTIVE_LABEL_TRANSLATE_X, INACTIVE_LABEL_SCALE);
        }
    }

    render() {
        const {
            label, value, placeholder, onChangeText,
        } = this.props;
        const {
            isFocused, labelTranslateY, labelTranslateX, labelScale,
        } = this.state;
        return (
            <View style={[
                styles.expensiTextInputContainer,
                isFocused && styles.expensiTextInputContainerBlueBorder,
            ]}
            >
                <Animated.Text
                    style={[
                        styles.expensiTextInputLabel,
                        styles.expensiTextInputLabelTransformation(labelTranslateY, labelTranslateX, labelScale),
                    ]}
                    onPress={() => this.input.focus()}
                >
                    {label}
                </Animated.Text>
                <TextInput
                    ref={ref => this.input = ref}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                    placeholder={isFocused ? placeholder : null}
                    placeholderTextColor={themeColors.placeholderText}
                />
            </View>
        );
    }
}

export default ExpensiTextInput;
