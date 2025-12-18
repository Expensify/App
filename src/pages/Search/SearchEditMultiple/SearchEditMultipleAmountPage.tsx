import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {updateBulkEditDraftTransaction} from '@libs/actions/IOU';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import MoneyRequestAmountForm from '@pages/iou/MoneyRequestAmountForm';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type CurrentMoney = {amount: string; currency: string};

function SearchEditMultipleAmountPage() {
    const {translate} = useLocalize();
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`, {canBeMissing: true});

    const currency = draftTransaction?.currency ?? CONST.CURRENCY.USD;
    const amount = draftTransaction?.amount ?? 0;

    const saveAmount = (currentMoney: CurrentMoney) => {
        const newAmount = convertToBackendAmount(Number.parseFloat(currentMoney.amount));
        updateBulkEditDraftTransaction({
            amount: newAmount,
            currency: currentMoney.currency,
        });
        Navigation.goBack();
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
            <MoneyRequestAmountForm
                amount={Math.abs(amount)}
                currency={currency}
                isCurrencyPressable={false}
                isEditing
                onSubmitButtonPress={saveAmount}
            />
        </ScreenWrapper>
    );
}

SearchEditMultipleAmountPage.displayName = 'SearchEditMultipleAmountPage';

export default SearchEditMultipleAmountPage;
