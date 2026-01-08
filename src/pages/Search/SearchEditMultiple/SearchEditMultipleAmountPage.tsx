import React, {useEffect, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchContext} from '@components/Search/SearchContext';
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
    const {selectedTransactions} = useSearchContext();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});

    const policyID = getSearchBulkEditPolicyID(selectedTransactions, activePolicyID);
    const policy = policyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] : undefined;
    const policyCurrency = policy?.outputCurrency ?? CONST.CURRENCY.USD;

    const initialCurrency = draftTransaction?.currency ?? policyCurrency;
    const [selectedCurrency, setSelectedCurrency] = useState(initialCurrency);
    const [isCurrencyPickerVisible, setIsCurrencyPickerVisible] = useState(false);

    const amount = draftTransaction?.amount ?? 0;

    const saveAmount = (currentMoney: CurrentMoney) => {
        const newAmount = convertToBackendAmount(Number.parseFloat(currentMoney.amount));
        const shouldUpdateCurrency = selectedCurrency !== initialCurrency;
        updateBulkEditDraftTransaction({
            amount: newAmount,
            ...(shouldUpdateCurrency ? {currency: currentMoney.currency} : {}),
        });
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={SearchEditMultipleAmountPage.displayName}
        >
            <IOURequestStepCurrencyModal
                isPickerVisible={isCurrencyPickerVisible}
                hidePickerModal={() => setIsCurrencyPickerVisible(false)}
                headerText={translate('common.selectCurrency')}
                value={selectedCurrency}
                onInputChange={(value) => setSelectedCurrency(value)}
            />
            <HeaderWithBackButton
                title={translate('iou.amount')}
                onBackButtonPress={Navigation.goBack}
            />
            <MoneyRequestAmountForm
                amount={Math.abs(amount)}
                currency={selectedCurrency}
                isEditing
                onCurrencyButtonPress={() => setIsCurrencyPickerVisible(true)}
                onSubmitButtonPress={saveAmount}
            />
        </ScreenWrapper>
    );
}

SearchEditMultipleAmountPage.displayName = 'SearchEditMultipleAmountPage';

export default SearchEditMultipleAmountPage;
