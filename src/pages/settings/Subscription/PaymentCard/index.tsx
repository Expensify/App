import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import PaymentCardForm from '@components/AddPaymentCard/PaymentCardForm';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import Section, {CARD_LAYOUT} from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import usePreferredCurrency from '@hooks/usePreferredCurrency';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useSubscriptionPrice from '@hooks/useSubscriptionPrice';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import {convertToShortDisplayString} from '@libs/CurrencyUtils';
import * as PaymentMethods from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function AddPaymentCard() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const [shouldShowPaymentCardForm, setShouldShowPaymentCardForm] = useState(false);

    const subscriptionPlan = useSubscriptionPlan();
    const subscriptionPrice = useSubscriptionPrice();
    const preferredCurrency = usePreferredCurrency();

    const isCollect = subscriptionPlan === CONST.POLICY.TYPE.TEAM;
    const isAnnual = privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL;
    const defaultCard = useMemo(() => Object.values(fundList ?? {}).find((card) => card.accountData?.additionalData?.isBillingCard), [fundList]);

    useEffect(() => {
        PaymentMethods.clearPaymentCardFormErrorAndSubmit();

        return () => {
            PaymentMethods.clearPaymentCardFormErrorAndSubmit();
        };
    }, []);

    useEffect(() => {
        if (!defaultCard?.accountData || isEmptyObject(defaultCard?.accountData)) {
            setShouldShowPaymentCardForm(true);
            return;
        }
        PaymentMethods.setPaymentCardForm(defaultCard.accountData);
        setShouldShowPaymentCardForm(true);
    }, [defaultCard?.accountData]);

    const addPaymentCard = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM>) => {
        const cardData = {
            cardNumber: CardUtils.getMCardNumberString(values.cardNumber),
            cardMonth: CardUtils.getMonthFromExpirationDateString(values.expirationDate),
            cardYear: CardUtils.getYearFromExpirationDateString(values.expirationDate),
            cardCVV: values.securityCode,
            addressName: values.nameOnCard,
            addressZip: values.addressZipCode,
            currency: values.currency ?? CONST.PAYMENT_CARD_CURRENCY.USD,
        };
        PaymentMethods.addSubscriptionPaymentCard(cardData);
    }, []);

    return (
        <ScreenWrapper testID={AddPaymentCard.displayName}>
            <HeaderWithBackButton title={translate('subscription.paymentCard.addPaymentCard')} />
            <View style={styles.containerWithSpaceBetween}>
                <PaymentCardForm
                    shouldShowPaymentCardForm={shouldShowPaymentCardForm}
                    addPaymentCard={addPaymentCard}
                    showAcceptTerms
                    showCurrencyField
                    currencySelectorRoute={ROUTES.SETTINGS_SUBSCRIPTION_CHANGE_PAYMENT_CURRENCY}
                    submitButtonText={translate('subscription.paymentCard.addPaymentCard')}
                    headerContent={<Text style={[styles.textHeadline, styles.mt3, styles.mb2, styles.ph5]}>{translate('subscription.paymentCard.enterPaymentCardDetails')}</Text>}
                    footerContent={
                        <>
                            <Section
                                icon={Illustrations.ShieldYellow}
                                cardLayout={CARD_LAYOUT.ICON_ON_LEFT}
                                iconContainerStyles={styles.mr4}
                                containerStyles={[styles.mh0, styles.mt5]}
                                renderTitle={() => (
                                    <Text style={[styles.mutedTextLabel]}>
                                        {translate('subscription.paymentCard.security')}{' '}
                                        <TextLink
                                            style={[styles.mutedTextLabel, styles.link]}
                                            href={CONST.TERMS_URL}
                                        >
                                            {translate('subscription.paymentCard.learnMoreAboutSecurity')}
                                        </TextLink>
                                    </Text>
                                )}
                            />
                            <Text style={[styles.textMicroSupporting, styles.mt3, styles.textAlignCenter, styles.mr5, styles.ml5]}>
                                {translate(`subscription.yourPlan.${isCollect ? 'collect' : 'control'}.${isAnnual ? 'priceAnnual' : 'pricePayPerUse'}`, {
                                    lower: convertToShortDisplayString(subscriptionPrice, preferredCurrency),
                                    upper: convertToShortDisplayString(subscriptionPrice * CONST.SUBSCRIPTION_PRICE_FACTOR, preferredCurrency),
                                })}
                            </Text>
                        </>
                    }
                />
            </View>
        </ScreenWrapper>
    );
}

AddPaymentCard.displayName = 'AddPaymentCard';

export default AddPaymentCard;
