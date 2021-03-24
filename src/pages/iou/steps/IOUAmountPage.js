import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import BigNumberPad from '../../../components/BigNumberPad';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import TextInputFocusable from '../../../components/TextInputFocusable';

const propTypes = {
    // Callback to inform parent modal of success
    onStepComplete: PropTypes.func.isRequired,

    // Currency selection will be implemented later
    // eslint-disable-next-line react/no-unused-prop-types
    currencySelected: PropTypes.func.isRequired,

    // User's currency preference
    selectedCurrency: PropTypes.string.isRequired,

    /* Window Dimensions Props */
    ...windowDimensionsPropTypes,

    /* Onyx Props */

    // Holds data related to IOU view state, rather than the underlying IOU data.
    iou: PropTypes.shape({

        // Whether or not the IOU step is loading (retrieving users preferred currency)
        loading: PropTypes.bool,
    }),
};

const defaultProps = {
    iou: {},
};
class IOUAmountPage extends React.Component {
    constructor(props) {
        super(props);

        this.onlyAllowNumericValues = this.onlyAllowNumericValues.bind(this);

        this.state = {
            textInputWidth: 0,
            amount: '',
            isNextButtonEnabled: false,
        };
    }

    componentDidMount() {
        if (this.textInput) {
            this.textInput.focus();
        }
    }

    onlyAllowNumericValues(event) {
        // Backspace button is pressed
        if (event.key === '<' || event.key === 'Backspace') {
            if (this.state.amount.length > 0) {
                this.setState(prevState => ({
                    amount: prevState.amount.substring(0, prevState.amount.length - 1),
                    isNextButtonEnabled: prevState.amount.length !== 1,
                }));
            }
            return;
        }

        const prevValue = event.target.value;
        const newValue = `${prevValue}${event.key}`;
        const decimalNumberRegex = new RegExp(/^\d{1,6}(\.\d{0,2})?$/, 'i');
        if (!decimalNumberRegex.test(newValue)) {
            event.preventDefault();
            return;
        }
        this.setState({
            amount: newValue,
            isNextButtonEnabled: true,
        });
    }

    render() {
        return (
            <View style={[styles.flex1, styles.pageWrapper]}>
                {this.props.iou.loading && <ActivityIndicator color={themeColors.text} />}
                <View style={[
                    styles.flex1,
                    styles.flexRow,
                    styles.w100,
                    styles.alignItemsCenter,
                    styles.justifyContentCenter,
                ]}
                >
                    <Text style={styles.iouAmountText}>
                        {this.props.selectedCurrency}
                    </Text>
                    {this.props.isSmallScreenWidth
                        ? <Text style={styles.iouAmountText}>{this.props.amount}</Text>
                        : (
                            <View>
                                <TextInputFocusable
                                        style={[styles.iouAmountTextInput,
                                            {width: Math.max(5, this.state.textInputWidth)}]}
                                        onKeyPress={this.onlyAllowNumericValues}
                                        ref={el => this.textInput = el}
                                        value={this.state.amount}
                                        textAlign="left"
                                />
                                <Text
                                    style={[styles.iouAmountText, styles.invisible, {left: 100000}]}
                                    onLayout={e => this.setState({textInputWidth: e.nativeEvent.layout.width})}
                                >
                                    {this.state.amount}
                                </Text>
                            </View>
                        )}
                </View>
                <View style={[styles.w100, styles.justifyContentEnd]}>
                    {this.props.isSmallScreenWidth
                        ? <BigNumberPad numberPressed={this.props.numberPressed} />
                        : <View />}
                    <TouchableOpacity
                            style={[styles.button, styles.w100, styles.mt5, styles.buttonSuccess,
                                !this.state.isNextButtonEnabled ? styles.buttonSuccessDisabled : {}]}
                            onPress={() => this.props.onStepComplete(this.state.amount)}
                            disabled={!this.state.isNextButtonEnabled}
                    >
                        <Text style={[styles.buttonText, styles.buttonSuccessText]}>
                            Next
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}
IOUAmountPage.displayName = 'IOUAmountPage';
IOUAmountPage.propTypes = propTypes;
IOUAmountPage.defaultProps = defaultProps;

export default withWindowDimensions(withOnyx({
    iou: {key: ONYXKEYS.IOU},
})(IOUAmountPage));
