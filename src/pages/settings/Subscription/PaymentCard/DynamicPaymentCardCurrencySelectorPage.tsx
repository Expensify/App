import React, {useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import PaymentCardCurrencyHeader from '@components/AddPaymentCard/PaymentCardCurrencyHeader';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePreferredCurrency from '@hooks/usePreferredCurrency';
import useThemeStyles from '@hooks/useThemeStyles';
import {setDraftValues} from '@libs/actions/FormActions';
import Navigation from '@libs/Navigation/Navigation';
import {setPaymentMethodCurrency} from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/ChangeBillingCurrencyForm';

type Currency = ValueOf<typeof CONST.PAYMENT_CARD_CURRENCY>;

function DynamicPaymentCardCurrencySelectorPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.PAYMENT_CARD_CURRENCY_SELECTOR.path);
    // This selector is shared by two independent flows. Scope the read/write to the active flow's draft so a pick in one
    // flow never bleeds into the other (the only cross-flow link is a real billing-currency change, via the card's currency).
    const isChangeBillingCurrencyFlow = backPath === ROUTES.SETTINGS_SUBSCRIPTION_CHANGE_BILLING_CURRENCY;
    // The change-billing-currency screen already renders this note above its own form, so we only show it on the
    // selector for the other entry points (add payment card / workspace owner change) where it isn't displayed yet.
    const shouldShowCurrencyNote = !isChangeBillingCurrencyFlow;
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM_DRAFT);
    const [addCardFormDraft] = useOnyx(ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM_DRAFT);
    const preferredCurrency = usePreferredCurrency();
    const canUseEurBilling = isBetaEnabled(CONST.BETAS.EUR_BILLING);

    // A user can only pick EUR into the draft while the beta is on (the list below filters it out otherwise), so only the
    // preferred-currency fallback needs gating: without the beta, fall back to a currency the list actually offers instead
    // of a hidden EUR. Change-billing keeps the existing card's real currency.
    const addCardDefaultCurrency = !canUseEurBilling && preferredCurrency === CONST.PAYMENT_CARD_CURRENCY.EUR ? CONST.PAYMENT_CARD_CURRENCY.USD : preferredCurrency;
    const currentCurrency = (isChangeBillingCurrencyFlow ? (formDraft?.[INPUT_IDS.CURRENCY] ?? preferredCurrency) : (addCardFormDraft?.currency ?? addCardDefaultCurrency)) as Currency;

    const currencyOptions = useMemo(
        () =>
            (Object.keys(CONST.PAYMENT_CARD_CURRENCY) as Currency[])
                .filter((currency) => currency !== CONST.PAYMENT_CARD_CURRENCY.EUR || canUseEurBilling)
                .map((currency) => ({
                    text: currency,
                    value: currency,
                    keyForList: currency,
                    isSelected: currency === currentCurrency,
                })),
        [currentCurrency, canUseEurBilling],
    );

    return (
        <ScreenWrapper
            style={styles.pb0}
            includePaddingTop={false}
            enableEdgeToEdgeBottomSafeAreaPadding
            testID="DynamicPaymentCardCurrencySelectorPage"
        >
            <HeaderWithBackButton
                title={translate('common.currency')}
                onBackButtonPress={() => Navigation.goBack(backPath)}
            />
            <SelectionList
                data={currencyOptions}
                ListItem={SingleSelectListItem}
                customListHeader={shouldShowCurrencyNote ? <PaymentCardCurrencyHeader isSectionList /> : undefined}
                onSelectRow={(option) => {
                    if (isChangeBillingCurrencyFlow) {
                        setDraftValues(ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM, {[INPUT_IDS.CURRENCY]: option.value});
                    } else {
                        setPaymentMethodCurrency(option.value);
                    }
                    Navigation.goBack(backPath);
                }}
                shouldSingleExecuteRowSelect
                initiallyFocusedItemKey={currentCurrency}
                showScrollIndicator
                addBottomSafeAreaPadding
            />
        </ScreenWrapper>
    );
}

export default DynamicPaymentCardCurrencySelectorPage;
