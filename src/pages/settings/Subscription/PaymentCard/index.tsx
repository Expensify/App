import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import PaymentCardForm from '@components/AddPaymentCard/PaymentCardForm';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import Section, {CARD_LAYOUT} from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import usePreferredCurrency from '@hooks/usePreferredCurrency';
import usePrevious from '@hooks/usePrevious';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useSubscriptionPrice from '@hooks/useSubscriptionPrice';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import {convertToShortDisplayString} from '@libs/CurrencyUtils';
import CardAuthenticationModal from '@pages/settings/Subscription/CardAuthenticationModal';
import * as PaymentMethods from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function AddPaymentCard() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.accountID ?? 0});

    const subscriptionPlan = useSubscriptionPlan();
    const subscriptionPrice = useSubscriptionPrice();
    const preferredCurrency = usePreferredCurrency();

    const isCollect = subscriptionPlan === CONST.POLICY.TYPE.TEAM;
    const isAnnual = privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL;

    useEffect(() => {
        PaymentMethods.clearPaymentCardFormErrorAndSubmit();

        return () => {
            PaymentMethods.clearPaymentCardFormErrorAndSubmit();
        };
    }, []);

    const addPaymentCard = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM>) => {
            const cardData = {
                cardNumber: CardUtils.getMCardNumberString(values.cardNumber),
                cardMonth: CardUtils.getMonthFromExpirationDateString(values.expirationDate),
                cardYear: CardUtils.getYearFromExpirationDateString(values.expirationDate),
                cardCVV: values.securityCode,
                addressName: values.nameOnCard,
                addressZip: values.addressZipCode,
                currency: values.currency ?? CONST.PAYMENT_CARD_CURRENCY.USD,
            };
            PaymentMethods.addSubscriptionPaymentCard(accountID ?? 0, cardData);
        },
        [accountID],
    );

    const [formData] = useOnyx(ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM);
    const prevFormDataSetupComplete = usePrevious(!!formData?.setupComplete);

    useEffect(() => {
        if (prevFormDataSetupComplete || !formData?.setupComplete) {
            return;
        }

        PaymentMethods.continueSetup();
    }, [prevFormDataSetupComplete, formData?.setupComplete]);

    return (
        <ScreenWrapper testID={AddPaymentCard.displayName}>
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton title={translate('subscription.paymentCard.addPaymentCard')} />
                <View style={styles.containerWithSpaceBetween}>
                    <PaymentCardForm
                        shouldShowPaymentCardForm
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
                <CardAuthenticationModal headerTitle={translate('subscription.authenticatePaymentCard')} />
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

AddPaymentCard.displayName = 'AddPaymentCard';

export default AddPaymentCard;
