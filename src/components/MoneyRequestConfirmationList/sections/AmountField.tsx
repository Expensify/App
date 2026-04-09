import React, {useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setMoneyRequestAmount} from '@libs/actions/IOU';
import {convertToBackendAmount, convertToDisplayString, convertToFrontendAmountAsString, getLocalizedCurrencySymbol} from '@libs/CurrencyUtils';
import {calculateAmount} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {shouldEnableNegative} from '@libs/ReportUtils';
import {isAmountMissing} from '@libs/TransactionUtils';
import IOURequestStepCurrencyModal from '@pages/iou/request/step/IOURequestStepCurrencyModal';
import {resetSplitShares, setDraftSplitTransaction} from '@userActions/IOU/Split';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import MenuItemWithTopDescription from '../../MenuItemWithTopDescription';
import NumberWithSymbolForm from '../../NumberWithSymbolForm';

type AmountFieldProps = {
    action: IOUAction;
    amount: number;
    formattedAmount: string;
    currency: string;
    distanceRateCurrency: string;
    iouCurrencyCode: string | undefined;
    isDistanceRequest: boolean;
    isNewManualExpenseFlowEnabled: boolean;
    isAmountFieldDisabled: boolean;
    shouldShowAmountRequiredError: boolean;
    didConfirm: boolean;
    isReadOnly: boolean;
    shouldShowTimeRequestFields: boolean;
    shouldDisplayFieldError: boolean;
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    transactionID: string | undefined;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    reportActionID: string | undefined;
    isEditingSplitBill: boolean;
    policy: OnyxEntry<OnyxTypes.Policy>;
};

function AmountField({
    action,
    amount,
    formattedAmount,
    currency,
    distanceRateCurrency,
    iouCurrencyCode,
    isDistanceRequest,
    isNewManualExpenseFlowEnabled,
    isAmountFieldDisabled,
    shouldShowAmountRequiredError,
    didConfirm,
    isReadOnly,
    shouldShowTimeRequestFields,
    shouldDisplayFieldError,
    transaction,
    transactionID,
    iouType,
    reportID,
    reportActionID,
    isEditingSplitBill,
    policy,
}: AmountFieldProps) {
    const styles = useThemeStyles();
    const {translate, preferredLocale} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.accountID});

    const [isCurrencyPickerVisible, setIsCurrencyPickerVisible] = useState(false);

    const effectiveCurrency = isDistanceRequest ? distanceRateCurrency : (iouCurrencyCode ?? CONST.CURRENCY.USD);
    const decimals = getCurrencyDecimals(effectiveCurrency);
    const transactionAmount = convertToFrontendAmountAsString(amount, decimals);
    const allowNegative = shouldEnableNegative(report, policy, iouType, transaction?.participants);

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

    const buildAndSaveSplitShares = (updatedAmount: number, updatedCurrency: string) => {
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
    };

    const updateCurrency = (value: string) => {
        hideCurrencyPicker();

        if (!transactionID) {
            return;
        }

        const parsedAmount = getBackendAmountFromInput(transactionAmount);
        const updatedAmount = parsedAmount ?? amount;

        if (isEditingSplitBill) {
            buildAndSaveSplitShares(updatedAmount, value);
            return;
        }

        setMoneyRequestAmount(transactionID, updatedAmount, value);
    };

    const handleAmountChange = (newAmount: string) => {
        if (!transactionID) {
            return;
        }

        const parsedAmount = getBackendAmountFromInput(newAmount);
        if (parsedAmount === null) {
            return;
        }
        if (transaction?.splitShares) {
            resetSplitShares(transaction, parsedAmount);
        }

        if (isEditingSplitBill) {
            buildAndSaveSplitShares(parsedAmount, effectiveCurrency);
            return;
        }

        setMoneyRequestAmount(transactionID, parsedAmount, effectiveCurrency);
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
                        displayAsTextInput
                        value={transactionAmount}
                        decimals={decimals}
                        currency={effectiveCurrency}
                        symbol={getLocalizedCurrencySymbol(preferredLocale, effectiveCurrency) ?? ''}
                        label={translate('iou.amount')}
                        errorText={shouldShowAmountRequiredError ? translate('common.error.fieldRequired') : ''}
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
                    key={translate('iou.amount')}
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
