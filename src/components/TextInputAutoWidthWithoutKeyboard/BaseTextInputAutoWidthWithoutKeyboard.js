import React from 'react';
import {
    View,
    AppState,
    Keyboard,

    // eslint-disable-next-line no-restricted-imports
    TextInput as RNTextInput,
} from 'react-native';
import _ from 'underscore';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import * as StyleUtils from '../../styles/StyleUtils';
import Text from '../Text';
import * as baseTextInputAutoWidthWithoutKeyboardPropTypes from './baseTextInputAutoWidthWithoutKeyboardPropTypes';

class BaseTextInputAutoWidthWithoutKeyboard extends React.Component {
    constructor(props) {
        super(props);
        this.dismissKeyboardWhenBackgrounded = this.dismissKeyboardWhenBackgrounded.bind(this);

        this.state = {
            textInputWidth: 0,
        };
    }

    componentDidMount() {
        this.appStateSubscription = AppState.addEventListener(
            'change',
            this.dismissKeyboardWhenBackgrounded,
        );
    }

    componentWillUnmount() {
        if (!this.appStateSubscription) {
            return;
        }
        this.appStateSubscription.remove();
    }

    dismissKeyboardWhenBackgrounded(nextAppState) {
        if (!nextAppState.match(/inactive|background/)) {
            return;
        }
        Keyboard.dismiss();
    }

    render() {
        const propsWithoutStyles = _.omit(this.props, ['inputStyle', 'textStyle']);
        return (
            <>
                <View>
                    <RNTextInput
                        placeholderTextColor={themeColors.placeholderText}
                        style={[this.props.inputStyle, StyleUtils.getAutoGrowTextInputStyle(this.state.textInputWidth)]}
                        ref={this.props.forwardedRef}
                        showSoftInputOnFocus={false}
                        /* eslint-disable-next-line react/jsx-props-no-spreading */
                        {...propsWithoutStyles}
                    />
                </View>
                {/*
                Text input component doesn't support auto grow by default.
                We're using a hidden text input to achieve that.
                This text view is used to calculate width of the input value given textStyle in this component.
                This Text component is intentionally positioned out of the screen.
                */}
                <Text
                    style={[this.props.textStyle, styles.hiddenElementOutsideOfWindow]}
                    onLayout={e => this.setState({textInputWidth: e.nativeEvent.layout.width})}
                >
                    {this.props.value || this.props.placeholder}
                </Text>
            </>
        );
    }
}

BaseTextInputAutoWidthWithoutKeyboard.propTypes = baseTextInputAutoWidthWithoutKeyboardPropTypes.propTypes;
BaseTextInputAutoWidthWithoutKeyboard.defaultProps = baseTextInputAutoWidthWithoutKeyboardPropTypes.defaultProps;

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <BaseTextInputAutoWidthWithoutKeyboard {...props} forwardedRef={ref} />
));
