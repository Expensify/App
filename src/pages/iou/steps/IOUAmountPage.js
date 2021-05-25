import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import BigNumberPad from '../../../components/BigNumberPad';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import TextInputAutoWidth from '../../../components/TextInputAutoWidth';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import Button from '../../../components/Button';
import KeyboardShortcut from '../../../libs/KeyboardShortcut';

const propTypes = {
    // Whether or not this IOU has multiple participants
    hasMultipleParticipants: PropTypes.bool.isRequired,

    /* The ID of the report this screen should display */
    reportID: PropTypes.string.isRequired,

    // Callback to inform parent modal of success
    onStepComplete: PropTypes.func.isRequired,

    /** Currency selection will be implemented later */
    // eslint-disable-next-line react/no-unused-prop-types
    currencySelected: PropTypes.func.isRequired,

    // User's currency preference
    selectedCurrency: PropTypes.shape({
        // Currency code for the selected currency
        currencyCode: PropTypes.string,

        // Currency symbol for the selected currency
        currencySymbol: PropTypes.string,
    }).isRequired,

    /** Previously selected amount to show if the user comes back to this screen */
    selectedAmount: PropTypes.string.isRequired,

    /** Window Dimensions Props */
    ...windowDimensionsPropTypes,

    /** react-navigation object */
    navigation: PropTypes.shape({

        /** Allows us to add a listener for the navigation transition end */
        addListener: PropTypes.func,
    }).isRequired,

    /* Onyx Props */

    /** Holds data related to IOU view state, rather than the underlying IOU data. */
    iou: PropTypes.shape({

        /** Whether or not the IOU step is loading (retrieving users preferred currency) */
        loading: PropTypes.bool,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    iou: {},
};

class IOUAmountPage extends React.Component {
    constructor(props) {
        super(props);

        this.updateAmountIfValidInput = this.updateAmountIfValidInput.bind(this);
        this.state = {
            amount: props.selectedAmount,
        };
    }

    componentDidMount() {
        // Component is not initialized yet due to navigation transitions
        // Wait until interactions are complete before trying to focus or attach listener
        this.props.navigation.addListener('transitionEnd', () => {
            // Setup and attach keypress handler for navigating to the next screen
            this.unsubscribe = KeyboardShortcut.subscribe('Enter', () => {
                if (this.state.amount !== '') {
                    this.props.onStepComplete(this.state.amount);
                }
            }, [], true);

            // Focus text input
            if (this.textInput) {
                this.textInput.focus();
            }
        });
    }

    componentWillUnmount() {
        // Cleanup all keydown event listeners that we've set up
        if (!this.unsubscribe) {
            return;
        }

        this.unsubscribe();
    }

    /**
     * Update amount with number or Backspace pressed.
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit to enable Next button
     *
     * @param {String} key
     */
    updateAmountIfValidInput(key) {
        // Backspace button is pressed
        if (key === '<' || key === 'Backspace') {
            if (this.state.amount.length > 0) {
                this.setState(prevState => ({
                    amount: prevState.amount.substring(0, prevState.amount.length - 1),
                }));
            }
            return;
        }

        this.setState((prevState) => {
            const newValue = `${prevState.amount}${key}`;

            // Regex to validate decimal number with up to 3 decimal numbers
            const decimalNumberRegex = new RegExp(/^\d+(\.\d{0,3})?$/, 'i');
            if (!decimalNumberRegex.test(newValue)) {
                return prevState;
            }
            return {
                amount: newValue,
            };
        });
    }

    render() {
        return (
            <View style={[styles.flex1, styles.pageWrapper]}>
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
                            {this.props.selectedCurrency.currencySymbol}
                        </Text>
                    </TouchableOpacity>
                    {this.props.isSmallScreenWidth
                        ? (
                            <Text
                                style={styles.iouAmountText}
                            >
                                {this.state.amount}
                            </Text>
                        ) : (
                            <TextInputAutoWidth
                                inputStyle={styles.iouAmountTextInput}
                                textStyle={styles.iouAmountText}
                                onKeyPress={(event) => {
                                    this.updateAmountIfValidInput(event.key);
                                    event.preventDefault();
                                }}
                                ref={el => this.textInput = el}
                                value={this.state.amount}
                                placeholder="0"
                            />
                        )}
                </View>
                <View style={[styles.w100, styles.justifyContentEnd]}>
                    {this.props.isSmallScreenWidth
                        ? (
                            <BigNumberPad
                                numberPressed={this.updateAmountIfValidInput}
                            />
                        ) : <View />}

                    <Button
                        success
                        style={[styles.w100, styles.mt5]}
                        onPress={() => this.props.onStepComplete(this.state.amount)}
                        isDisabled={this.state.amount.length === 0}
                        text={this.props.translate('common.next')}
                    />
                </View>
            </View>
        );
    }
}

IOUAmountPage.displayName = 'IOUAmountPage';
IOUAmountPage.propTypes = propTypes;
IOUAmountPage.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
    withOnyx({
        iou: {key: ONYXKEYS.IOU},
    }),
)(IOUAmountPage);
