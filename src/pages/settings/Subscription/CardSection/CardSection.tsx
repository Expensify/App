import React, {useMemo} from 'react';
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
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import BillingBanner from './BillingBanner';
import CardSectionActions from './CardSectionActions';
import CardSectionDataEmpty from './CardSectionDataEmpty';
import CardSectionUtils from './utils';

function CardSection() {
    const {translate, preferredLocale} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isOffline} = useNetwork();
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);

    const defaultCard = CardSectionUtils.getCardForSubscriptionBilling();

    const cardMonth = useMemo(() => DateUtils.getMonthNames(preferredLocale)[(defaultCard?.accountData?.cardMonth ?? 1) - 1], [defaultCard?.accountData?.cardMonth, preferredLocale]);

    const nextPaymentDate = !isEmptyObject(privateSubscription) ? CardSectionUtils.getNextBillingDate() : undefined;

    const sectionSubtitle = defaultCard && !!nextPaymentDate ? translate('subscription.cardSection.cardNextPayment', {nextPaymentDate}) : translate('subscription.cardSection.subtitle');
    const {title, subtitle, isError, shouldShowRedDotIndicator, shouldShowGreenDotIndicator, isRetryAvailable} = CardSectionUtils.getBillingStatus(
        translate,
        preferredLocale,
        defaultCard?.accountData?.cardNumber ?? '',
    );

    const shouldShowBanner = !!title || !!subtitle;

    return (
        <Section
            title={translate('subscription.cardSection.title')}
            subtitle={sectionSubtitle}
            isCentralPane
            titleStyles={styles.textStrong}
            subtitleMuted
            banner={
                shouldShowBanner && (
                    <BillingBanner
                        title={title}
                        subtitle={subtitle}
                        isError={isError}
                        shouldShowRedDotIndicator={shouldShowRedDotIndicator}
                        shouldShowGreenDotIndicator={shouldShowGreenDotIndicator}
                    />
                )
            }
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
                {!isEmptyObject(defaultCard?.accountData) && <CardSectionDataEmpty />}
                {!isRetryAvailable && (
                    <Button
                        text={translate('subscription.cardSection.retryPaymentButton')}
                        isDisabled={isOffline}
                        onPress={() => {
                            Subscription.clearOutstandingBalance();
                        }}
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
