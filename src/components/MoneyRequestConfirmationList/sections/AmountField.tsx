import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearMoneyRequestAmount, setMoneyRequestAmount} from '@libs/actions/IOU';
import {convertToBackendAmount, convertToFrontendAmountAsString, getLocalizedCurrencySymbol} from '@libs/CurrencyUtils';
import {calculateAmount} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {shouldEnableNegative} from '@libs/ReportUtils';
import {isAmountMissing} from '@libs/TransactionUtils';
import {isParticipantP2P} from '@pages/iou/request/step/IOURequestStepAmount';
import IOURequestStepCurrencyModal from '@pages/iou/request/step/IOURequestStepCurrencyModal';
import {getMoneyRequestParticipantsFromReport} from '@userActions/IOU';
import {resetSplitShares, setDraftSplitTransaction, setSplitShares} from '@userActions/IOU/Split';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type AmountFieldProps = {
    action: IOUAction;
    amount: number;
    formattedAmount: string;
    distanceRateCurrency: string;
    iouCurrencyCode: string | undefined;
    isDistanceRequest: boolean;
    isNewManualExpenseFlowEnabled: boolean;
    didConfirm: boolean;
    isReadOnly: boolean;
    shouldShowTimeRequestFields: boolean;
    shouldDisplayFieldError: boolean;
    formError: string;
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    transactionID: string | undefined;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    reportActionID: string | undefined;
    isEditingSplitBill: boolean;
    policy: OnyxEntry<OnyxTypes.Policy>;
    clearFormErrors: (errors: string[]) => void;
    setFormError: (error: TranslationPaths | '') => void;
    autoFocus?: boolean;
};

function AmountField({
    action,
    amount,
    formattedAmount,
    distanceRateCurrency,
    iouCurrencyCode,
    isDistanceRequest,
    isNewManualExpenseFlowEnabled,
    didConfirm,
    isReadOnly,
    shouldShowTimeRequestFields,
    shouldDisplayFieldError,
    formError,
    transaction,
    transactionID,
    iouType,
    reportID,
    reportActionID,
    isEditingSplitBill,
    policy,
    clearFormErrors,
    setFormError,
    autoFocus = false,
}: AmountFieldProps) {
    const styles = useThemeStyles();
    const {translate, preferredLocale} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.accountID});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const amountInputRef = useRef<BaseTextInputRef | null>(null);
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();

    const [isCurrencyPickerVisible, setIsCurrencyPickerVisible] = useState(false);

    const isAmountFieldDisabled = didConfirm || isReadOnly || shouldShowTimeRequestFields || isDistanceRequest;
    const firstParticipant = transaction?.participants?.at(0);
    const isP2P = isNewManualExpenseFlowEnabled
        ? isParticipantP2P(getMoneyRequestParticipantsFromReport(report, currentUserPersonalDetails.accountID).at(0))
        : !!(firstParticipant?.accountID && !firstParticipant?.isPolicyExpenseChat);
    const shouldShowAmountRequiredError = formError === 'common.error.fieldRequired';
    const shouldShowAmountInvalidError = formError === 'common.error.invalidAmount';

    let amountFieldErrorText = '';
    if (shouldShowAmountInvalidError) {
        amountFieldErrorText = translate('common.error.invalidAmount');
    } else if (shouldShowAmountRequiredError) {
        amountFieldErrorText = translate('common.error.fieldRequired');
    }

    const effectiveCurrency = isDistanceRequest ? distanceRateCurrency : (iouCurrencyCode ?? CONST.CURRENCY.USD);
    const decimals = getCurrencyDecimals(effectiveCurrency);
    // In the new manual expense flow the amount field starts empty (transaction.amount defaults to 0 before the user
    // touches it). Once the user explicitly sets an amount – including 0 – isAmountSet becomes true and we show the
    // real value. This avoids showing "$0.00" as a pre-filled default.
    const transactionAmount = isNewManualExpenseFlowEnabled && !transaction?.isAmountSet ? '' : convertToFrontendAmountAsString(amount, decimals);
    const allowNegative = shouldEnableNegative(report, policy, iouType, transaction?.participants);

    // `autoFocus` on our TextInput only runs on mount. Closing and reopening the RHP often keeps the same mounted
    // instance, so autofocus does not run again. After `ScreenWrapper` finishes its entry transition the field is
    // reliably focusable.
    useEffect(() => {
        if (!didScreenTransitionEnd || !autoFocus || isAmountFieldDisabled || !isNewManualExpenseFlowEnabled) {
            return;
        }

        amountInputRef.current?.focus();
    }, [didScreenTransitionEnd, autoFocus, isAmountFieldDisabled, isNewManualExpenseFlowEnabled]);

    const showCurrencyPicker = () => {
        setIsCurrencyPickerVisible(true);
    };

    const hideCurrencyPicker = () => {
        setIsCurrencyPickerVisible(false);
    };

    const getBackendAmountFromInput = (value: string) => {
        const isNegative = value.startsWith('-');
        const cleanAmount = value.replace('-', '');

        if (!cleanAmount || cleanAmount.trim() === '') {
            return null;
        }

        const numericAmount = Number.parseFloat(cleanAmount);
        if (Number.isNaN(numericAmount)) {
            return null;
        }

        const absoluteBackendAmount = convertToBackendAmount(numericAmount);
        return isNegative ? -absoluteBackendAmount : absoluteBackendAmount;
    };

    /**
     * When the bill total or currency changes:
     * - Editing an existing split bill: recompute shares on the split draft (`SPLIT_TRANSACTION_DRAFT`).
     * - Creating a split (`iouType` split): `setSplitShares` on the transaction draft (or seed from `participants` if shares are missing).
     * - Any other draft that already has `splitShares`: `resetSplitShares` so shares stay proportional to the new total.
     */
    const buildAndSaveSplitShares = (updatedAmount: number, updatedCurrency: string) => {
        if (isEditingSplitBill) {
            if (!transactionID) {
                return;
            }
            const splitShares = splitDraftTransaction?.splitShares ?? transaction?.splitShares;
            const accountID = currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID;
            const newAccountIDs = Object.keys(splitShares ?? {}).map((key) => Number(key));
            const oldAccountIDs = Object.keys(transaction?.splitShares ?? {}).map((key) => Number(key));
            const accountIDs = [...new Set<number>([accountID, ...newAccountIDs, ...oldAccountIDs])];

            const participantsLength = newAccountIDs.includes(accountID) ? newAccountIDs.length - 1 : newAccountIDs.length;

            const updatedSplitShares = accountIDs.reduce<NonNullable<OnyxTypes.Transaction['splitShares']>>((acc, splitShareAccountID) => {
                if (!newAccountIDs.includes(splitShareAccountID) && splitShareAccountID !== accountID) {
                    acc[splitShareAccountID] = null;
                    return acc;
                }

                const isPayer = splitShareAccountID === accountID;
                acc[splitShareAccountID] = {
                    amount: calculateAmount(participantsLength, updatedAmount, updatedCurrency, isPayer),
                    isModified: false,
                };
                return acc;
            }, {});

            setDraftSplitTransaction(transactionID, splitDraftTransaction, {
                amount: updatedAmount,
                currency: updatedCurrency,
                ...(accountIDs.length > 0 ? {splitShares: updatedSplitShares} : {}),
            });
            return;
        }

        if (iouType === CONST.IOU.TYPE.SPLIT && transaction) {
            const shareAccountIDs = Object.keys(transaction.splitShares ?? {}).map(Number);
            const participantAccountIDs =
                shareAccountIDs.length > 0 ? shareAccountIDs : (transaction.participants ?? []).map((p) => p.accountID).filter((id): id is number => id !== undefined);
            if (participantAccountIDs.length > 0) {
                setSplitShares(transaction, updatedAmount, updatedCurrency, participantAccountIDs);
            }
            return;
        }

        if (transaction?.splitShares) {
            resetSplitShares(transaction, updatedAmount, updatedCurrency);
        }
    };

    /** Writes `amount` / `currency` to the main transaction draft unless we only touched the split-bill draft above. */
    const persistMainDraftTotal = (backendAmount: number, currency: string) => {
        if (isEditingSplitBill || !transactionID) {
            return;
        }
        setMoneyRequestAmount(transactionID, backendAmount, currency);
    };

    const updateCurrency = (value: string) => {
        hideCurrencyPicker();

        if (!transactionID) {
            return;
        }

        const parsedAmount = getBackendAmountFromInput(transactionAmount);
        const updatedAmount = parsedAmount ?? amount;

        buildAndSaveSplitShares(updatedAmount, value);
        persistMainDraftTotal(updatedAmount, value);
    };

    const handleAmountChange = (newAmount: string) => {
        if (!transactionID) {
            return;
        }

        const parsedAmount = getBackendAmountFromInput(newAmount);
        if (parsedAmount === null) {
            // User cleared the field — mark amount as unset so the field stays empty
            // and submission is blocked until a value is re-entered.
            clearMoneyRequestAmount(transactionID);
            return;
        }

        const isInlineAmountInvalid = parsedAmount === 0 && isP2P;

        if (isInlineAmountInvalid && shouldDisplayFieldError) {
            setFormError('common.error.invalidAmount');
        } else if (!isInlineAmountInvalid) {
            clearFormErrors(['common.error.invalidAmount', 'common.error.fieldRequired']);
        }

        buildAndSaveSplitShares(parsedAmount, effectiveCurrency);
        persistMainDraftTotal(parsedAmount, effectiveCurrency);
    };

    return (
        <>
            <IOURequestStepCurrencyModal
                isPickerVisible={isCurrencyPickerVisible}
                hidePickerModal={hideCurrencyPicker}
                headerText={translate('common.selectCurrency')}
                value={effectiveCurrency}
                onInputChange={updateCurrency}
            />
            {isNewManualExpenseFlowEnabled && !isAmountFieldDisabled ? (
                <View style={[styles.mh4, styles.mv2]}>
                    <NumberWithSymbolForm
                        ref={amountInputRef}
                        displayAsTextInput
                        autoFocus={autoFocus}
                        value={transactionAmount}
                        decimals={decimals}
                        currency={effectiveCurrency}
                        symbol={getLocalizedCurrencySymbol(preferredLocale, effectiveCurrency) ?? ''}
                        label={translate('iou.amount')}
                        errorText={amountFieldErrorText}
                        onInputChange={handleAmountChange}
                        allowNegativeInput={allowNegative}
                        shouldShowFlipButton
                        shouldShowCurrencyButton
                        shouldShowBigNumberPad={false}
                        onCurrencyButtonPress={showCurrencyPicker}
                        disabled={isAmountFieldDisabled}
                    />
                </View>
            ) : (
                <MenuItemWithTopDescription
                    shouldShowRightIcon={!isReadOnly && !isDistanceRequest && !shouldShowTimeRequestFields}
                    title={formattedAmount}
                    description={translate('iou.amount')}
                    interactive={!isReadOnly && !shouldShowTimeRequestFields}
                    onPress={() => {
                        if (isDistanceRequest || shouldShowTimeRequestFields || !transactionID) {
                            return;
                        }

                        Navigation.navigate(
                            ROUTES.MONEY_REQUEST_STEP_AMOUNT.getRoute(action, iouType, transactionID, reportID, reportActionID, CONST.IOU.PAGE_INDEX.CONFIRM, Navigation.getActiveRoute()),
                        );
                    }}
                    style={[styles.moneyRequestMenuItem, styles.mt2]}
                    titleStyle={styles.moneyRequestConfirmationAmount}
                    disabled={didConfirm}
                    brickRoadIndicator={shouldDisplayFieldError && isAmountMissing(transaction) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    errorText={shouldDisplayFieldError && isAmountMissing(transaction) ? translate('common.error.enterAmount') : ''}
                    sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.AMOUNT_FIELD}
                />
            )}
        </>
    );
}

export default AmountField;
