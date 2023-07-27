import React, {useEffect, useState, useRef, useCallback} from 'react';
import {View, InteractionManager} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import {useFocusEffect} from '@react-navigation/native';
import styles from '../../../styles/styles';
import BigNumberPad from '../../../components/BigNumberPad';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import * as ReportUtils from '../../../libs/ReportUtils';
import * as IOUUtils from '../../../libs/IOUUtils';
import * as CurrencyUtils from '../../../libs/CurrencyUtils';
import * as MoneyRequestUtils from '../../../libs/MoneyRequestUtils';
import Button from '../../../components/Button';
import CONST from '../../../CONST';
import * as DeviceCapabilities from '../../../libs/DeviceCapabilities';
import TextInputWithCurrencySymbol from '../../../components/TextInputWithCurrencySymbol';
import ScreenWrapper from '../../../components/ScreenWrapper';
import FullPageNotFoundView from '../../../components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import reportPropTypes from '../../reportPropTypes';
import * as IOU from '../../../libs/actions/IOU';
import useLocalize from '../../../hooks/useLocalize';
import {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../../../components/withCurrentUserPersonalDetails';

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

const amountViewID = 'amountView';
const numPadContainerViewID = 'numPadContainerView';
const numPadViewID = 'numPadView';

function MoneyRequestAmountForm({title, navigateBack, navigateToCurrencySelectionPage, navigateToNextPage, reportID, iouType, isEditing, ...props}) {
    const {translate, toLocaleDigit, fromLocaleDigit, numberFormat} = useLocalize();
    const selectedAmountAsString = props.iou.amount ? CurrencyUtils.convertToWholeUnit(props.iou.currency, props.iou.amount).toString() : '';

    const prevMoneyRequestID = useRef(props.iou.id);
    const textInput = useRef(null);

    const [amount, setAmount] = useState(selectedAmountAsString);
    const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(props.iou.currency);
    const [shouldUpdateSelection, setShouldUpdateSelection] = useState(true);
    const [selection, setSelection] = useState({
        start: selectedAmountAsString.length,
        end: selectedAmountAsString.length,
    });

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

    const titleForStep = isEditing ? translate('iou.amount') : title[iouType];

    /**
     * Check and dismiss modal
     */
    useEffect(() => {
        if (!ReportUtils.shouldHideComposer(props.report, props.errors)) {
            return;
        }
        Navigation.dismissModal(reportID);
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
        if (isEditing) {
            if (prevMoneyRequestID.current !== props.iou.id) {
                // The ID is cleared on completing a request. In that case, we will do nothing.
                if (props.iou.id) {
                    Navigation.goBack(ROUTES.getMoneyRequestRoute(iouType, reportID), true);
                }
                return;
            }
            const moneyRequestID = `${iouType}${reportID}`;
            const shouldReset = props.iou.id !== moneyRequestID;
            if (shouldReset) {
                IOU.resetMoneyRequestInfo(moneyRequestID);
            }

            if (_.isEmpty(props.iou.participants) || props.iou.amount === 0 || shouldReset) {
                Navigation.goBack(ROUTES.getMoneyRequestRoute(iouType, reportID), true);
            }
        }

        return () => {
            prevMoneyRequestID.current = props.iou.id;
        };
    }, [props.iou.participants, props.iou.amount, props.iou.id]);

    useEffect(() => {
        if (!props.route.params.currency) {
            return;
        }

        setSelectedCurrencyCode(props.route.params.currency);
    }, [props.route.params.currency]);

    useEffect(() => {
        setSelectedCurrencyCode(props.iou.currency);
    }, [props.iou.currency]);

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
        const newAmountWithoutSpaces = MoneyRequestUtils.stripSpacesFromAmount(newAmount);
        // Use a shallow copy of selection to trigger setSelection
        // More info: https://github.com/Expensify/App/issues/16385
        if (!MoneyRequestUtils.validateAmount(newAmountWithoutSpaces)) {
            setAmount((prevAmount) => prevAmount);
            setSelection((prevSelection) => ({...prevSelection}));
            return;
        }
        setAmount((prevAmount) => {
            setSelection((prevSelection) => MoneyRequestUtils.getNewSelection(prevSelection, prevAmount.length, newAmountWithoutSpaces.length));
            return MoneyRequestUtils.stripCommaFromAmount(newAmountWithoutSpaces);
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
            const newAmount = MoneyRequestUtils.addLeadingZero(`${amount.substring(0, selection.start)}${key}${amount.substring(selection.end)}`);
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
        const newAmount = MoneyRequestUtils.addLeadingZero(MoneyRequestUtils.replaceAllDigits(text, fromLocaleDigit));
        setNewAmount(newAmount);
    };

    const formattedAmount = MoneyRequestUtils.replaceAllDigits(amount, toLocaleDigit);
    const buttonText = isEditing ? translate('common.save') : translate('common.next');

    return (
        <FullPageNotFoundView shouldShow={!IOUUtils.isValidMoneyRequestType(iouType)}>
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                onEntryTransitionEnd={focusTextInput}
            >
                {({safeAreaPaddingBottomStyle}) => (
                    <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                        <HeaderWithBackButton
                            title={titleForStep}
                            onBackButtonPress={navigateBack}
                        />
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
                            ) : null}
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

MoneyRequestAmountForm.propTypes = propTypes;
MoneyRequestAmountForm.defaultProps = defaultProps;
MoneyRequestAmountForm.displayName = 'MoneyRequestAmountForm';

export default MoneyRequestAmountForm;
