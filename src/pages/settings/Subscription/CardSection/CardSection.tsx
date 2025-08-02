import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import RenderHTML from '@components/RenderHTML';
import Section from '@components/Section';
import Text from '@components/Text';
import useHasTeam2025Pricing from '@hooks/useHasTeam2025Pricing';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {requestRefund as requestRefundByUser} from '@libs/actions/User';
import DateUtils from '@libs/DateUtils';
import getPlatform from '@libs/getPlatform';
import Navigation from '@libs/Navigation/Navigation';
import {getPaymentMethodDescription} from '@libs/PaymentUtils';
import {buildQueryStringFromFilterFormValues} from '@libs/SearchQueryUtils';
import {hasCardAuthenticatedError, hasUserFreeTrialEnded, isUserOnFreeTrial, shouldShowDiscountBanner, shouldShowPreTrialBillingBanner} from '@libs/SubscriptionUtils';
import {verifySetupIntent} from '@userActions/PaymentMethods';
import {clearOutstandingBalance} from '@userActions/Subscription';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import EarlyDiscountBanner from './BillingBanner/EarlyDiscountBanner';
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
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION, {canBeMissing: true});
    const [privateStripeCustomerID] = useOnyx(ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID, {canBeMissing: true});
    const [authenticationLink] = useOnyx(ONYXKEYS.VERIFY_3DS_SUBSCRIPTION, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST, {canBeMissing: true});
    const [purchaseList] = useOnyx(ONYXKEYS.PURCHASE_LIST, {canBeMissing: true});
    const hasTeam2025Pricing = useHasTeam2025Pricing();
    const subscriptionPlan = useSubscriptionPlan();
    const [subscriptionRetryBillingStatusPending] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_PENDING, {canBeMissing: true});
    const [subscriptionRetryBillingStatusSuccessful] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL, {canBeMissing: true});
    const [subscriptionRetryBillingStatusFailed] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED, {canBeMissing: true});
    const {isOffline} = useNetwork();
    const defaultCard = useMemo(() => Object.values(fundList ?? {}).find((card) => card.accountData?.additionalData?.isBillingCard), [fundList]);
    const cardMonth = useMemo(() => DateUtils.getMonthNames()[(defaultCard?.accountData?.cardMonth ?? 1) - 1], [defaultCard?.accountData?.cardMonth]);
    const platform = getPlatform();
    const isNative = platform === CONST.PLATFORM.ANDROID || platform === CONST.PLATFORM.IOS;

    const requestRefund = useCallback(() => {
        requestRefundByUser();
        setIsRequestRefundModalVisible(false);
        Navigation.goBackToHome();
    }, []);

    const viewPurchases = useCallback(() => {
        const query = buildQueryStringFromFilterFormValues({merchant: CONST.EXPENSIFY_MERCHANT});
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query}));
    }, []);

    const [billingStatus, setBillingStatus] = useState<BillingStatusResult | undefined>(() =>
        CardSectionUtils.getBillingStatus({translate, accountData: defaultCard?.accountData ?? {}, purchase: purchaseList?.[0]}),
    );

    const nextPaymentDate = !isEmptyObject(privateSubscription) ? CardSectionUtils.getNextBillingDate() : undefined;

    const sectionSubtitle = defaultCard && !!nextPaymentDate ? translate('subscription.cardSection.cardNextPayment', {nextPaymentDate}) : translate('subscription.cardSection.subtitle');

    useEffect(() => {
        setBillingStatus(
            CardSectionUtils.getBillingStatus({
                translate,
                accountData: defaultCard?.accountData ?? {},
                purchase: purchaseList?.[0],
            }),
        );
    }, [
        subscriptionRetryBillingStatusPending,
        subscriptionRetryBillingStatusSuccessful,
        subscriptionRetryBillingStatusFailed,
        translate,
        defaultCard?.accountData,
        privateStripeCustomerID,
        purchaseList,
    ]);

    const handleRetryPayment = () => {
        clearOutstandingBalance();
    };

    useEffect(() => {
        if (!authenticationLink || privateStripeCustomerID?.status !== CONST.STRIPE_SCA_AUTH_STATUSES.CARD_AUTHENTICATION_REQUIRED) {
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD);
    }, [authenticationLink, privateStripeCustomerID?.status]);

    const handleAuthenticatePayment = () => {
        verifySetupIntent(session?.accountID ?? CONST.DEFAULT_NUMBER_ID, false);
    };

    const handleBillingBannerClose = () => {
        setBillingStatus(undefined);
    };

    let BillingBanner: React.ReactNode | undefined;
    if (shouldShowDiscountBanner(hasTeam2025Pricing, subscriptionPlan)) {
        BillingBanner = <EarlyDiscountBanner isSubscriptionPage />;
    } else if (shouldShowPreTrialBillingBanner()) {
        BillingBanner = <PreTrialBillingBanner />;
    } else if (isUserOnFreeTrial()) {
        BillingBanner = <TrialStartedBillingBanner />;
    } else if (hasUserFreeTrialEnded()) {
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
                                        name: defaultCard?.accountData?.addressName ?? '',
                                        expiration: `${cardMonth} ${defaultCard?.accountData?.cardYear}`,
                                        currency: defaultCard?.accountData?.currency ?? '',
                                    })}
                                </Text>
                            </View>
                            <CardSectionActions />
                        </View>
                    )}
                </View>

                <View style={styles.mb3}>{isEmptyObject(defaultCard?.accountData) && <CardSectionDataEmpty />}</View>
                {billingStatus?.isRetryAvailable !== undefined && !isNative && (
                    <Button
                        text={translate('subscription.cardSection.retryPaymentButton')}
                        isDisabled={isOffline || !billingStatus?.isRetryAvailable}
                        isLoading={subscriptionRetryBillingStatusPending}
                        onPress={handleRetryPayment}
                        style={[styles.w100, styles.mb3]}
                        large
                    />
                )}
                {hasCardAuthenticatedError() && !isNative && (
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

                {!!(privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL && account?.hasPurchases) && <RequestEarlyCancellationMenuItem />}
            </Section>

            {!!account?.isEligibleForRefund && (
                <ConfirmModal
                    title={translate('subscription.cardSection.requestRefund')}
                    isVisible={isRequestRefundModalVisible}
                    onConfirm={requestRefund}
                    onCancel={() => setIsRequestRefundModalVisible(false)}
                    prompt={<RenderHTML html={translate('subscription.cardSection.requestRefundModal.full')} />}
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
