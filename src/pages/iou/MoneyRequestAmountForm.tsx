import type {ForwardedRef} from 'react';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import MoneyRequestAmountInput from '@components/MoneyRequestAmountInput';
import type {MoneyRequestAmountInputProps} from '@components/MoneyRequestAmountInput';
import type {NumberWithSymbolFormRef} from '@components/NumberWithSymbolForm';
import ScrollView from '@components/ScrollView';
import SettlementButton from '@components/SettlementButton';
import useLocalize from '@hooks/useLocalize';
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

    /** The chatReportID of the request */
    chatReportID?: string;
};

const isAmountInvalid = (amount: string) => !amount.length || parseFloat(amount) < 0.01;
const isTaxAmountInvalid = (currentAmount: string, taxAmount: number, isTaxAmountForm: boolean, currency: string) =>
    isTaxAmountForm && Number.parseFloat(currentAmount) > convertToFrontendAmountAsInteger(Math.abs(taxAmount), currency);

function MoneyRequestAmountForm(
    {
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
        decimals,
        hideCurrencySymbol = false,
    }: MoneyRequestAmountFormProps,
    forwardedRef: ForwardedRef<BaseTextInputRef>,
) {
    const styles = useThemeStyles();
    const {isExtraSmallScreenHeight} = useResponsiveLayout();
    const {translate} = useLocalize();

    const textInput = useRef<BaseTextInputRef | null>(null);
    const moneyRequestAmountInputRef = useRef<NumberWithSymbolFormRef | null>(null);

    const [formError, setFormError] = useState<string>('');

    const formattedTaxAmount = convertToDisplayString(Math.abs(taxAmount), currency);

    const initializeAmount = useCallback(
        (newAmount: number) => {
            const frontendAmount = newAmount ? convertToFrontendAmountAsString(newAmount, currency) : '';
            moneyRequestAmountInputRef.current?.updateAmount(frontendAmount);
        },
        [currency],
    );

    useEffect(() => {
        if (!currency || typeof amount !== 'number') {
            return;
        }
        initializeAmount(amount);
        // we want to re-initialize the state only when the selected tab
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [selectedTab]);

    /**
     * Submit amount and navigate to a proper page
     */
    const submitAndNavigateToNextPage = useCallback(
        (iouPaymentType?: PaymentMethodType | undefined) => {
            const isTaxAmountForm = Navigation.getActiveRoute().includes('taxAmount');

            // Skip the check for tax amount form as 0 is a valid input
            const currentAmount = moneyRequestAmountInputRef.current?.getAmount() ?? '';
            if (!currentAmount.length || (!isTaxAmountForm && isAmountInvalid(currentAmount))) {
                setFormError(translate('iou.error.invalidAmount'));
                return;
            }

            if (isTaxAmountInvalid(currentAmount, taxAmount, isTaxAmountForm, currency)) {
                setFormError(translate('iou.error.invalidTaxAmount', {amount: formattedTaxAmount}));
                return;
            }

            onSubmitButtonPress({amount: currentAmount, currency, paymentMethod: iouPaymentType});
        },
        [taxAmount, onSubmitButtonPress, currency, translate, formattedTaxAmount],
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
                        enablePaymentsRoute={ROUTES.IOU_SEND_ENABLE_PAYMENTS}
                        addDebitCardRoute={ROUTES.IOU_SEND_ADD_DEBIT_CARD}
                        currency={currency ?? CONST.CURRENCY.USD}
                        policyID={policyID}
                        style={[styles.w100, canUseTouchScreen ? styles.mt5 : styles.mt3]}
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
                        style={[styles.w100, canUseTouchScreen ? styles.mt5 : styles.mt3]}
                        onPress={() => submitAndNavigateToNextPage()}
                        text={buttonText}
                        testID="next-button"
                    />
                )}
            </View>
        ),
        [
            styles.w100,
            styles.mt5,
            styles.mt3,
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
                decimals={decimals}
                isCurrencyPressable={isCurrencyPressable}
                onCurrencyButtonPress={onCurrencyButtonPress}
                onAmountChange={() => {
                    if (!formError) {
                        return;
                    }
                    setFormError('');
                }}
                ref={(ref) => {
                    if (typeof forwardedRef === 'function') {
                        forwardedRef(ref);
                    } else if (forwardedRef?.current) {
                        // eslint-disable-next-line no-param-reassign
                        forwardedRef.current = ref;
                    }
                    textInput.current = ref;
                }}
                moneyRequestAmountInputRef={moneyRequestAmountInputRef}
                shouldKeepUserInput={shouldKeepUserInput}
                inputStyle={[styles.iouAmountTextInput]}
                containerStyle={[styles.iouAmountTextInputContainer]}
                testID="moneyRequestAmountInput"
                errorText={formError}
                shouldShowBigNumberPad
                footer={footer}
            />
        </ScrollView>
    );
}

MoneyRequestAmountForm.displayName = 'MoneyRequestAmountForm';

export default React.forwardRef(MoneyRequestAmountForm);
export type {CurrentMoney, MoneyRequestAmountFormProps};
