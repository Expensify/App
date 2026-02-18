import React from 'react';
import CurrencySelectionList from '@components/CurrencySelectionList';
import type {CurrencyListItem} from '@components/CurrencySelectionList/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateGeneralSettings} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import KeyboardUtils from '@src/utils/keyboard';

function PaymentCurrencyPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID, {canBeMissing: true});
    const personalPolicy = usePolicy(personalPolicyID);

    const paymentCurrency = personalPolicy?.outputCurrency ?? CONST.CURRENCY.USD;

    const handleDismissKeyboardAndGoBack = () => {
        KeyboardUtils.dismiss().then(() => {
            Navigation.goBack();
        });
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="PaymentCurrencyPage"
        >
            {({didScreenTransitionEnd}) => (
                <>
                    <HeaderWithBackButton
                        title={translate('billingCurrency.paymentCurrency')}
                        shouldShowBackButton
                        onBackButtonPress={handleDismissKeyboardAndGoBack}
                    />

                    <Text style={[styles.mh5, styles.mv4]}>{translate('billingCurrency.paymentCurrencyDescription')}</Text>

                    <CurrencySelectionList
                        recentlyUsedCurrencies={[]}
                        searchInputLabel={translate('common.search')}
                        onSelect={(option: CurrencyListItem) => {
                            if (option.currencyCode !== paymentCurrency) {
                                updateGeneralSettings(personalPolicyID, personalPolicy?.name ?? '', option.currencyCode);
                            }
                            handleDismissKeyboardAndGoBack();
                        }}
                        initiallySelectedCurrencyCode={paymentCurrency}
                        didScreenTransitionEnd={didScreenTransitionEnd}
                    />
                </>
            )}
        </ScreenWrapper>
    );
}

export default PaymentCurrencyPage;
