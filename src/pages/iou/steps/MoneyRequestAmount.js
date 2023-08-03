import React, {useEffect, useState, useRef, useCallback} from 'react';
import {View, InteractionManager} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import {useFocusEffect} from '@react-navigation/native';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import BigNumberPad from '../../../components/BigNumberPad';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import compose from '../../../libs/compose';
import * as ReportUtils from '../../../libs/ReportUtils';
import * as CurrencyUtils from '../../../libs/CurrencyUtils';
import Button from '../../../components/Button';
import CONST from '../../../CONST';
import * as DeviceCapabilities from '../../../libs/DeviceCapabilities';
import TextInputWithCurrencySymbol from '../../../components/TextInputWithCurrencySymbol';
import reportPropTypes from '../../reportPropTypes';
import * as IOU from '../../../libs/actions/IOU';
import useLocalize from '../../../hooks/useLocalize';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../../../components/withCurrentUserPersonalDetails';
import FullPageNotFoundView from '../../../components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '../../../components/ScreenWrapper';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import * as IOUUtils from '../../../libs/IOUUtils';

const propTypes = {
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

    route: PropTypes.shape({
        params: PropTypes.shape({
            iouType: PropTypes.string,
            reportID: PropTypes.string,
        }),
    }),

    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    report: {},
    iou: {
        id: '',
        amount: 0,
        currency: CONST.CURRENCY.USD,
        participants: [],
    },
    route: {
        params: {
            iouType: '',
            reportID: '',
        },
    },
    ...withCurrentUserPersonalDetailsDefaultProps,
};

const amountViewID = 'amountView';
const numPadContainerViewID = 'numPadContainerView';
const numPadViewID = 'numPadView';

/**
 * Returns the new selection object based on the updated amount's length
 *
 * @param {Object} oldSelection
 * @param {Number} prevLength
 * @param {Number} newLength
 * @returns {Object}
 */
const getNewSelection = (oldSelection, prevLength, newLength) => {
    const cursorPosition = oldSelection.end + (newLength - prevLength);
    return {start: cursorPosition, end: cursorPosition};
};

/**
 * Strip comma from the amount
 *
 * @param {String} newAmount
 * @returns {String}
 */
const stripCommaFromAmount = (newAmount) => newAmount.replace(/,/g, '');

/**
 * Strip spaces from the amount
 *
 * @param {String} newAmount
 * @returns {String}
 */
const stripSpacesFromAmount = (newAmount) => newAmount.replace(/\s+/g, '');

/**
 * Adds a leading zero to the amount if user entered just the decimal separator
 *
 * @param {String} newAmount - Changed amount from user input
 * @returns {String}
 */
const addLeadingZero = (newAmount) => (newAmount === '.' ? '0.' : newAmount);

/**
 * @param {String} newAmount
 * @returns {Number}
 */
const calculateAmountLength = (newAmount) => {
    const leadingZeroes = newAmount.match(/^0+/);
    const leadingZeroesLength = lodashGet(leadingZeroes, '[0].length', 0);
    const absAmount = parseFloat((stripCommaFromAmount(newAmount) * 100).toFixed(2)).toString();

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
};

/**
 * Check if amount is a decimal up to 3 digits
 *
 * @param {String} newAmount
 * @returns {Boolean}
 */
const validateAmount = (newAmount) => {
    const decimalNumberRegex = new RegExp(/^\d+(,\d+)*(\.\d{0,2})?$/, 'i');
    return newAmount === '' || (decimalNumberRegex.test(newAmount) && calculateAmountLength(newAmount) <= CONST.IOU.AMOUNT_MAX_LENGTH);
};

/**
 * Replaces each character by calling `convertFn`. If `convertFn` throws an error, then
 * the original character will be preserved.
 *
 * @param {String} text
 * @param {Function} convertFn - `fromLocaleDigit` or `toLocaleDigit`
 * @returns {String}
 */
const replaceAllDigits = (text, convertFn) =>
    _.chain([...text])
        .map((char) => {
            try {
                return convertFn(char);
            } catch {
                return char;
            }
        })
        .join('')
        .value();

function MoneyRequestAmount(props) {
    const {translate, toLocaleDigit, fromLocaleDigit, numberFormat} = useLocalize();
    const selectedAmountAsString = props.iou.amount ? CurrencyUtils.convertToWholeUnit(props.iou.currency, props.iou.amount).toString() : '';

    const prevMoneyRequestID = useRef(props.iou.id);
    const textInput = useRef(null);
    const iouType = useRef(lodashGet(props.route, 'params.iouType', ''));
    const reportID = useRef(lodashGet(props.route, 'params.reportID', ''));
    const isEditing = useRef(lodashGet(props.route, 'path', '').includes('amount'));

    const [amount, setAmount] = useState(selectedAmountAsString);
    const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(props.iou.currency || CONST.CURRENCY.USD);
    const [shouldUpdateSelection, setShouldUpdateSelection] = useState(true);
    const [selection, setSelection] = useState({start: selectedAmountAsString.length, end: selectedAmountAsString.length});

    /**
     * Event occurs when a user presses a mouse button over an DOM element.
     *
     * @param {Event} event
     * @param {Array<string>} nativeIds
     */
    const onMouseDown = (event, nativeIds) => {
        const relatedTargetId = lodashGet(event, 'nativeEvent.target.id');
        if (!_.contains(nativeIds, relatedTargetId)) {
            return;
        }
        event.preventDefault();
        if (!textInput.current.isFocused()) {
            textInput.current.focus();
        }
    };

    const title = {
        [CONST.IOU.MONEY_REQUEST_TYPE.REQUEST]: translate('iou.requestMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SEND]: translate('iou.sendMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SPLIT]: translate('iou.splitBill'),
    };
    const titleForStep = isEditing.current ? translate('iou.amount') : title[iouType.current];

    /**
     * Check and dismiss modal
     */
    useEffect(() => {
        if (!ReportUtils.shouldHideComposer(props.report, props.errors)) {
            return;
        }
        Navigation.dismissModal(reportID.current);
    }, [props.errors, props.report]);

    /**
     * Focus text input
     */
    const focusTextInput = () => {
        // Component may not initialized due to navigation transitions
        // Wait until interactions are complete before trying to focus
        InteractionManager.runAfterInteractions(() => {
            // Focus text input
            if (!textInput.current) {
                return;
            }

            textInput.current.focus();
        });
    };

    /**
     * Convert amount to whole unit and update selection
     *
     * @param {String} currencyCode
     * @param {Number} amountInCurrencyUnits
     */
    const saveAmountToState = (currencyCode, amountInCurrencyUnits) => {
        if (!currencyCode || !amountInCurrencyUnits) {
            return;
        }
        const amountAsStringForState = CurrencyUtils.convertToWholeUnit(currencyCode, amountInCurrencyUnits).toString();
        setAmount(amountAsStringForState);
        setSelection({
            start: amountAsStringForState.length,
            end: amountAsStringForState.length,
        });
    };

    useEffect(() => {
        if (isEditing.current) {
            if (prevMoneyRequestID.current !== props.iou.id) {
                // The ID is cleared on completing a request. In that case, we will do nothing.
                if (props.iou.id) {
                    Navigation.goBack(ROUTES.getMoneyRequestRoute(iouType.current, reportID.current), true);
                }
                return;
            }
            const moneyRequestID = `${iouType.current}${reportID.current}`;
            const shouldReset = props.iou.id !== moneyRequestID;
            if (shouldReset) {
                IOU.resetMoneyRequestInfo(moneyRequestID);
            }

            if (_.isEmpty(props.iou.participants) || props.iou.amount === 0 || shouldReset) {
                Navigation.goBack(ROUTES.getMoneyRequestRoute(iouType.current, reportID.current), true);
            }
        }

        return () => {
            prevMoneyRequestID.current = props.iou.id;
        };
    }, [props.iou.participants, props.iou.amount, props.iou.id]);

    useEffect(() => {
        if (props.route.params.currency) {
            setSelectedCurrencyCode(props.route.params.currency);
            return;
        }
        if (props.iou.currency) {
            setSelectedCurrencyCode(props.iou.currency);
        }
    }, [props.route.params.currency, props.iou.currency]);

    useEffect(() => {
        saveAmountToState(props.iou.currency, props.iou.amount);
    }, [props.iou.amount, props.iou.currency]);

    useFocusEffect(
        useCallback(() => {
            focusTextInput();
        }, []),
    );

    /**
     * Sets the state according to amount that is passed
     * @param {String} newAmount - Changed amount from user input
     */
    const setNewAmount = (newAmount) => {
        // Remove spaces from the newAmount value because Safari on iOS adds spaces when pasting a copied value
        // More info: https://github.com/Expensify/App/issues/16974
        const newAmountWithoutSpaces = stripSpacesFromAmount(newAmount);
        // Use a shallow copy of selection to trigger setSelection
        // More info: https://github.com/Expensify/App/issues/16385
        if (!validateAmount(newAmountWithoutSpaces)) {
            setAmount((prevAmount) => prevAmount);
            setSelection((prevSelection) => ({...prevSelection}));
            return;
        }
        setAmount((prevAmount) => {
            setSelection((prevSelection) => getNewSelection(prevSelection, prevAmount.length, newAmountWithoutSpaces.length));
            return stripCommaFromAmount(newAmountWithoutSpaces);
        });
    };

    /**
     * Update amount with number or Backspace pressed for BigNumberPad.
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit to enable Next button
     *
     * @param {String} key
     */
    const updateAmountNumberPad = useCallback(
        (key) => {
            if (shouldUpdateSelection && !textInput.current.isFocused()) {
                textInput.current.focus();
            }
            // Backspace button is pressed
            if (key === '<' || key === 'Backspace') {
                if (amount.length > 0) {
                    const selectionStart = selection.start === selection.end ? selection.start - 1 : selection.start;
                    const newAmount = `${amount.substring(0, selectionStart)}${amount.substring(selection.end)}`;
                    setNewAmount(newAmount);
                }
                return;
            }
            const newAmount = addLeadingZero(`${amount.substring(0, selection.start)}${key}${amount.substring(selection.end)}`);
            setNewAmount(newAmount);
        },
        [amount, selection, shouldUpdateSelection],
    );

    /**
     * Update long press value, to remove items pressing on <
     *
     * @param {Boolean} value - Changed text from user input
     */
    const updateLongPressHandlerState = useCallback((value) => {
        setShouldUpdateSelection(!value);
        if (!value && !textInput.current.isFocused()) {
            textInput.current.focus();
        }
    }, []);

    /**
     * Update amount on amount change
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit
     *
     * @param {String} text - Changed text from user input
     */
    const updateAmount = (text) => {
        const newAmount = addLeadingZero(replaceAllDigits(text, fromLocaleDigit));
        setNewAmount(newAmount);
    };

    const navigateBack = () => {
        Navigation.goBack(isEditing.current ? ROUTES.getMoneyRequestConfirmationRoute(iouType.current, reportID.current) : null);
    };

    const navigateToCurrencySelectionPage = () => {
        // Remove query from the route and encode it.
        const activeRoute = encodeURIComponent(Navigation.getActiveRoute().replace(/\?.*/, ''));
        Navigation.navigate(ROUTES.getMoneyRequestCurrencyRoute(iouType.current, reportID.current, selectedCurrencyCode, activeRoute));
    };

    const navigateToNextPage = () => {
        const amountInSmallestCurrencyUnits = CurrencyUtils.convertToSmallestUnit(selectedCurrencyCode, Number.parseFloat(amount));
        IOU.setMoneyRequestAmount(amountInSmallestCurrencyUnits);
        IOU.setMoneyRequestCurrency(selectedCurrencyCode);

        saveAmountToState(selectedCurrencyCode, amountInSmallestCurrencyUnits);

        if (isEditing.current) {
            Navigation.goBack(ROUTES.getMoneyRequestConfirmationRoute(iouType.current, reportID.current));
            return;
        }

        const moneyRequestID = `${iouType.current}${reportID.current}`;
        const shouldReset = props.iou.id !== moneyRequestID;
        // If the money request ID in Onyx does not match the ID from params, we want to start a new request
        // with the ID from params. We need to clear the participants in case the new request is initiated from FAB.
        if (shouldReset) {
            IOU.setMoneyRequestId(moneyRequestID);
            IOU.setMoneyRequestDescription('');
            IOU.setMoneyRequestParticipants([]);
        }

        // If a request is initiated on a report, skip the participants selection step and navigate to the confirmation page.
        if (props.report.reportID) {
            // Reinitialize the participants when the money request ID in Onyx does not match the ID from params
            if (_.isEmpty(props.iou.participants) || shouldReset) {
                const currentUserAccountID = props.currentUserPersonalDetails.accountID;
                const participants = ReportUtils.isPolicyExpenseChat(props.report)
                    ? [{reportID: props.report.reportID, isPolicyExpenseChat: true, selected: true}]
                    : _.chain(props.report.participantAccountIDs)
                          .filter((accountID) => currentUserAccountID !== accountID)
                          .map((accountID) => ({accountID, selected: true}))
                          .value();
                IOU.setMoneyRequestParticipants(participants);
            }
            Navigation.navigate(ROUTES.getMoneyRequestConfirmationRoute(iouType.current, reportID.current));
            return;
        }
        Navigation.navigate(ROUTES.getMoneyRequestParticipantsRoute(iouType.current));
    };

    const formattedAmount = replaceAllDigits(amount, toLocaleDigit);
    const buttonText = isEditing.current ? translate('common.save') : translate('common.next');

    return (
        <FullPageNotFoundView shouldShow={!IOUUtils.isValidMoneyRequestType(iouType.current)}>
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                onEntryTransitionEnd={focusTextInput}
            >
                {({safeAreaPaddingBottomStyle}) => (
                    <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                        {isEditing.current && (
                            <HeaderWithBackButton
                                title={titleForStep}
                                onBackButtonPress={navigateBack}
                            />
                        )}
                        <View
                            nativeID={amountViewID}
                            onMouseDown={(event) => onMouseDown(event, [amountViewID])}
                            style={[styles.flex1, styles.flexRow, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}
                        >
                            <TextInputWithCurrencySymbol
                                formattedAmount={formattedAmount}
                                onChangeAmount={updateAmount}
                                onCurrencyButtonPress={navigateToCurrencySelectionPage}
                                placeholder={numberFormat(0)}
                                ref={(el) => (textInput.current = el)}
                                selectedCurrencyCode={selectedCurrencyCode}
                                selection={selection}
                                onSelectionChange={(e) => {
                                    if (!shouldUpdateSelection) {
                                        return;
                                    }
                                    setSelection(e.nativeEvent.selection);
                                }}
                            />
                        </View>
                        <View
                            onMouseDown={(event) => onMouseDown(event, [numPadContainerViewID, numPadViewID])}
                            style={[styles.w100, styles.justifyContentEnd, styles.pageWrapper]}
                            nativeID={numPadContainerViewID}
                        >
                            {DeviceCapabilities.canUseTouchScreen() ? (
                                <BigNumberPad
                                    nativeID={numPadViewID}
                                    numberPressed={updateAmountNumberPad}
                                    longPressHandlerStateChanged={updateLongPressHandlerState}
                                />
                            ) : (
                                <View />
                            )}

                            <Button
                                success
                                style={[styles.w100, styles.mt5]}
                                onPress={navigateToNextPage}
                                pressOnEnter
                                isDisabled={!amount.length || parseFloat(amount) < 0.01}
                                text={buttonText}
                            />
                        </View>
                    </View>
                )}
            </ScreenWrapper>
        </FullPageNotFoundView>
    );
}

MoneyRequestAmount.propTypes = propTypes;
MoneyRequestAmount.defaultProps = defaultProps;
MoneyRequestAmount.displayName = 'MoneyRequestAmount';

export default compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        iou: {key: ONYXKEYS.IOU},
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '')}`,
        },
    }),
)(MoneyRequestAmount);
