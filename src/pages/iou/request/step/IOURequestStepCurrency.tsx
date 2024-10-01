import React from 'react';
import {Keyboard} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import CurrencySelectionList from '@components/CurrencySelectionList';
import type {CurrencyListItem} from '@components/CurrencySelectionList/types';
import useLocalize from '@hooks/useLocalize';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import {appendParam} from '@libs/Url';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';

type IOURequestStepCurrencyOnyxProps = {
    /** The draft transaction object being modified in Onyx */
    draftTransaction: OnyxEntry<Transaction>;
    /** List of recently used currencies */
    recentlyUsedCurrencies: OnyxEntry<string[]>;
};

type IOURequestStepCurrencyProps = IOURequestStepCurrencyOnyxProps & WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_CURRENCY>;

function IOURequestStepCurrency({
    route: {
        params: {backTo, pageIndex, transactionID, action, currency: selectedCurrency = ''},
    },
    draftTransaction,
    recentlyUsedCurrencies,
}: IOURequestStepCurrencyProps) {
    const {translate} = useLocalize();
    const {currency: originalCurrency = ''} = ReportUtils.getTransactionDetails(draftTransaction) ?? {};
    const currency = CurrencyUtils.isValidCurrencyCode(selectedCurrency) ? selectedCurrency : originalCurrency;

    const navigateBack = (selectedCurrencyValue = '') => {
        // If the currency selection was done from the confirmation step (eg. + > submit expense > manual > confirm > amount > currency)
        // then the user needs taken back to the confirmation page instead of the initial amount page. This is because the route params
        // are only able to handle one backTo param at a time and the user needs to go back to the amount page before going back
        // to the confirmation page
        if (pageIndex === CONST.IOU.PAGE_INDEX.CONFIRM) {
            if (selectedCurrencyValue) {
                Navigation.navigate(appendParam(backTo as string, 'currency', selectedCurrencyValue));
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
            IOU.setMoneyRequestCurrency(transactionID, option.currencyCode, action === CONST.IOU.ACTION.EDIT);
        }

        Navigation.setNavigationActionToMicrotaskQueue(() => navigateBack(option.currencyCode));
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.selectCurrency')}
            onBackButtonPress={() => navigateBack()}
            shouldShowWrapper
            testID={IOURequestStepCurrency.displayName}
            includeSafeAreaPaddingBottom={false}
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

IOURequestStepCurrency.displayName = 'IOURequestStepCurrency';

const IOURequestStepCurrencyWithOnyx = withOnyx<IOURequestStepCurrencyProps, IOURequestStepCurrencyOnyxProps>({
    draftTransaction: {
        key: ({route}) => {
            const transactionID = route?.params?.transactionID ?? -1;
            return `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`;
        },
    },
    recentlyUsedCurrencies: {
        key: ONYXKEYS.RECENTLY_USED_CURRENCIES,
    },
})(IOURequestStepCurrency);

/* eslint-disable rulesdir/no-negated-variables */
const IOURequestStepCurrencyWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepCurrencyWithOnyx);

export default IOURequestStepCurrencyWithFullTransactionOrNotFound;
