import React from 'react';
import CurrencySelectionList from '@components/CurrencySelectionList';
import type {CurrencyListItem} from '@components/CurrencySelectionList/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateGeneralSettings} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalPolicy} from '@libs/PolicyUtils';
import CONST from '@src/CONST';

function PaymentCurrencyPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const personalPolicyID = getPersonalPolicy()?.id;
    const personalPolicy = usePolicy(personalPolicyID);

    const paymentCurrency = personalPolicy?.outputCurrency ?? CONST.CURRENCY.USD;

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={PaymentCurrencyPage.displayName}
        >
            {({didScreenTransitionEnd}) => (
                <>
                    <HeaderWithBackButton
                        title={translate('billingCurrency.paymentCurrency')}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.goBack()}
                    />

                    <Text style={[styles.mh5, styles.mv4]}>{translate('billingCurrency.paymentCurrencyDescription')}</Text>

                    <CurrencySelectionList
                        recentlyUsedCurrencies={[]}
                        searchInputLabel={translate('common.search')}
                        onSelect={(option: CurrencyListItem) => {
                            if (!didScreenTransitionEnd) {
                                return;
                            }
                            if (option.currencyCode !== paymentCurrency) {
                                updateGeneralSettings(personalPolicyID, personalPolicy?.name ?? '', option.currencyCode);
                            }
                            Navigation.goBack();
                        }}
                        initiallySelectedCurrencyCode={paymentCurrency}
                    />
                </>
            )}
        </ScreenWrapper>
    );
}

PaymentCurrencyPage.displayName = 'PaymentCurrencyPage';

export default PaymentCurrencyPage;
