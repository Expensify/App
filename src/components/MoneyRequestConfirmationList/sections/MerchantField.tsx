import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import TextInput from '@components/TextInput';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearMoneyRequestMerchant, setMoneyRequestMerchant} from '@libs/actions/IOU/MoneyRequest';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {isUntypedPlaceholderMerchant, isValidInputLength} from '@libs/ValidationUtils';

import {setDraftSplitTransaction} from '@userActions/IOU/Split';

import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React, {useState} from 'react';
import {View} from 'react-native';

import {merchantStateSelector} from './selectors';
import useTransactionSelector from './useTransactionSelector';

type MerchantFieldProps = {
    isMerchantRequired: boolean | undefined;
    isNewManualExpenseFlowEnabled: boolean;
    isReadOnly: boolean;
    didConfirm: boolean;
    shouldDisplayFieldError: boolean;
    formError: string;
    transactionID: string | undefined;
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    reportActionID: string | undefined;
};

function MerchantField({
    isMerchantRequired,
    isNewManualExpenseFlowEnabled,
    isReadOnly,
    didConfirm,
    shouldDisplayFieldError,
    formError,
    transactionID,
    action,
    iouType,
    reportID,
    reportActionID,
}: MerchantFieldProps) {
    const {isEditingSplitBill} = useConfirmationFields();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();

    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);

    const merchantState = useTransactionSelector(transactionID, merchantStateSelector);

    const merchantValue = merchantState?.merchant ?? '';
    const displayMerchantValue = isUntypedPlaceholderMerchant(merchantState?.isMerchantSet, merchantValue) ? '' : merchantValue;
    const transactionHasReceipt = merchantState?.hasReceipt ?? false;

    // Mirror the persisted merchant in local state so the controlled input updates synchronously as the user types;
    // feeding the async Onyx value straight to `value` snaps the caret to the end on every keystroke (see #98647).
    const [isMerchantInputFocused, setIsMerchantInputFocused] = useState(false);
    const [merchantInput, setMerchantInput] = useState(displayMerchantValue);
    const [prevDisplayValue, setPrevDisplayValue] = useState(displayMerchantValue);
    const [prevTransactionID, setPrevTransactionID] = useState(transactionID);

    // Sync the mirror during render (not in an effect) to avoid an extra render pass. Reset on transaction change
    // even while focused; otherwise sync external updates (SmartScan, drafts) only when the field isn't being edited.
    if (transactionID !== prevTransactionID) {
        setPrevTransactionID(transactionID);
        setPrevDisplayValue(displayMerchantValue);
        setMerchantInput(displayMerchantValue);
    } else if (displayMerchantValue !== prevDisplayValue) {
        setPrevDisplayValue(displayMerchantValue);
        if (!isMerchantInputFocused) {
            setMerchantInput(displayMerchantValue);
        }
    }

    // Determine if the merchant error should be displayed
    const merchantErrorText = (() => {
        const {isValid, byteLength} = isValidInputLength(merchantValue, CONST.MERCHANT_NAME_MAX_BYTES);

        if (!isValid) {
            return translate('common.error.characterLimitExceedCounter', byteLength, CONST.MERCHANT_NAME_MAX_BYTES);
        }

        if (formError === 'iou.error.invalidMerchant') {
            return translate('iou.error.invalidMerchant');
        }

        // `common.error.fieldRequired` is shared with the amount and date fields, so only surface it here when the
        // merchant is the required value that is still missing.
        if (formError === 'common.error.fieldRequired' && isMerchantRequired && !displayMerchantValue) {
            return translate('common.error.fieldRequired');
        }

        if (shouldDisplayFieldError && isMerchantRequired && !displayMerchantValue) {
            return translate('common.error.fieldRequired');
        }

        return '';
    })();

    const shouldDisplayMerchantError = !!merchantErrorText;

    const handleMerchantInputChange = (newMerchant: string) => {
        setMerchantInput(newMerchant);

        if (!transactionID) {
            return;
        }

        // When editing a split expense, persist directly to the split draft so that
        // SplitBillDetailsPage and completeSplitBill read the latest value.
        if (isEditingSplitBill) {
            if (newMerchant.trim() === '') {
                setDraftSplitTransaction(transactionID, splitDraftTransaction, {merchant: '', isMerchantSet: false}, getCurrencyDecimals, getCurrencySymbol);
                return;
            }
            setDraftSplitTransaction(transactionID, splitDraftTransaction, {merchant: newMerchant}, getCurrencyDecimals, getCurrencySymbol);
            return;
        }

        if (newMerchant.trim() === '') {
            clearMoneyRequestMerchant(transactionID);
            return;
        }

        setMoneyRequestMerchant(transactionID, newMerchant, true, transactionHasReceipt);
    };

    if (isNewManualExpenseFlowEnabled && !isReadOnly) {
        return (
            <View style={[styles.mh4, styles.mv2]}>
                <TextInput
                    value={merchantInput}
                    readOnly={didConfirm}
                    onChangeText={handleMerchantInputChange}
                    onFocus={() => {
                        setIsMerchantInputFocused(true);
                    }}
                    onBlur={() => {
                        setIsMerchantInputFocused(false);
                    }}
                    label={translate('common.merchant')}
                    accessibilityLabel={translate('common.merchant')}
                    errorText={merchantErrorText}
                />
            </View>
        );
    }

    return (
        <MenuItemWithTopDescription
            shouldShowRightIcon={!isReadOnly}
            title={displayMerchantValue}
            description={translate('common.merchant')}
            style={[styles.moneyRequestMenuItem]}
            titleStyle={styles.flex1}
            onPress={() => {
                if (!transactionID) {
                    return;
                }

                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_MERCHANT.getRoute(action, iouType, transactionID, reportID, reportActionID)));
            }}
            disabled={didConfirm}
            interactive={!isReadOnly}
            brickRoadIndicator={shouldDisplayMerchantError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            errorText={shouldDisplayMerchantError ? translate('common.error.fieldRequired') : ''}
            rightLabel={isMerchantRequired && !shouldDisplayMerchantError ? translate('common.required') : ''}
            numberOfLinesTitle={2}
            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.MERCHANT_FIELD}
        />
    );
}

export default MerchantField;
