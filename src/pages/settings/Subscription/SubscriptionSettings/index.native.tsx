import React from 'react';
import {View} from 'react-native';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OptionItem from '@components/OptionsPicker/OptionItem';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useEnvironment from '@hooks/useEnvironment';
import useHasTeam2025Pricing from '@hooks/useHasTeam2025Pricing';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePreferredCurrency from '@hooks/usePreferredCurrency';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {openLink} from '@libs/actions/Link';
import {convertToShortDisplayString} from '@libs/CurrencyUtils';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import {getSubscriptionPrice, isSubscriptionTypeOfInvoicing} from '@libs/SubscriptionUtils';
import Navigation from '@navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SubscriptionSettings() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const privateSubscription = usePrivateSubscription();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const activePolicy = usePolicy(activePolicyID);
    const {environmentURL} = useEnvironment();
    const isActivePolicyAdmin = isPolicyAdmin(activePolicy);
    const subscriptionPlan = useSubscriptionPlan();
    const preferredCurrency = usePreferredCurrency();
    const themeIllustrations = useThemeIllustrations();
    const isAnnual = privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL;
    const hasTeam2025Pricing = useHasTeam2025Pricing();
    const subscriptionPrice = getSubscriptionPrice(subscriptionPlan, preferredCurrency, privateSubscription?.type, hasTeam2025Pricing);
    const illustrations = useMemoizedLazyIllustrations(['SubscriptionAnnual', 'SubscriptionPPU']);
    const priceDetails = translate(`subscription.yourPlan.${subscriptionPlan === CONST.POLICY.TYPE.CORPORATE ? 'control' : 'collect'}.${isAnnual ? 'priceAnnual' : 'pricePayPerUse'}`, {
        lower: convertToShortDisplayString(subscriptionPrice, preferredCurrency),
        upper: convertToShortDisplayString(subscriptionPrice * CONST.SUBSCRIPTION_PRICE_FACTOR, preferredCurrency),
    });
    const adminsChatReportID = isActivePolicyAdmin && activePolicy?.chatReportIDAdmins ? activePolicy.chatReportIDAdmins?.toString() : undefined;

    const openAdminsRoom = () => {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(adminsChatReportID));
    };

    const handleLinkPress = (href: string) => {
        if (href.endsWith('adminsRoom')) {
            if (adminsChatReportID) {
                openAdminsRoom();
            }
        } else if (href.endsWith(CONST.PRICING)) {
            openLink(CONST.PRICING, environmentURL);
        }
    };

    const subscriptionSizeSection =
        privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL && privateSubscription?.userCount ? (
            <MenuItemWithTopDescription
                description={translate('subscription.details.subscriptionSize')}
                title={`${privateSubscription?.userCount}`}
                wrapperStyle={styles.sectionMenuItemTopDescription}
                style={styles.mt5}
            />
        ) : null;

    if (isSubscriptionTypeOfInvoicing(privateSubscription?.type)) {
        return <NotFoundPage />;
    }

    if (!privateSubscription) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            testID="SubscriptionSettings"
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('subscription.subscriptionSettings.title')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.ph5]}>
                <Text style={[styles.textSupporting, styles.mb5]}>{translate('subscription.mobileReducedFunctionalityMessage')}</Text>
                <Text style={[styles.textSupporting, styles.mb5]}>{translate('subscription.subscriptionSettings.pricingConfiguration')}</Text>
                <View style={[styles.renderHTML, styles.mb5]}>
                    <RenderHTML
                        html={translate('subscription.subscriptionSettings.learnMore', {hasAdminsRoom: !!adminsChatReportID})}
                        onLinkPress={(_evt, href) => handleLinkPress(href)}
                    />
                </View>
                <Text style={styles.mutedNormalTextLabel}>{translate('subscription.subscriptionSettings.estimatedPrice')}</Text>
                <Text style={styles.mv1}>{priceDetails}</Text>
                <Text style={styles.mutedNormalTextLabel}>{translate('subscription.subscriptionSettings.changesBasedOn')}</Text>
                {!!account?.isApprovedAccountant || !!account?.isApprovedAccountantClient ? (
                    <View style={[styles.borderedContentCard, styles.p5, styles.mt5]}>
                        <Icon
                            src={themeIllustrations.ExpensifyApprovedLogo}
                            width={variables.modalTopIconWidth}
                            height={variables.menuIconSize}
                        />
                        <Text style={[styles.textLabelSupporting, styles.mt2]}>{translate('subscription.details.zeroCommitment')}</Text>
                    </View>
                ) : (
                    <>
                        {privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.PAY_PER_USE ? (
                            <OptionItem
                                title="subscription.details.payPerUse"
                                icon={illustrations.SubscriptionPPU}
                                style={[styles.mt5, styles.flex0]}
                                isDisabled
                            />
                        ) : (
                            <OptionItem
                                title="subscription.details.annual"
                                icon={illustrations.SubscriptionAnnual}
                                style={[styles.mt5, styles.flex0]}
                                isDisabled
                            />
                        )}
                        {subscriptionSizeSection}
                    </>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

export default SubscriptionSettings;
