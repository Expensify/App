import React from 'react';
import {View, InteractionManager} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import BigNumberPad from '../../../components/BigNumberPad';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import * as ReportUtils from '../../../libs/ReportUtils';
import * as IOUUtils from '../../../libs/IOUUtils';
import * as CurrencyUtils from '../../../libs/CurrencyUtils';
import Button from '../../../components/Button';
import CONST from '../../../CONST';
import * as DeviceCapabilities from '../../../libs/DeviceCapabilities';
import TextInputWithCurrencySymbol from '../../../components/TextInputWithCurrencySymbol';
import ScreenWrapper from '../../../components/ScreenWrapper';
import FullPageNotFoundView from '../../../components/BlockingViews/FullPageNotFoundView';
import withNavigation from '../../../components/withNavigation';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import reportPropTypes from '../../reportPropTypes';
import * as IOU from '../../../libs/actions/IOU';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../../../components/withCurrentUserPersonalDetails';

const propTypes = {
    route: PropTypes.shape({
        params: PropTypes.shape({
            iouType: PropTypes.string,
            reportID: PropTypes.string,
        }),
    }),

    /** The report on which the request is initiated on */
    report: reportPropTypes,

    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: PropTypes.shape({
        id: PropTypes.string,
        amount: PropTypes.number,
        currency: PropTypes.string,
        participants: PropTypes.arrayOf(
            PropTypes.shape({
                accountID: PropTypes.number,
                login: PropTypes.string,
                isPolicyExpenseChat: PropTypes.bool,
                isOwnPolicyExpenseChat: PropTypes.bool,
                selected: PropTypes.bool,
            }),
        ),
    }),

    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    route: {
        params: {
            iouType: '',
            reportID: '',
        },
    },
    report: {},
    iou: {
        id: '',
        amount: 0,
        currency: CONST.CURRENCY.USD,
        participants: [],
    },
    ...withCurrentUserPersonalDetailsDefaultProps,
};
class MoneyRequestAmountPage extends React.Component {
    constructor(props) {
        super(props);

        this.updateAmountNumberPad = this.updateAmountNumberPad.bind(this);
        this.updateLongPressHandlerState = this.updateLongPressHandlerState.bind(this);
        this.updateAmount = this.updateAmount.bind(this);
        this.stripCommaFromAmount = this.stripCommaFromAmount.bind(this);
        this.stripSpacesFromAmount = this.stripSpacesFromAmount.bind(this);
        this.focusTextInput = this.focusTextInput.bind(this);
        this.navigateToCurrencySelectionPage = this.navigateToCurrencySelectionPage.bind(this);
        this.navigateBack = this.navigateBack.bind(this);
        this.navigateToNextPage = this.navigateToNextPage.bind(this);
        this.amountViewID = 'amountView';
        this.numPadContainerViewID = 'numPadContainerView';
        this.numPadViewID = 'numPadView';
        this.iouType = lodashGet(props.route, 'params.iouType', '');
        this.reportID = lodashGet(props.route, 'params.reportID', '');
        this.isEditing = lodashGet(props.route, 'path', '').includes('amount');

        const selectedAmountAsString = props.iou.amount ? CurrencyUtils.convertToWholeUnit(props.iou.currency, props.iou.amount).toString() : '';
        this.state = {
            amount: selectedAmountAsString,
            selectedCurrencyCode: props.iou.currency,
            shouldUpdateSelection: true,
            selection: {
                start: selectedAmountAsString.length,
                end: selectedAmountAsString.length,
            },
        };
    }

    componentDidMount() {
        if (this.isEditing) {
            const moneyRequestId = `${this.iouType}${this.reportID}`;
            const shouldReset = this.props.iou.id !== moneyRequestId;
            if (shouldReset) {
                IOU.resetMoneyRequestInfo(moneyRequestId);
            }

            if (_.isEmpty(this.props.iou.participants) || this.props.iou.amount === 0 || shouldReset) {
                Navigation.goBack(ROUTES.getMoneyRequestRoute(this.iouType, this.reportID), true);
                return;
            }
        }

        // Focus automatically after navigating back from currency selector
        this.unsubscribeNavFocus = this.props.navigation.addListener('focus', () => {
            this.focusTextInput();
        });
    }

    componentDidUpdate(prevProps) {
        if (this.isEditing) {
            // ID in Onyx could change by initiating a new request in a separate browser tab or completing a request
            if (_.isEmpty(this.props.iou.participants) || this.props.iou.amount === 0 || prevProps.iou.id !== this.props.iou.id) {
                // The ID is cleared on completing a request. In that case, we will do nothing.
                if (this.props.iou.id) {
                    Navigation.goBack(ROUTES.getMoneyRequestRoute(this.iouType, this.reportID), true);
                }
                return;
            }
        }

        const prevCurrencyParam = lodashGet(prevProps.route.params, 'currency', '');
        const currencyParam = lodashGet(this.props.route.params, 'currency', '');
        if (currencyParam !== '' && prevCurrencyParam !== currencyParam) {
            this.setState({selectedCurrencyCode: currencyParam});
        }

        if (prevProps.iou.currency !== this.props.iou.currency) {
            this.setState({selectedCurrencyCode: this.props.iou.currency});
        }

        if (prevProps.iou.amount !== this.props.iou.amount) {
            const selectedAmountAsString = this.props.iou.amount ? CurrencyUtils.convertToWholeUnit(this.props.iou.currency, this.props.iou.amount).toString() : '';
            this.setState({
                amount: selectedAmountAsString,
                selection: {
                    start: selectedAmountAsString.length,
                    end: selectedAmountAsString.length,
                },
            });
        }
    }

    componentWillUnmount() {
        if (!this.unsubscribeNavFocus) {
            return;
        }
        this.unsubscribeNavFocus();
    }

    /**
     * Event occurs when a user presses a mouse button over an DOM element.
     *
     * @param {Event} event
     * @param {Array<string>} nativeIds
     */
    onMouseDown(event, nativeIds) {
        const relatedTargetId = lodashGet(event, 'nativeEvent.target.id');
        if (!_.contains(nativeIds, relatedTargetId)) {
            return;
        }
        event.preventDefault();
        if (!this.textInput.isFocused()) {
            this.textInput.focus();
        }
    }

    /**
     * Returns the new selection object based on the updated amount's length
     *
     * @param {Object} oldSelection
     * @param {Number} prevLength
     * @param {Number} newLength
     * @returns {Object}
     */
    getNewSelection(oldSelection, prevLength, newLength) {
        const cursorPosition = oldSelection.end + (newLength - prevLength);
        return {start: cursorPosition, end: cursorPosition};
    }

    /**
     * Returns new state object if the updated amount is valid
     *
     * @param {Object} prevState
     * @param {String} newAmount - Changed amount from user input
     * @returns {Object}
     */
    getNewState(prevState, newAmount) {
        // Remove spaces from the newAmount value because Safari on iOS adds spaces when pasting a copied value
        // More info: https://github.com/Expensify/App/issues/16974
        const newAmountWithoutSpaces = this.stripSpacesFromAmount(newAmount);
        if (!this.validateAmount(newAmountWithoutSpaces)) {
            // Use a shallow copy of selection to trigger setSelection
            // More info: https://github.com/Expensify/App/issues/16385
            return {amount: prevState.amount, selection: {...prevState.selection}};
        }
        const selection = this.getNewSelection(prevState.selection, prevState.amount.length, newAmountWithoutSpaces.length);
        return {amount: this.stripCommaFromAmount(newAmountWithoutSpaces), selection};
    }

    /**
     * Get page title based on the iou type
     *
     * @returns {String}
     */
    getTitleForStep() {
        if (this.isEditing) {
            return this.props.translate('iou.amount');
        }
        const title = {
            [CONST.IOU.MONEY_REQUEST_TYPE.REQUEST]: this.props.translate('iou.requestMoney'),
            [CONST.IOU.MONEY_REQUEST_TYPE.SEND]: this.props.translate('iou.sendMoney'),
            [CONST.IOU.MONEY_REQUEST_TYPE.SPLIT]: this.props.translate('iou.splitBill'),
        };
        return title[this.iouType];
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

    /**
     * @param {String} amount
     * @returns {Number}
     */
    calculateAmountLength(amount) {
        const leadingZeroes = amount.match(/^0+/);
        const leadingZeroesLength = lodashGet(leadingZeroes, '[0].length', 0);
        const absAmount = parseFloat((this.stripCommaFromAmount(amount) * 100).toFixed(2)).toString();

        // The following logic will prevent users from pasting an amount that is excessively long in length,
        // which would result in the 'absAmount' value being expressed in scientific notation or becoming infinity.
        if (/\D/.test(absAmount)) {
            return CONST.IOU.AMOUNT_MAX_LENGTH + 1;
        }

        /*
        Return the sum of leading zeroes length and absolute amount length(including fraction digits).
        When the absolute amount is 0, add 2 to the leading zeroes length to represent fraction digits.
        */
        return leadingZeroesLength + (absAmount === '0' ? 2 : absAmount.length);
    }

    /**
     * Check if amount is a decimal up to 3 digits
     *
     * @param {String} amount
     * @returns {Boolean}
     */
    validateAmount(amount) {
        const decimalNumberRegex = new RegExp(/^\d+(,\d+)*(\.\d{0,2})?$/, 'i');
        return amount === '' || (decimalNumberRegex.test(amount) && this.calculateAmountLength(amount) <= CONST.IOU.AMOUNT_MAX_LENGTH);
    }

    /**
     * Strip comma from the amount
     *
     * @param {String} amount
     * @returns {String}
     */
    stripCommaFromAmount(amount) {
        return amount.replace(/,/g, '');
    }

    /**
     * Strip spaces from the amount
     *
     * @param {String} amount
     * @returns {String}
     */
    stripSpacesFromAmount(amount) {
        return amount.replace(/\s+/g, '');
    }

    /**
     * Adds a leading zero to the amount if user entered just the decimal separator
     *
     * @param {String} amount - Changed amount from user input
     * @returns {String}
     */
    addLeadingZero(amount) {
        return amount === '.' ? '0.' : amount;
    }

    /**
     * Update amount with number or Backspace pressed for BigNumberPad.
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit to enable Next button
     *
     * @param {String} key
     */
    updateAmountNumberPad(key) {
        if (this.state.shouldUpdateSelection && !this.textInput.isFocused()) {
            this.textInput.focus();
        }

        // Backspace button is pressed
        if (key === '<' || key === 'Backspace') {
            if (this.state.amount.length > 0) {
                this.setState((prevState) => {
                    const selectionStart = prevState.selection.start === prevState.selection.end ? prevState.selection.start - 1 : prevState.selection.start;
                    const amount = `${prevState.amount.substring(0, selectionStart)}${prevState.amount.substring(prevState.selection.end)}`;
                    return this.getNewState(prevState, amount);
                });
            }
            return;
        }

        this.setState((prevState) => {
            const amount = this.addLeadingZero(`${prevState.amount.substring(0, prevState.selection.start)}${key}${prevState.amount.substring(prevState.selection.end)}`);
            return this.getNewState(prevState, amount);
        });
    }

    /**
     * Update long press value, to remove items pressing on <
     *
     * @param {Boolean} value - Changed text from user input
     */
    updateLongPressHandlerState(value) {
        this.setState({shouldUpdateSelection: !value});
        if (!value && !this.textInput.isFocused()) {
            this.textInput.focus();
        }
    }

    /**
     * Update amount on amount change
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit
     *
     * @param {String} text - Changed text from user input
     */
    updateAmount(text) {
        this.setState((prevState) => {
            const amount = this.addLeadingZero(this.replaceAllDigits(text, this.props.fromLocaleDigit));
            return this.getNewState(prevState, amount);
        });
    }

    /**
     * Replaces each character by calling `convertFn`. If `convertFn` throws an error, then
     * the original character will be preserved.
     *
     * @param {String} text
     * @param {Function} convertFn - `this.props.fromLocaleDigit` or `this.props.toLocaleDigit`
     * @returns {String}
     */
    replaceAllDigits(text, convertFn) {
        return _.chain([...text])
            .map((char) => {
                try {
                    return convertFn(char);
                } catch {
                    return char;
                }
            })
            .join('')
            .value();
    }

    navigateBack() {
        Navigation.goBack(this.isEditing ? ROUTES.getMoneyRequestConfirmationRoute(this.iouType, this.reportID) : null);
    }

    navigateToCurrencySelectionPage() {
        // Remove query from the route and encode it.
        const activeRoute = encodeURIComponent(Navigation.getActiveRoute().replace(/\?.*/, ''));
        Navigation.navigate(ROUTES.getMoneyRequestCurrencyRoute(this.iouType, this.reportID, this.state.selectedCurrencyCode, activeRoute));
    }

    navigateToNextPage() {
        const amountInSmallestCurrencyUnits = CurrencyUtils.convertToSmallestUnit(this.state.selectedCurrencyCode, Number.parseFloat(this.state.amount));
        IOU.setMoneyRequestAmount(amountInSmallestCurrencyUnits);
        IOU.setMoneyRequestCurrency(this.state.selectedCurrencyCode);

        if (this.isEditing) {
            Navigation.goBack(ROUTES.getMoneyRequestConfirmationRoute(this.iouType, this.reportID));
            return;
        }

        const moneyRequestId = `${this.iouType}${this.reportID}`;
        const shouldReset = this.props.iou.id !== moneyRequestId;
        // If the money request ID in Onyx does not match the ID from params, we want to start a new request
        // with the ID from params. We need to clear the participants in case the new request is initiated from FAB.
        if (shouldReset) {
            IOU.setMoneyRequestId(moneyRequestId);
            IOU.setMoneyRequestDescription('');
            IOU.setMoneyRequestParticipants([]);
        }

        // If a request is initiated on a report, skip the participants selection step and navigate to the confirmation page.
        if (this.props.report.reportID) {
            // Reinitialize the participants when the money request ID in Onyx does not match the ID from params
            if (_.isEmpty(this.props.iou.participants) || shouldReset) {
                const currentUserAccountID = this.props.currentUserPersonalDetails.accountID;
                const participants = ReportUtils.isPolicyExpenseChat(this.props.report)
                    ? [{reportID: this.props.report.reportID, isPolicyExpenseChat: true, selected: true}]
                    : _.chain(this.props.report.participantAccountIDs)
                          .filter((accountID) => currentUserAccountID !== accountID)
                          .map((accountID) => ({accountID, selected: true}))
                          .value();
                IOU.setMoneyRequestParticipants(participants);
            }
            Navigation.navigate(ROUTES.getMoneyRequestConfirmationRoute(this.iouType, this.reportID));
            return;
        }
        Navigation.navigate(ROUTES.getMoneyRequestParticipantsRoute(this.iouType));
    }

    render() {
        const formattedAmount = this.replaceAllDigits(this.state.amount, this.props.toLocaleDigit);
        const buttonText = this.isEditing ? this.props.translate('common.save') : this.props.translate('common.next');

        return (
            <FullPageNotFoundView shouldShow={!IOUUtils.isValidMoneyRequestType(this.iouType)}>
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    onEntryTransitionEnd={this.focusTextInput}
                >
                    {({safeAreaPaddingBottomStyle}) => (
                        <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                            <HeaderWithBackButton
                                title={this.getTitleForStep()}
                                onBackButtonPress={this.navigateBack}
                            />
                            <View
                                nativeID={this.amountViewID}
                                onMouseDown={(event) => this.onMouseDown(event, [this.amountViewID])}
                                style={[styles.flex1, styles.flexRow, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}
                            >
                                <TextInputWithCurrencySymbol
                                    formattedAmount={formattedAmount}
                                    onChangeAmount={this.updateAmount}
                                    onCurrencyButtonPress={this.navigateToCurrencySelectionPage}
                                    placeholder={this.props.numberFormat(0)}
                                    ref={(el) => (this.textInput = el)}
                                    selectedCurrencyCode={this.state.selectedCurrencyCode}
                                    selection={this.state.selection}
                                    onSelectionChange={(e) => {
                                        if (!this.state.shouldUpdateSelection) {
                                            return;
                                        }
                                        this.setState({selection: e.nativeEvent.selection});
                                    }}
                                />
                            </View>
                            <View
                                onMouseDown={(event) => this.onMouseDown(event, [this.numPadContainerViewID, this.numPadViewID])}
                                style={[styles.w100, styles.justifyContentEnd, styles.pageWrapper]}
                                nativeID={this.numPadContainerViewID}
                            >
                                {DeviceCapabilities.canUseTouchScreen() ? (
                                    <BigNumberPad
                                        nativeID={this.numPadViewID}
                                        numberPressed={this.updateAmountNumberPad}
                                        longPressHandlerStateChanged={this.updateLongPressHandlerState}
                                    />
                                ) : (
                                    <View />
                                )}

                                <Button
                                    success
                                    style={[styles.w100, styles.mt5]}
                                    onPress={this.navigateToNextPage}
                                    pressOnEnter
                                    isDisabled={!this.state.amount.length || parseFloat(this.state.amount) < 0.01}
                                    text={buttonText}
                                />
                            </View>
                        </View>
                    )}
                </ScreenWrapper>
            </FullPageNotFoundView>
        );
    }
}

MoneyRequestAmountPage.propTypes = propTypes;
MoneyRequestAmountPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withNavigation,
    withCurrentUserPersonalDetails,
    withOnyx({
        iou: {key: ONYXKEYS.IOU},
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '')}`,
        },
    }),
)(MoneyRequestAmountPage);
