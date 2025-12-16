import React from 'react';
import {Keyboard} from 'react-native';
import CurrencySelectionList from '@components/CurrencySelectionList';
import type {CurrencyListItem} from '@components/CurrencySelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {isValidCurrencyCode} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getTransactionDetails} from '@libs/ReportUtils';
import {appendParam} from '@libs/Url';
import {setMoneyRequestCurrency} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';

type IOURequestStepCurrencyProps = WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_CURRENCY>;

function IOURequestStepCurrency({
    route: {
        params: {backTo, pageIndex, transactionID, action, currency: selectedCurrency = ''},
    },
}: IOURequestStepCurrencyProps) {
    const {translate} = useLocalize();
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {canBeMissing: true});
    const [recentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES, {canBeMissing: true});
    const {currency: originalCurrency = ''} = getTransactionDetails(draftTransaction) ?? {};
    const currency = isValidCurrencyCode(selectedCurrency) ? selectedCurrency : originalCurrency;

    const navigateBack = (selectedCurrencyValue = '') => {
        // If the currency selection was done from the confirmation step (eg. + > submit expense > manual > confirm > amount > currency)
        // then the user needs taken back to the confirmation page instead of the initial amount page. This is because the route params
        // are only able to handle one backTo param at a time and the user needs to go back to the amount page before going back
        // to the confirmation page
        if (pageIndex === CONST.IOU.PAGE_INDEX.CONFIRM) {
            if (selectedCurrencyValue) {
                Navigation.goBack(appendParam(backTo as string, 'currency', selectedCurrencyValue), {compareParams: false});
            } else {
                Navigation.goBack(backTo);
            }
            return;
        }
        Navigation.goBack(backTo);
    };

    const confirmCurrencySelection = (option: CurrencyListItem) => {
        Keyboard.dismiss();
        if (pageIndex !== CONST.IOU.PAGE_INDEX.CONFIRM) {
            setMoneyRequestCurrency(transactionID, option.currencyCode, action === CONST.IOU.ACTION.EDIT);
        }

        Navigation.setNavigationActionToMicrotaskQueue(() => navigateBack(option.currencyCode));
    };

    return (
        <StepScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            headerTitle={translate('common.selectCurrency')}
            onBackButtonPress={() => navigateBack()}
            shouldShowWrapper
            testID="IOURequestStepCurrency"
            includeSafeAreaPaddingBottom
        >
            {({didScreenTransitionEnd}) => (
                <CurrencySelectionList
                    recentlyUsedCurrencies={recentlyUsedCurrencies ?? []}
                    searchInputLabel={translate('common.search')}
                    onSelect={(option: CurrencyListItem) => {
                        if (!didScreenTransitionEnd) {
                            return;
                        }
                        confirmCurrencySelection(option);
                    }}
                    initiallySelectedCurrencyCode={currency.toUpperCase()}
                />
            )}
        </StepScreenWrapper>
    );
}

/* eslint-disable rulesdir/no-negated-variables */
const IOURequestStepCurrencyWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepCurrency);

export default IOURequestStepCurrencyWithFullTransactionOrNotFound;
