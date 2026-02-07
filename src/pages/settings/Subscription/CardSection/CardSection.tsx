import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import RenderHTML from '@components/RenderHTML';
import Section from '@components/Section';
import Text from '@components/Text';
import useHasTeam2025Pricing from '@hooks/useHasTeam2025Pricing';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {requestRefund as requestRefundByUser} from '@libs/actions/User';
import DateUtils from '@libs/DateUtils';
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
import CardSectionButton from './CardSectionButton';
import CardSectionDataEmpty from './CardSectionDataEmpty';
import getSectionSubtitle from './CardSectionSubtitle';
import RequestEarlyCancellationMenuItem from './RequestEarlyCancellationMenuItem';
import type {BillingStatusResult} from './utils';
import CardSectionUtils from './utils';

function CardSection() {
    const [isRequestRefundModalVisible, setIsRequestRefundModalVisible] = useState(false);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['History', 'Bill', 'CreditCard']);
    const illustrations = useMemoizedLazyIllustrations(['CreditCardEyes']);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const privateSubscription = usePrivateSubscription();
    const [privateStripeCustomerID] = useOnyx(ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID, {canBeMissing: true});
    const [authenticationLink] = useOnyx(ONYXKEYS.VERIFY_3DS_SUBSCRIPTION, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST, {canBeMissing: true});
    const [purchaseList] = useOnyx(ONYXKEYS.PURCHASE_LIST, {canBeMissing: true});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const hasTeam2025Pricing = useHasTeam2025Pricing();
    const subscriptionPlan = useSubscriptionPlan();
    const [subscriptionRetryBillingStatusPending] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_PENDING, {canBeMissing: true});
    const [subscriptionRetryBillingStatusSuccessful] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL, {canBeMissing: true});
    const [subscriptionRetryBillingStatusFailed] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED, {canBeMissing: true});
    const {isOffline} = useNetwork();
    const defaultCard = useMemo(() => Object.values(fundList ?? {}).find((card) => card.accountData?.additionalData?.isBillingCard), [fundList]);
    const cardMonth = useMemo(() => DateUtils.getMonthNames()[(defaultCard?.accountData?.cardMonth ?? 1) - 1], [defaultCard?.accountData?.cardMonth]);
    const hasFailedLastBilling = useMemo(
        () => purchaseList?.[0]?.message.billingType === CONST.BILLING.TYPE_STRIPE_FAILED_AUTHENTICATION || purchaseList?.[0]?.message.billingType === CONST.BILLING.TYPE_FAILED_2018,
        [purchaseList],
    );
    const [firstDayFreeTrial] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, {canBeMissing: true});
    const [lastDayFreeTrial] = useOnyx(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, {canBeMissing: true});
    const [billingDisputePending] = useOnyx(ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING, {canBeMissing: true});
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID, {canBeMissing: true});
    const [billingStatusOnyx] = useOnyx(ONYXKEYS.NVP_PRIVATE_BILLING_STATUS, {canBeMissing: true});
    const [amountOwed = 0] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, {canBeMissing: true});
    const requestRefund = useCallback(() => {
        requestRefundByUser();
        setIsRequestRefundModalVisible(false);
        Navigation.goBackToHome();
    }, []);

    const viewPurchases = useCallback(() => {
        const query = buildQueryStringFromFilterFormValues({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            merchant: CONST.EXPENSIFY_MERCHANT,
        });

        // rawQuery is needed to populate rawFilterList, which prevents useSuggestedSearchDefaultNavigation from auto-redirecting to actionable searches.
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query, rawQuery: query}));
    }, []);

    const [billingStatus, setBillingStatus] = useState<BillingStatusResult | undefined>(() =>
        CardSectionUtils.getBillingStatus({
            translate,
            stripeCustomerId: privateStripeCustomerID,
            accountData: defaultCard?.accountData ?? {},
            purchase: purchaseList?.[0],
            retryBillingSuccessful: subscriptionRetryBillingStatusSuccessful,
            billingDisputePending,
            retryBillingFailed: subscriptionRetryBillingStatusFailed,
            billingStatus: billingStatusOnyx,
            creditCardEyesIcon: illustrations.CreditCardEyes,
            fundList,
            amountOwed,
        }),
    );

    const nextPaymentDate = !isEmptyObject(privateSubscription) ? CardSectionUtils.getNextBillingDate() : undefined;

    const sectionSubtitle = getSectionSubtitle({
        translate,
        hasDefaultCard: !!defaultCard,
        nextPaymentDate,
    });

    useEffect(() => {
        setBillingStatus(
            CardSectionUtils.getBillingStatus({
                translate,
                stripeCustomerId: privateStripeCustomerID,
                accountData: defaultCard?.accountData ?? {},
                purchase: purchaseList?.[0],
                retryBillingSuccessful: subscriptionRetryBillingStatusSuccessful,
                billingDisputePending,
                retryBillingFailed: subscriptionRetryBillingStatusFailed,
                billingStatus: billingStatusOnyx,
                creditCardEyesIcon: illustrations.CreditCardEyes,
                fundList,
                amountOwed,
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
        billingDisputePending,
        billingStatusOnyx,
        illustrations.CreditCardEyes,
        fundList,
        amountOwed,
    ]);

    const handleRetryPayment = () => {
        clearOutstandingBalance();
    };

    useEffect(() => {
        if (!authenticationLink || (privateStripeCustomerID?.status !== CONST.STRIPE_SCA_AUTH_STATUSES.CARD_AUTHENTICATION_REQUIRED && !hasFailedLastBilling)) {
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD);
    }, [authenticationLink, privateStripeCustomerID?.status, hasFailedLastBilling]);

    const handleAuthenticatePayment = () => {
        verifySetupIntent(session?.accountID ?? CONST.DEFAULT_NUMBER_ID, false);
    };

    const handleBillingBannerClose = () => {
        setBillingStatus(undefined);
    };

    let BillingBanner: React.ReactNode | undefined;
    if (shouldShowDiscountBanner(hasTeam2025Pricing, subscriptionPlan, firstDayFreeTrial, lastDayFreeTrial, userBillingFundID)) {
        BillingBanner = <EarlyDiscountBanner isSubscriptionPage />;
    } else if (shouldShowPreTrialBillingBanner(introSelected, firstDayFreeTrial, lastDayFreeTrial)) {
        BillingBanner = <PreTrialBillingBanner />;
    } else if (isUserOnFreeTrial(firstDayFreeTrial, lastDayFreeTrial)) {
        BillingBanner = <TrialStartedBillingBanner />;
    } else if (hasUserFreeTrialEnded(lastDayFreeTrial)) {
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
                                src={expensifyIcons.CreditCard}
                                additionalStyles={styles.subscriptionAddedCardIcon}
                                fill={theme.icon}
                                medium
                            />
                            <View style={styles.flex1}>
                                <Text style={styles.textStrong}>{getPaymentMethodDescription(defaultCard?.accountType, defaultCard?.accountData, translate)}</Text>
                                <Text style={styles.mutedNormalTextLabel}>
                                    {translate(
                                        'subscription.cardSection.cardInfo',
                                        defaultCard?.accountData?.addressName ?? '',
                                        `${cardMonth} ${defaultCard?.accountData?.cardYear}`,
                                        defaultCard?.accountData?.currency ?? '',
                                    )}
                                </Text>
                            </View>
                            <CardSectionActions />
                        </View>
                    )}
                </View>

                <View style={styles.mb3}>{isEmptyObject(defaultCard?.accountData) && <CardSectionDataEmpty />}</View>
                {billingStatus?.isRetryAvailable !== undefined && (
                    <CardSectionButton
                        text={translate('subscription.cardSection.retryPaymentButton')}
                        isDisabled={isOffline || !billingStatus?.isRetryAvailable}
                        isLoading={subscriptionRetryBillingStatusPending}
                        onPress={handleRetryPayment}
                        style={[styles.w100, styles.mb3]}
                        large
                    />
                )}
                {hasCardAuthenticatedError(privateStripeCustomerID, amountOwed) && (
                    <CardSectionButton
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
                        icon={expensifyIcons.History}
                        wrapperStyle={styles.sectionMenuItemTopDescription}
                        title={translate('subscription.cardSection.viewPaymentHistory')}
                        titleStyle={styles.textStrong}
                        onPress={viewPurchases}
                    />
                )}

                {!!(subscriptionPlan && account?.isEligibleForRefund) && (
                    <MenuItem
                        shouldShowRightIcon
                        icon={expensifyIcons.Bill}
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
                    prompt={
                        <View style={[styles.flexRow]}>
                            <RenderHTML html={translate('subscription.cardSection.requestRefundModal.full')} />
                        </View>
                    }
                    confirmText={translate('subscription.cardSection.requestRefundModal.confirm')}
                    cancelText={translate('common.cancel')}
                    danger
                />
            )}
        </>
    );
}

export default CardSection;
