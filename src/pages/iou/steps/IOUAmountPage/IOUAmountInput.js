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
import PropTypes from 'prop-types';
import ONYXKEYS from '../../../../ONYXKEYS';
import styles from '../../../../styles/styles';
import BigNumberPad from '../../../../components/BigNumberPad';
import Navigation from '../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../ROUTES';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import compose from '../../../../libs/compose';
import Button from '../../../../components/Button';
import Text from '../../../../components/Text';
import CONST from '../../../../CONST';
import TextInput from '../../../../components/TextInput';
import * as IOUAmountUtils from './IOUAmountUtils';
import canUseTouchScreen from '../../../../libs/canUseTouchscreen';

const propTypes = {
    /** Holds data related to IOU view state, rather than the underlying IOU data. */
    iou: PropTypes.shape({

        /** Whether or not the IOU step is loading (retrieving users preferred currency) */
        loading: PropTypes.bool,

        /** Selected Currency Code of the current IOU */
        selectedCurrencyCode: PropTypes.string,
    }),

    /** The currency list constant object from Onyx */
    currencyList: PropTypes.objectOf(PropTypes.shape({
        /** Symbol for the currency */
        symbol: PropTypes.string,

        /** Name of the currency */
        name: PropTypes.string,

        /** ISO4217 Code for the currency */
        ISO4217: PropTypes.string,
    })).isRequired,

    amount: PropTypes.string.isRequired,

    /** Whether or not this IOU has multiple participants */
    hasMultipleParticipants: PropTypes.bool.isRequired,

    /** The ID of the report this screen should display */
    reportID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,

};
const defaultProps = {
    iou: {
        selectedCurrencyCode: CONST.CURRENCY.USD,
    },
};
class IOUAmountInput extends React.Component {
    constructor(props) {
        super(props);
        this.focusTextInput = this.focusTextInput.bind(this);
    }

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
        const formattedAmount = IOUAmountUtils.replaceAllDigits(this.props.amount, this.props.toLocaleDigit);
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
