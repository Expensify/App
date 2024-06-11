import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import PaymentCardForm from '@components/AddPaymentCard/PaymentCardForm';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import Section, {CARD_LAYOUT} from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import Navigation from '@navigation/Navigation';
import * as PaymentMethods from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';

function AddPaymentCard() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    useEffect(() => {
        PaymentMethods.clearDebitCardFormErrorAndSubmit();

        return () => {
            PaymentMethods.clearDebitCardFormErrorAndSubmit();
        };
    }, []);

    // TODO refactor ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM to ONYXKEYS.FORMS.ADD_CARD_FORM as a follow up
    const addPaymentCard = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM>, currency?: ValueOf<typeof CONST.CURRENCY>) => {
        const cardData = {
            cardNumber: values.cardNumber,
            cardMonth: CardUtils.getMonthFromExpirationDateString(values.expirationDate),
            cardYear: CardUtils.getYearFromExpirationDateString(values.expirationDate),
            cardCVV: values.securityCode,
            addressName: values.nameOnCard,
            addressZip: values.addressZipCode,
            currency: currency ?? CONST.CURRENCY.USD,
        };
        if (currency === CONST.CURRENCY.GBP) {
            // TODO add AddPaymentCardGBP flow as a follow up
            return;
        }
        PaymentMethods.addSubscriptionPaymentCard(cardData);
        Navigation.goBack();
    }, []);

    return (
        <ScreenWrapper testID={AddPaymentCard.displayName}>
            <HeaderWithBackButton title={translate('subscription.paymentCard.addPaymentCard')} />
            <View style={styles.containerWithSpaceBetween}>
                <PaymentCardForm
                    shouldShowPaymentCardForm
                    addPaymentCard={addPaymentCard}
                    showAcceptTerms
                    showCurrencyField
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
                            {/** TODO reusable component will be taken from https://github.com/Expensify/App/pull/42690  */}
                            <Text style={[styles.textMicroSupporting, styles.mt3, styles.textAlignCenter, styles.mr5, styles.ml5]}>
                                From $5/active member with the Expensify Card, $10/active member without the Expensify Card.
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
