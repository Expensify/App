import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
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
import variables from '@styles/variables';
import * as PaymentMethods from '@userActions/PaymentMethods';
import * as PolicyActions from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';

function AddPaymentCard() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = '1';

    useEffect(() => {
        PaymentMethods.clearDebitCardFormErrorAndSubmit();

        return () => {
            PaymentMethods.clearDebitCardFormErrorAndSubmit();
        };
    }, []);

    const addPaymentCard = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM>) => {
            const cardData = {
                cardNumber: values.cardNumber,
                cardMonth: CardUtils.getMonthFromExpirationDateString(values.expirationDate),
                cardYear: CardUtils.getYearFromExpirationDateString(values.expirationDate),
                cardCVV: values.securityCode,
                addressName: values.nameOnCard,
                addressZip: values.addressZipCode,
                currency: CONST.CURRENCY.USD,
            };

            PolicyActions.addBillingCardAndRequestPolicyOwnerChange(policyID, cardData);
        },
        [policyID],
    );

    return (
        <ScreenWrapper testID={AddPaymentCard.displayName}>
            <HeaderWithBackButton
                title={translate('subscription.paymentCard.addPaymentCard')}
                onBackButtonPress={() => {
                    Navigation.goBack();
                }}
            />
            <View style={[styles.containerWithSpaceBetween, styles.pb5]}>
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
                                iconWidth={variables.menuIconSize}
                                iconHeight={variables.menuIconSize}
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
                            {/** TODO will be replaced after PR merged */}
                            <Text style={[styles.textMicroSupporting, styles.mt3, styles.textAlignCenter]}>
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
