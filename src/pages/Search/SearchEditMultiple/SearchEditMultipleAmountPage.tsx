import {useFocusEffect} from '@react-navigation/native';
import React, {useRef, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchContext} from '@components/Search/SearchContext';
import isTextInputFocused from '@components/TextInput/BaseTextInput/isTextInputFocused';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {updateBulkEditDraftTransaction} from '@libs/actions/IOU';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getSearchBulkEditPolicyID} from '@libs/SearchUIUtils';
import MoneyRequestAmountForm from '@pages/iou/MoneyRequestAmountForm';
import IOURequestStepCurrencyModal from '@pages/iou/request/step/IOURequestStepCurrencyModal';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type CurrentMoney = {amount: string; currency: string};

function SearchEditMultipleAmountPage() {
    const {translate} = useLocalize();
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`, {canBeMissing: true});
    const {selectedTransactionIDs} = useSearchContext();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: true});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});

    const textInput = useRef<BaseTextInputRef | null>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const policyID = getSearchBulkEditPolicyID(selectedTransactionIDs, activePolicyID, allTransactions, allReports);
    const policy = policyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] : undefined;
    const policyCurrency = policy?.outputCurrency ?? CONST.CURRENCY.USD;

    const initialCurrency = draftTransaction?.currency ?? policyCurrency;
    const [selectedCurrency, setSelectedCurrency] = useState(initialCurrency);
    const [isCurrencyPickerVisible, setIsCurrencyPickerVisible] = useState(false);

    useFocusEffect(() => {
        if (isCurrencyPickerVisible) {
            return;
        }
        focusTimeoutRef.current = setTimeout(() => textInput.current?.focus(), CONST.ANIMATED_TRANSITION + 100);
        return () => {
            if (!focusTimeoutRef.current) {
                return;
            }
            clearTimeout(focusTimeoutRef.current);
        };
    });

    const amount = draftTransaction?.amount ?? 0;

    const saveAmount = (currentMoney: CurrentMoney) => {
        const newAmount = convertToBackendAmount(Number.parseFloat(currentMoney.amount));
        // TODO: Currency update should be handled in a separate PR
        updateBulkEditDraftTransaction({
            amount: newAmount,
        });
        Navigation.goBack();
    };

    const showCurrencyPicker = () => {
        if (isTextInputFocused(textInput)) {
            textInput.current?.blur();
        }
        setIsCurrencyPickerVisible(true);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={SearchEditMultipleAmountPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('iou.amount')}
                onBackButtonPress={Navigation.goBack}
            />
            <IOURequestStepCurrencyModal
                isPickerVisible={isCurrencyPickerVisible}
                hidePickerModal={() => setIsCurrencyPickerVisible(false)}
                headerText={translate('common.selectCurrency')}
                value={selectedCurrency}
                onInputChange={(value) => setSelectedCurrency(value)}
            />
            <MoneyRequestAmountForm
                amount={Math.abs(amount)}
                currency={selectedCurrency}
                isEditing
                // TODO: Enable currency picker in a separate PR
                isCurrencyPressable={false}
                ref={(e: BaseTextInputRef | null) => {
                    textInput.current = e;
                }}
                onCurrencyButtonPress={showCurrencyPicker}
                onSubmitButtonPress={saveAmount}
            />
        </ScreenWrapper>
    );
}

SearchEditMultipleAmountPage.displayName = 'SearchEditMultipleAmountPage';

export default SearchEditMultipleAmountPage;
