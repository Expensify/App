/**
 * iOS has incorrect selection(caret) position when using setNativeProps
 * to update text and selection concurrently.
 * Issue: https://github.com/facebook/react-native/issues/33077
 */

import React from 'react';
import {
    View,
    TouchableOpacity,
    InteractionManager,
} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import BigNumberPad from './BigNumberPad';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import withLocalize from './withLocalize';
import compose from '../libs/compose';
import Button from './Button';
import Text from './Text';
import CONST from '../CONST';
import TextInput from './TextInput';
import {propTypes, defaultProps} from '../pages/iou/steps/IOUAmountPage/IOUAmount/IOUAmountPropTypes';

import canUseTouchScreen from '../libs/canUseTouchscreen';

class IOUAmountInput extends React.Component {
    componentDidMount() {
        this.focusTextInput();
    }

    componentDidUpdate(prevProps) {
        if (this.props.iou.selectedCurrencyCode === prevProps.iou.selectedCurrencyCode) {
            return;
        }

        this.focusTextInput();
    }

    /**
     * Focus text input
     */
    focusTextInput() {
        // Component may not initialized due to navigation transitions
        // Wait until interactions are complete before trying to focus
        InteractionManager.runAfterInteractions(() => {
            // Focus text input
            if (!this.textInput) {
                return;
            }

            this.textInput.focus();
        });
    }

    render() {
        const formattedAmount = this.props.replaceAllDigits(this.props.amount, this.props.toLocaleDigit);
        return (
            <>
                <View style={[
                    styles.flex1,
                    styles.flexRow,
                    styles.w100,
                    styles.alignItemsCenter,
                    styles.justifyContentCenter,
                ]}
                >
                    <TouchableOpacity onPress={() => Navigation.navigate(this.props.hasMultipleParticipants
                        ? ROUTES.getIouBillCurrencyRoute(this.props.reportID)
                        : ROUTES.getIouRequestCurrencyRoute(this.props.reportID))}
                    >
                        <Text style={styles.iouAmountText}>
                            {lodashGet(this.props.currencyList, [this.props.iou.selectedCurrencyCode, 'symbol'])}
                        </Text>
                    </TouchableOpacity>
                    <TextInput
                        disableKeyboard
                        autoGrow
                        hideFocusedState
                        isValueControlled={this.props.isValueControlled}
                        inputStyle={[styles.iouAmountTextInput, styles.p0, styles.noLeftBorderRadius, styles.noRightBorderRadius]}
                        textInputContainerStyles={[styles.borderNone, styles.noLeftBorderRadius, styles.noRightBorderRadius]}
                        onChangeText={this.props.updateAmount}
                        ref={el => this.textInput = el}
                        value={formattedAmount}
                        placeholder={this.props.numberFormat(0)}
                        keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                        selection={this.props.selection}
                        onSelectionChange={this.props.onSelectionChange}
                    />
                </View>
                <View style={[styles.w100, styles.justifyContentEnd]}>
                    {canUseTouchScreen()
                        ? (
                            <BigNumberPad
                                numberPressed={this.props.updateAmountNumberPad}
                            />
                        ) : <View />}

                    <Button
                        success
                        style={[styles.w100, styles.mt5]}
                        onPress={() => this.props.onStepComplete(this.props.amount)}
                        pressOnEnter
                        isDisabled={!this.props.amount.length || parseFloat(this.props.amount) < 0.01}
                        text={this.props.translate('common.next')}
                    />
                </View>
            </>
        );
    }
}

IOUAmountInput.propTypes = propTypes;
IOUAmountInput.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        currencyList: {key: ONYXKEYS.CURRENCY_LIST},
        iou: {key: ONYXKEYS.IOU},
    }),
)(IOUAmountInput);
