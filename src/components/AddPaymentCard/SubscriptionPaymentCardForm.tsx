/**
 * Form for adding the payment card that pays for the user's Expensify subscription, including the card authentication step.
 */
import ActivityIndicator from '@components/ActivityIndicator';
import type {FormOnyxValues} from '@components/Form/types';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import Section, {CARD_LAYOUT} from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';

import useHasTeam2025Pricing from '@hooks/useHasTeam2025Pricing';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNavigateToCardAuthenticationOnLink from '@hooks/useNavigateToCardAuthenticationOnLink';
import useOnyx from '@hooks/useOnyx';
import usePreferredCurrency from '@hooks/usePreferredCurrency';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useSubscriptionPrice from '@hooks/useSubscriptionPrice';
import useThemeStyles from '@hooks/useThemeStyles';

import {getMCardNumberString, getMonthFromExpirationDateString, getYearFromExpirationDateString} from '@libs/CardUtils';
import {convertToShortDisplayString} from '@libs/CurrencyUtils';

import {addSubscriptionPaymentCard, clearPaymentCardFormErrorAndSubmit} from '@userActions/PaymentMethods';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {useRoute} from '@react-navigation/native';
import {accountIDSelector} from '@selectors/Session';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import PaymentCardForm from './PaymentCardForm';

type SubscriptionPaymentCardFormProps = {
    /** Heading above the card fields */
    headerText: string;

    /** Called after the card is sent to the server, before its setup finishes */
    onSubmit?: () => void;
};

function SubscriptionPaymentCardForm({headerText, onSubmit}: SubscriptionPaymentCardFormProps) {
    const route = useRoute();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const privateSubscription = usePrivateSubscription();
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const [isVerifyingSetupIntent] = useOnyx(ONYXKEYS.SUBSCRIPTION_VERIFY_SETUP_INTENT_PENDING);

    const subscriptionPlan = useSubscriptionPlan();
    const subscriptionPrice = useSubscriptionPrice();
    const preferredCurrency = usePreferredCurrency();
    const hasTeam2025Pricing = useHasTeam2025Pricing();
    const [hasSubmittedPaymentCard, setHasSubmittedPaymentCard] = useState(false);

    const isCollect = subscriptionPlan === CONST.POLICY.TYPE.TEAM;
    const isAnnual = privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL;
    const {asset: ShieldYellow} = useMemoizedLazyAsset(() => loadIllustration('ShieldYellow'));

    // The pending flag is one global key, shared with the Subscription page's Authenticate payment button, so a
    // verification started on another screen would otherwise cover this form. Only a submission made here may block it.
    const shouldShowVerificationSpinner = hasSubmittedPaymentCard && !!isVerifyingSetupIntent;

    const subscriptionPricingInfo =
        hasTeam2025Pricing && isCollect
            ? translate('subscription.yourPlan.pricePerMemberPerMonth', convertToShortDisplayString(subscriptionPrice, preferredCurrency))
            : translate(
                  `subscription.yourPlan.${isCollect ? 'collect' : 'control'}.${isAnnual ? 'priceAnnual' : 'pricePayPerUse'}`,
                  convertToShortDisplayString(subscriptionPrice, preferredCurrency),
                  convertToShortDisplayString(subscriptionPrice * CONST.SUBSCRIPTION_PRICE_FACTOR, preferredCurrency),
              );

    useNavigateToCardAuthenticationOnLink();

    useEffect(() => {
        clearPaymentCardFormErrorAndSubmit();

        return () => {
            clearPaymentCardFormErrorAndSubmit();
        };
    }, []);

    const addPaymentCard = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM>) => {
        const cardData = {
            cardNumber: getMCardNumberString(values.cardNumber),
            cardMonth: getMonthFromExpirationDateString(values.expirationDate),
            cardYear: getYearFromExpirationDateString(values.expirationDate),
            cardCVV: values.securityCode,
            addressName: values.nameOnCard,
            addressZip: values.addressZipCode,
            currency: values.currency ?? CONST.PAYMENT_CARD_CURRENCY.USD,
        };
        setHasSubmittedPaymentCard(true);
        onSubmit?.();
        addSubscriptionPaymentCard(accountID ?? CONST.DEFAULT_NUMBER_ID, cardData, fundList, route.name);
    };

    return (
        <View style={styles.containerWithSpaceBetween}>
            {shouldShowVerificationSpinner && (
                <View style={[StyleSheet.absoluteFill, styles.fullScreenLoading]}>
                    <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                </View>
            )}
            <PaymentCardForm
                shouldShowPaymentCardForm
                addPaymentCard={addPaymentCard}
                showAcceptTerms
                showCurrencyField
                submitButtonText={translate('subscription.paymentCard.addPaymentCard')}
                headerContent={<Text style={[styles.textHeadline, styles.mt3, styles.mb2, styles.ph5]}>{headerText}</Text>}
                footerContent={
                    <>
                        <Section
                            icon={ShieldYellow}
                            cardLayout={CARD_LAYOUT.ICON_ON_LEFT}
                            iconContainerStyles={styles.mr4}
                            containerStyles={[styles.mh0, styles.mt5]}
                            renderTitle={() => (
                                <Text style={[styles.mutedTextLabel]}>
                                    {translate('subscription.paymentCard.security')}{' '}
                                    <TextLink
                                        sentryLabel={CONST.SENTRY_LABEL.SETTINGS_SUBSCRIPTION.PAYMENT_CARD_SECURITY_LINK}
                                        style={[styles.mutedTextLabel, styles.link]}
                                        href={CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}
                                    >
                                        {translate('subscription.paymentCard.learnMoreAboutSecurity')}
                                    </TextLink>
                                </Text>
                            )}
                        />
                        <Text style={[styles.textMicroSupporting, styles.mt3, styles.textAlignCenter, styles.mr5, styles.ml5]}>{subscriptionPricingInfo}</Text>
                    </>
                }
            />
        </View>
    );
}

export default SubscriptionPaymentCardForm;
