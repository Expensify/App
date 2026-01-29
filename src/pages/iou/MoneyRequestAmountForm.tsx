import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import MoneyRequestAmountInput from '@components/MoneyRequestAmountInput';
import type {MoneyRequestAmountInputProps} from '@components/MoneyRequestAmountInput';
import type {NumberWithSymbolFormRef} from '@components/NumberWithSymbolForm';
import ScrollView from '@components/ScrollView';
import SettlementButton from '@components/SettlementButton';
import type {PaymentActionParams} from '@components/SettlementButton/types';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString, convertToFrontendAmountAsInteger, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import type {BaseTextInputRef} from '@src/components/TextInput/BaseTextInput/types';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {SelectedTabRequest} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

type CurrentMoney = {amount: string; currency: string; paymentMethod?: PaymentMethodType};

type MoneyRequestAmountFormProps = Omit<MoneyRequestAmountInputProps, 'shouldShowBigNumberPad'> & {
    /** Calculated tax amount based on selected tax rate */
    taxAmount?: number;

    /** Whether the amount is being edited or not */
    isEditing?: boolean;

    /** Whether the confirmation screen should be skipped */
    skipConfirmation?: boolean;

    /** Type of the IOU */
    iouType?: ValueOf<typeof CONST.IOU.TYPE>;

    /** The policyID of the request */
    policyID?: string;

    /** Fired when submit button pressed, saves the given amount and navigates to the next page */
    onSubmitButtonPress: (currentMoney: CurrentMoney) => void;

    /** The current tab we have navigated to in the expense modal. String that corresponds to the expense type. */
    selectedTab?: SelectedTabRequest;

    /** Whether the user input should be kept or not */
    shouldKeepUserInput?: boolean;

    /** Whether to allow flipping the amount */
    allowFlippingAmount?: boolean;

    /** The chatReportID of the request */
    chatReportID?: string;

    /** Whether this is a P2P (1:1) request */
    isP2P?: boolean;
};

const nonZeroExpenses = new Set<ValueOf<typeof CONST.IOU.TYPE>>([CONST.IOU.TYPE.PAY, CONST.IOU.TYPE.INVOICE, CONST.IOU.TYPE.SPLIT]);
const isAmountInvalid = (amount: string, iouType: ValueOf<typeof CONST.IOU.TYPE>, isP2P: boolean, isZeroAmountBetaEnabled: boolean) => {
    if (!isZeroAmountBetaEnabled) {
        return !amount.length || parseFloat(amount) < 0.01;
    }

    if (!amount.length || parseFloat(amount) < 0) {
        return true;
    }

    if ((iouType === CONST.IOU.TYPE.REQUEST || iouType === CONST.IOU.TYPE.SUBMIT) && parseFloat(amount) < 0.01 && isP2P) {
        return true;
    }

    if (parseFloat(amount) < 0.01 && nonZeroExpenses.has(iouType)) {
        return true;
    }

    return false;
};
const isTaxAmountInvalid = (currentAmount: string, taxAmount: number, isTaxAmountForm: boolean, currency: string) =>
    isTaxAmountForm && Number.parseFloat(currentAmount) > convertToFrontendAmountAsInteger(Math.abs(taxAmount), currency);

/**
 * Wrapper around MoneyRequestAmountInput with money request flow-specific logics.
 */
function MoneyRequestAmountForm({
    amount = 0,
    taxAmount = 0,
    currency = CONST.CURRENCY.USD,
    isCurrencyPressable = true,
    isEditing = false,
    skipConfirmation = false,
    iouType = CONST.IOU.TYPE.SUBMIT,
    policyID = '',
    onCurrencyButtonPress,
    onSubmitButtonPress,
    selectedTab = CONST.TAB_REQUEST.MANUAL,
    shouldKeepUserInput = false,
    chatReportID,
    hideCurrencySymbol = false,
    allowFlippingAmount = false,
    isP2P = false,
    ref,
}: MoneyRequestAmountFormProps) {
    const styles = useThemeStyles();
    const {isExtraSmallScreenHeight} = useResponsiveLayout();
    const {translate} = useLocalize();

    const textInput = useRef<BaseTextInputRef | null>(null);
    const moneyRequestAmountInputRef = useRef<NumberWithSymbolFormRef | null>(null);

    const [isNegative, setIsNegative] = useState(false);

    const {isBetaEnabled} = usePermissions();

    const [formError, setFormError] = useState<string>('');

    const formattedTaxAmount = convertToDisplayString(Math.abs(taxAmount), currency);

    const absoluteAmount = Math.abs(amount);

    const initializeAmount = useCallback(
        (newAmount: number) => {
            const frontendAmount = newAmount ? convertToFrontendAmountAsString(newAmount, currency) : '';
            moneyRequestAmountInputRef.current?.updateNumber(frontendAmount);
        },
        [currency],
    );

    const toggleNegative = useCallback(() => {
        setIsNegative(!isNegative);
    }, [isNegative]);

    const clearNegative = useCallback(() => {
        setIsNegative(false);
    }, []);

    const initializeIsNegative = useCallback((currentAmount: number) => {
        if (currentAmount >= 0) {
            setIsNegative(false);
            return;
        }
        setIsNegative(true);
    }, []);

    useEffect(() => {
        initializeIsNegative(amount);
    }, [amount, initializeIsNegative]);

    useEffect(() => {
        if (!currency || typeof absoluteAmount !== 'number') {
            return;
        }

        initializeAmount(absoluteAmount);
        initializeIsNegative(amount);

        // we want to re-initialize the state only when the selected tab
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTab]);

    /**
     * Submit amount and navigate to a proper page
     */
    const submitAndNavigateToNextPage = useCallback(
        ({paymentType}: PaymentActionParams) => {
            const isTaxAmountForm = Navigation.getActiveRouteWithoutParams().includes('taxAmount');

            // Skip the check for tax amount form as 0 is a valid input
            const currentAmount = moneyRequestAmountInputRef.current?.getNumber() ?? '';
            if (!currentAmount.length || (!isTaxAmountForm && isAmountInvalid(currentAmount, iouType, isP2P, isBetaEnabled(CONST.BETAS.ZERO_EXPENSES)))) {
                setFormError(translate('iou.error.invalidAmount'));
                return;
            }

            if (isTaxAmountInvalid(currentAmount, taxAmount, isTaxAmountForm, currency)) {
                setFormError(translate('iou.error.invalidTaxAmount', {amount: formattedTaxAmount}));
                return;
            }

            const newAmount = isNegative ? `-${currentAmount}` : currentAmount;

            onSubmitButtonPress({amount: newAmount, currency, paymentMethod: paymentType});
        },
        [taxAmount, currency, isNegative, onSubmitButtonPress, translate, formattedTaxAmount, iouType, isP2P, isBetaEnabled],
    );

    const buttonText: string = useMemo(() => {
        if (skipConfirmation) {
            if (iouType === CONST.IOU.TYPE.SPLIT) {
                return translate('iou.splitExpense');
            }
            return translate('iou.createExpense');
        }
        return isEditing ? translate('common.save') : translate('common.next');
    }, [skipConfirmation, iouType, isEditing, translate]);

    const canUseTouchScreen = canUseTouchScreenUtil();

    useEffect(() => {
        setFormError('');
    }, [selectedTab]);

    const footer = useMemo(
        () => (
            <View style={styles.w100}>
                {iouType === CONST.IOU.TYPE.PAY && skipConfirmation ? (
                    <SettlementButton
                        pressOnEnter
                        onPress={submitAndNavigateToNextPage}
                        enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                        addDebitCardRoute={ROUTES.IOU_SEND_ADD_DEBIT_CARD}
                        currency={currency ?? CONST.CURRENCY.USD}
                        policyID={policyID}
                        style={[styles.w100, canUseTouchScreen ? styles.mt5 : styles.mt0]}
                        buttonSize={CONST.DROPDOWN_BUTTON_SIZE.LARGE}
                        kycWallAnchorAlignment={{
                            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                        }}
                        paymentMethodDropdownAnchorAlignment={{
                            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                        }}
                        shouldShowPersonalBankAccountOption
                        enterKeyEventListenerPriority={1}
                        chatReportID={chatReportID}
                    />
                ) : (
                    <Button
                        success
                        // Prevent bubbling on edit amount Page to prevent double page submission when two CTA are stacked.
                        allowBubble={!isEditing}
                        pressOnEnter
                        medium={isExtraSmallScreenHeight}
                        large={!isExtraSmallScreenHeight}
                        style={[styles.w100, canUseTouchScreen ? styles.mt5 : styles.mt0]}
                        onPress={() => submitAndNavigateToNextPage({})}
                        text={buttonText}
                        testID="next-button"
                    />
                )}
            </View>
        ),
        [
            styles.w100,
            styles.mt5,
            styles.mt0,
            iouType,
            skipConfirmation,
            submitAndNavigateToNextPage,
            currency,
            policyID,
            canUseTouchScreen,
            chatReportID,
            isEditing,
            isExtraSmallScreenHeight,
            buttonText,
        ],
    );

    return (
        <ScrollView contentContainerStyle={styles.flexGrow1}>
            <MoneyRequestAmountInput
                amount={amount}
                autoGrowExtraSpace={variables.w80}
                hideCurrencySymbol={hideCurrencySymbol}
                currency={currency}
                isCurrencyPressable={isCurrencyPressable}
                onCurrencyButtonPress={onCurrencyButtonPress}
                onAmountChange={() => {
                    if (!formError) {
                        return;
                    }
                    setFormError('');
                }}
                shouldShowBigNumberPad={canUseTouchScreen}
                ref={(newRef) => {
                    if (typeof ref === 'function') {
                        ref(newRef);
                    } else if (ref && 'current' in ref) {
                        // eslint-disable-next-line no-param-reassign
                        ref.current = newRef;
                    }
                    textInput.current = newRef;
                }}
                moneyRequestAmountInputRef={moneyRequestAmountInputRef}
                shouldKeepUserInput={shouldKeepUserInput}
                inputStyle={styles.iouAmountTextInput}
                containerStyle={styles.iouAmountTextInputContainer}
                touchableInputWrapperStyle={styles.heightUndefined}
                testID="moneyRequestAmountInput"
                isNegative={isNegative}
                allowFlippingAmount={allowFlippingAmount}
                toggleNegative={toggleNegative}
                clearNegative={clearNegative}
                errorText={formError}
                footer={footer}
            />
        </ScrollView>
    );
}

export default MoneyRequestAmountForm;
export type {CurrentMoney, MoneyRequestAmountFormProps};
