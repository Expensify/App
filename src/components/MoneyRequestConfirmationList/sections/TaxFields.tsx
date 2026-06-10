import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import type {NumberWithSymbolFormRef} from '@components/NumberWithSymbolForm';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setMoneyRequestTaxAmount} from '@libs/actions/IOU/MoneyRequest';
import {convertToBackendAmount, convertToFrontendAmountAsString, getLocalizedCurrencySymbol} from '@libs/CurrencyUtils';
import {isMovingTransactionFromTrackExpense} from '@libs/IOUUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getCalculatedTaxAmount, getTaxAmount, getTaxRateTitle} from '@libs/TransactionUtils';
import {setDraftSplitTransaction} from '@userActions/IOU/Split';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import {taxSliceSelector} from './selectors';
import useTransactionSelector from './useTransactionSelector';

type TaxFieldsProps = {
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyForMovingExpenses: OnyxEntry<OnyxTypes.Policy>;
    iouCurrencyCode: string | undefined;
    canModifyTaxFields: boolean;
    didConfirm: boolean;
    transactionID: string | undefined;
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    formError: string;
    clearFormErrors: (errors: string[]) => void;
};

function TaxFields({policy, policyForMovingExpenses, iouCurrencyCode, canModifyTaxFields, didConfirm, transactionID, action, iouType, reportID, formError, clearFormErrors}: TaxFieldsProps) {
    const styles = useThemeStyles();
    const {translate, preferredLocale} = useLocalize();
    const {convertToDisplayString, getCurrencyDecimals} = useCurrencyListActions();
    const {isNewManualExpenseFlowEnabled, isEditingSplitBill} = useConfirmationFields();
    const numberFormRef = useRef<NumberWithSymbolFormRef | null>(null);

    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);

    const taxSlice = useTransactionSelector(transactionID, taxSliceSelector);

    const transactionForHelpers = taxSlice as OnyxEntry<OnyxTypes.Transaction>;

    const shouldDisplayTaxRateError = formError === 'violations.taxOutOfPolicy';
    const isMovingCurrentTransactionFromTrackExpense = isMovingTransactionFromTrackExpense(action);
    const taxRates = policy?.taxRates ?? (isMovingCurrentTransactionFromTrackExpense ? policyForMovingExpenses?.taxRates : null);
    const taxAmount = getTaxAmount(transactionForHelpers, false);
    const effectiveCurrency = iouCurrencyCode ?? CONST.CURRENCY.USD;
    const decimals = getCurrencyDecimals(effectiveCurrency);
    const formattedTaxAmount = convertToDisplayString(taxAmount, effectiveCurrency);
    const taxAmountInput = convertToFrontendAmountAsString(taxAmount, decimals);
    const taxRateTitle = getTaxRateTitle(policy, transactionForHelpers, isMovingCurrentTransactionFromTrackExpense, policyForMovingExpenses);

    const taxAmountInputKey = `${taxSlice?.taxCode}-${taxSlice?.taxValue}-${taxSlice?.amount}-${effectiveCurrency}`;

    // The tax amount is only validated on submit (see useConfirmationValidation), matching how the other fields behave.
    // Here we just surface the resulting form error; `formattedMaxTaxAmount` is the limit shown in that error message.
    const maxTaxAmount = getCalculatedTaxAmount(policy, transactionForHelpers, effectiveCurrency, decimals);
    const formattedMaxTaxAmount = convertToDisplayString(maxTaxAmount, effectiveCurrency);
    const shouldDisplayTaxAmountError = formError === 'iou.error.invalidTaxAmount';

    const handleTaxAmountChange = (newAmount: string) => {
        if (!transactionID) {
            return;
        }

        const taxAmountInSmallestCurrencyUnits = newAmount.trim() === '' ? 0 : convertToBackendAmount(Number.parseFloat(newAmount));

        // Clear a previously surfaced tax error as the user edits; validation re-runs on submit.
        clearFormErrors(['iou.error.invalidTaxAmount']);

        // When editing a split expense, persist directly to the split draft so that
        // SplitBillDetailsPage and completeSplitBill read the latest value.
        if (isEditingSplitBill) {
            setDraftSplitTransaction(transactionID, splitDraftTransaction, {taxAmount: taxAmountInSmallestCurrencyUnits});
            return;
        }

        setMoneyRequestTaxAmount(transactionID, taxAmountInSmallestCurrencyUnits);
    };

    useEffect(() => {
        if (!isNewManualExpenseFlowEnabled || (numberFormRef?.current && numberFormRef.current.getNumber() === taxAmountInput)) {
            return;
        }
        numberFormRef.current?.updateNumber(taxAmountInput);
    }, [isNewManualExpenseFlowEnabled, taxAmountInput]);

    useEffect(() => {
        if (!isNewManualExpenseFlowEnabled || formError !== 'iou.error.invalidTaxAmount' || taxAmount > maxTaxAmount) {
            return;
        }
        clearFormErrors(['iou.error.invalidTaxAmount']);
    }, [isNewManualExpenseFlowEnabled, formError, taxAmount, maxTaxAmount, clearFormErrors]);

    return (
        <>
            <MenuItemWithTopDescription
                key={`${taxRates?.name}_rate`}
                shouldShowRightIcon={canModifyTaxFields}
                title={taxRateTitle}
                description={taxRates?.name}
                style={[styles.moneyRequestMenuItem]}
                titleStyle={styles.flex1}
                onPress={() => {
                    if (!transactionID) {
                        return;
                    }

                    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_TAX_RATE.getRoute(action, iouType, transactionID, reportID)));
                }}
                disabled={didConfirm}
                interactive={canModifyTaxFields}
                brickRoadIndicator={shouldDisplayTaxRateError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={shouldDisplayTaxRateError ? translate(formError as TranslationPaths) : ''}
                sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.TAX_RATE_FIELD}
            />
            {isNewManualExpenseFlowEnabled && canModifyTaxFields ? (
                <View style={[styles.mh4, styles.mv2]}>
                    <NumberWithSymbolForm
                        numberFormRef={numberFormRef}
                        key={taxAmountInputKey}
                        displayAsTextInput
                        autoFocus={false}
                        value={taxAmountInput}
                        decimals={decimals}
                        currency={effectiveCurrency}
                        symbol={getLocalizedCurrencySymbol(preferredLocale, effectiveCurrency) ?? ''}
                        label={translate('iou.taxAmount')}
                        errorText={shouldDisplayTaxAmountError ? translate('iou.error.invalidTaxAmount', formattedMaxTaxAmount) : ''}
                        onInputChange={handleTaxAmountChange}
                        shouldShowBigNumberPad={false}
                        disabled={didConfirm}
                    />
                </View>
            ) : (
                <MenuItemWithTopDescription
                    key={`${taxRates?.name}_amount`}
                    shouldShowRightIcon={canModifyTaxFields}
                    title={formattedTaxAmount}
                    description={translate('iou.taxAmount')}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => {
                        if (!transactionID) {
                            return;
                        }

                        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_TAX_AMOUNT.getRoute(action, iouType, transactionID, reportID)));
                    }}
                    disabled={didConfirm}
                    interactive={canModifyTaxFields}
                    sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.TAX_AMOUNT_FIELD}
                />
            )}
        </>
    );
}

export default TaxFields;
