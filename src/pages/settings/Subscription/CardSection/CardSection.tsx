import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import * as Subscription from '@userActions/Subscription';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import PreTrialBillingBanner from './BillingBanner/PreTrialBillingBanner';
import SubscriptionBillingBanner from './BillingBanner/SubscriptionBillingBanner';
import CardSectionActions from './CardSectionActions';
import CardSectionDataEmpty from './CardSectionDataEmpty';
import CardSectionUtils from './utils';

function CardSection() {
    const {translate, preferredLocale} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);
    const [subscriptionRetryBillingStatus] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS);
    const {isOffline} = useNetwork();
    const defaultCard = CardSectionUtils.getCardForSubscriptionBilling();

    const cardMonth = useMemo(() => DateUtils.getMonthNames(preferredLocale)[(defaultCard?.accountData?.cardMonth ?? 1) - 1], [defaultCard?.accountData?.cardMonth, preferredLocale]);

    const [billingStatus, setBillingStatus] = useState(CardSectionUtils.getBillingStatus(translate, defaultCard?.accountData?.cardNumber ?? ''));

    const nextPaymentDate = !isEmptyObject(privateSubscription) ? CardSectionUtils.getNextBillingDate() : undefined;

    const sectionSubtitle = defaultCard && !!nextPaymentDate ? translate('subscription.cardSection.cardNextPayment', {nextPaymentDate}) : translate('subscription.cardSection.subtitle');

    useEffect(() => {
        setBillingStatus(CardSectionUtils.getBillingStatus(translate, defaultCard?.accountData?.cardNumber ?? ''));
    }, [defaultCard?.accountData?.cardNumber, subscriptionRetryBillingStatus, translate]);

    const handleRetryPayment = () => {
        Subscription.clearOutstandingBalance();
    };

    let BillingBanner: React.ReactNode | undefined;
    if (!CardSectionUtils.shouldShowPreTrialBillingBanner()) {
        BillingBanner = <PreTrialBillingBanner />;
    } else if (billingStatus.title && billingStatus.subtitle) {
        BillingBanner = (
            <SubscriptionBillingBanner
                title={billingStatus.title}
                subtitle={billingStatus.subtitle}
                isTrialActive={false}
                isError={billingStatus.isError}
                icon={billingStatus.icon}
                rightIcon={billingStatus.rightIcon}
            />
        );
    }

    return (
        <Section
            title={translate('subscription.cardSection.title')}
            subtitle={sectionSubtitle}
            isCentralPane
            titleStyles={styles.textStrong}
            subtitleMuted
            banner={BillingBanner}
        >
            <View style={[styles.mt8, styles.mb3, styles.flexRow]}>
                {!isEmptyObject(defaultCard?.accountData) && (
                    <>
                        <View style={[styles.flexRow, styles.flex1, styles.gap3]}>
                            <Icon
                                src={Expensicons.CreditCard}
                                additionalStyles={styles.subscriptionAddedCardIcon}
                                fill={theme.text}
                                medium
                            />
                            <View style={styles.flex1}>
                                <Text style={styles.textStrong}>{translate('subscription.cardSection.cardEnding', {cardNumber: defaultCard?.accountData?.cardNumber})}</Text>
                                <Text style={styles.mutedNormalTextLabel}>
                                    {translate('subscription.cardSection.cardInfo', {
                                        name: defaultCard?.accountData?.addressName,
                                        expiration: `${cardMonth} ${defaultCard?.accountData?.cardYear}`,
                                        currency: defaultCard?.accountData?.currency,
                                    })}
                                </Text>
                            </View>
                        </View>
                        <CardSectionActions />
                    </>
                )}
                {/* TODO remove negation */}
                {!isEmptyObject(defaultCard?.accountData) && <CardSectionDataEmpty />}
                {/* TODO remove negation */}
                {!billingStatus.isRetryAvailable && (
                    <Button
                        text={translate('subscription.cardSection.retryPaymentButton')}
                        isDisabled={isOffline}
                        isLoading={subscriptionRetryBillingStatus === CONST.SUBSCRIPTION_RETRY_BILLING_STATUS.PENDING}
                        onPress={handleRetryPayment}
                        style={styles.w100}
                        success
                        large
                    />
                )}
            </View>
        </Section>
    );
}

CardSection.displayName = 'CardSection';

export default CardSection;
