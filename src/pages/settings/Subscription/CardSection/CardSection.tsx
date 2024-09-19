import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as User from '@libs/actions/User';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getPaymentMethodDescription} from '@libs/PaymentUtils';
import * as SearchUtils from '@libs/SearchUtils';
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import * as PaymentMethods from '@userActions/PaymentMethods';
import * as Subscription from '@userActions/Subscription';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import PreTrialBillingBanner from './BillingBanner/PreTrialBillingBanner';
import SubscriptionBillingBanner from './BillingBanner/SubscriptionBillingBanner';
import TrialEndedBillingBanner from './BillingBanner/TrialEndedBillingBanner';
import TrialStartedBillingBanner from './BillingBanner/TrialStartedBillingBanner';
import CardSectionActions from './CardSectionActions';
import CardSectionDataEmpty from './CardSectionDataEmpty';
import RequestEarlyCancellationMenuItem from './RequestEarlyCancellationMenuItem';
import type {BillingStatusResult} from './utils';
import CardSectionUtils from './utils';

function CardSection() {
    const [isRequestRefundModalVisible, setIsRequestRefundModalVisible] = useState(false);
    const {translate, preferredLocale} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);
    const [privateStripeCustomerID] = useOnyx(ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID);
    const [authenticationLink] = useOnyx(ONYXKEYS.VERIFY_3DS_SUBSCRIPTION);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const subscriptionPlan = useSubscriptionPlan();
    const [subscriptionRetryBillingStatusPending] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_PENDING);
    const [subscriptionRetryBillingStatusSuccessful] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL);
    const [subscriptionRetryBillingStatusFailed] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED);
    const {isOffline} = useNetwork();
    const defaultCard = useMemo(() => Object.values(fundList ?? {}).find((card) => card.accountData?.additionalData?.isBillingCard), [fundList]);
    const cardMonth = useMemo(() => DateUtils.getMonthNames(preferredLocale)[(defaultCard?.accountData?.cardMonth ?? 1) - 1], [defaultCard?.accountData?.cardMonth, preferredLocale]);

    const requestRefund = useCallback(() => {
        User.requestRefund();
        setIsRequestRefundModalVisible(false);
        Navigation.resetToHome();
    }, []);

    const viewPurchases = useCallback(() => {
        const query = SearchUtils.buildQueryStringFromFilterValues({merchant: CONST.EXPENSIFY_MERCHANT});
        Navigation.navigate(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query}));
    }, []);

    const [billingStatus, setBillingStatus] = useState<BillingStatusResult | undefined>(CardSectionUtils.getBillingStatus(translate, defaultCard?.accountData ?? {}));

    const nextPaymentDate = !isEmptyObject(privateSubscription) ? CardSectionUtils.getNextBillingDate() : undefined;

    const sectionSubtitle = defaultCard && !!nextPaymentDate ? translate('subscription.cardSection.cardNextPayment', {nextPaymentDate}) : translate('subscription.cardSection.subtitle');

    useEffect(() => {
        setBillingStatus(CardSectionUtils.getBillingStatus(translate, defaultCard?.accountData ?? {}));
    }, [subscriptionRetryBillingStatusPending, subscriptionRetryBillingStatusSuccessful, subscriptionRetryBillingStatusFailed, translate, defaultCard?.accountData, privateStripeCustomerID]);

    const handleRetryPayment = () => {
        Subscription.clearOutstandingBalance();
    };

    useEffect(() => {
        if (!authenticationLink || privateStripeCustomerID?.status !== CONST.STRIPE_GBP_AUTH_STATUSES.CARD_AUTHENTICATION_REQUIRED) {
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD);
    }, [authenticationLink, privateStripeCustomerID?.status]);

    const handleAuthenticatePayment = () => {
        PaymentMethods.verifySetupIntent(session?.accountID ?? -1, false);
    };

    const handleBillingBannerClose = () => {
        setBillingStatus(undefined);
    };

    let BillingBanner: React.ReactNode | undefined;
    if (SubscriptionUtils.shouldShowPreTrialBillingBanner()) {
        BillingBanner = <PreTrialBillingBanner />;
    } else if (SubscriptionUtils.isUserOnFreeTrial()) {
        BillingBanner = <TrialStartedBillingBanner />;
    } else if (SubscriptionUtils.hasUserFreeTrialEnded()) {
        BillingBanner = <TrialEndedBillingBanner />;
    }
    if (billingStatus) {
        BillingBanner = (
            <SubscriptionBillingBanner
                title={billingStatus.title}
                subtitle={billingStatus.subtitle}
                isError={billingStatus.isError}
                icon={billingStatus.icon}
                rightIcon={billingStatus.rightIcon}
                onRightIconPress={handleBillingBannerClose}
                rightIconAccessibilityLabel={translate('common.close')}
            />
        );
    }

    return (
        <>
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
                        <View style={[styles.flexRow, styles.flex1, styles.gap3]}>
                            <Icon
                                src={Expensicons.CreditCard}
                                additionalStyles={styles.subscriptionAddedCardIcon}
                                fill={theme.icon}
                                medium
                            />
                            <View style={styles.flex1}>
                                <Text style={styles.textStrong}>{getPaymentMethodDescription(defaultCard?.accountType, defaultCard?.accountData)}</Text>
                                <Text style={styles.mutedNormalTextLabel}>
                                    {translate('subscription.cardSection.cardInfo', {
                                        name: defaultCard?.accountData?.addressName,
                                        expiration: `${cardMonth} ${defaultCard?.accountData?.cardYear}`,
                                        currency: defaultCard?.accountData?.currency,
                                    })}
                                </Text>
                            </View>
                            <CardSectionActions />
                        </View>
                    )}
                </View>

                <View style={styles.mb3}>{isEmptyObject(defaultCard?.accountData) && <CardSectionDataEmpty />}</View>
                {billingStatus?.isRetryAvailable !== undefined && (
                    <Button
                        text={translate('subscription.cardSection.retryPaymentButton')}
                        isDisabled={isOffline || !billingStatus?.isRetryAvailable}
                        isLoading={subscriptionRetryBillingStatusPending}
                        onPress={handleRetryPayment}
                        style={[styles.w100, styles.mb3]}
                        large
                    />
                )}
                {SubscriptionUtils.hasCardAuthenticatedError() && (
                    <Button
                        text={translate('subscription.cardSection.authenticatePayment')}
                        isDisabled={isOffline || !billingStatus?.isAuthenticationRequired}
                        isLoading={subscriptionRetryBillingStatusPending}
                        onPress={handleAuthenticatePayment}
                        style={[styles.w100, styles.mt5]}
                        large
                    />
                )}

                {!!account?.hasPurchases && (
                    <MenuItem
                        shouldShowRightIcon
                        icon={Expensicons.History}
                        wrapperStyle={styles.sectionMenuItemTopDescription}
                        title={translate('subscription.cardSection.viewPaymentHistory')}
                        titleStyle={styles.textStrong}
                        onPress={viewPurchases}
                    />
                )}

                {!!(subscriptionPlan && account?.isEligibleForRefund) && (
                    <MenuItem
                        shouldShowRightIcon
                        icon={Expensicons.Bill}
                        wrapperStyle={styles.sectionMenuItemTopDescription}
                        title={translate('subscription.cardSection.requestRefund')}
                        titleStyle={styles.textStrong}
                        disabled={isOffline}
                        onPress={() => setIsRequestRefundModalVisible(true)}
                    />
                )}

                {privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL && <RequestEarlyCancellationMenuItem />}
            </Section>

            {account?.isEligibleForRefund && (
                <ConfirmModal
                    title={translate('subscription.cardSection.requestRefund')}
                    isVisible={isRequestRefundModalVisible}
                    onConfirm={requestRefund}
                    onCancel={() => setIsRequestRefundModalVisible(false)}
                    prompt={
                        <>
                            <Text style={styles.mb4}>{translate('subscription.cardSection.requestRefundModal.phrase1')}</Text>
                            <Text>{translate('subscription.cardSection.requestRefundModal.phrase2')}</Text>
                        </>
                    }
                    confirmText={translate('subscription.cardSection.requestRefundModal.confirm')}
                    cancelText={translate('common.cancel')}
                    danger
                />
            )}
        </>
    );
}

CardSection.displayName = 'CardSection';

export default CardSection;
