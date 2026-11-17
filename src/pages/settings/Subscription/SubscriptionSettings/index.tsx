import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import MenuItemSectionRoot from '@components/MenuItem/presets/MenuItemSectionRoot';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import OptionsPicker from '@components/OptionsPicker';
import type {OptionsPickerItem} from '@components/OptionsPicker';
import OptionItem from '@components/OptionsPicker/OptionItem';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
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
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import {getSubscriptionPrice, isSubscriptionTypeOfInvoicing, shouldUseSimplifiedCollectSubscriptionUI} from '@libs/SubscriptionUtils';

import Navigation from '@navigation/Navigation';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import variables from '@styles/variables';

import {updateSubscriptionType} from '@userActions/Subscription';

import CONST from '@src/CONST';
import type {SubscriptionType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import {authTokenTypeSelector} from '@selectors/Session';
import {View} from 'react-native';

function SubscriptionSettings() {
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const privateSubscription = usePrivateSubscription();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const activePolicy = usePolicy(activePolicyID);
    const isActivePolicyAdmin = isPolicyAdmin(activePolicy);
    const subscriptionPlan = useSubscriptionPlan();
    const hasTeam2025Pricing = useHasTeam2025Pricing();
    const preferredCurrency = usePreferredCurrency();
    const themeIllustrations = useThemeIllustrations();
    const {isActingAsDelegate} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const isAnnual = privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL;
    const [freebieCredits] = useOnyx(ONYXKEYS.NVP_PRIVATE_FREEBIE_CREDITS);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const defaultCard = Object.values(fundList ?? {}).find((card) => card.accountData?.additionalData?.isBillingCard);
    const subscriptionPrice = getSubscriptionPrice(subscriptionPlan, preferredCurrency, privateSubscription?.type, hasTeam2025Pricing);
    const priceDetails = translate(
        `subscription.yourPlan.${subscriptionPlan === CONST.POLICY.TYPE.CORPORATE ? 'control' : 'collect'}.${isAnnual ? 'priceAnnual' : 'pricePayPerUse'}`,
        convertToShortDisplayString(subscriptionPrice, preferredCurrency),
        convertToShortDisplayString(subscriptionPrice * CONST.SUBSCRIPTION_PRICE_FACTOR, preferredCurrency),
    );
    const adminsChatReportID = isActivePolicyAdmin && activePolicy?.chatReportIDAdmins ? activePolicy.chatReportIDAdmins?.toString() : undefined;
    const shouldUseSimplifiedCollectUI = shouldUseSimplifiedCollectSubscriptionUI(subscriptionPlan, hasTeam2025Pricing);
    const collectPriceDisplay = convertToShortDisplayString(subscriptionPrice, preferredCurrency);

    const onOptionSelected = (option: SubscriptionType) => {
        if (privateSubscription?.type !== option && isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        if (privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL && option === CONST.SUBSCRIPTION.TYPE.PAY_PER_USE && !account?.canDowngrade) {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.SUBSCRIPTION_DOWNGRADE_BLOCKED.path));
            return;
        }

        updateSubscriptionType(option);
    };

    const illustrations = useMemoizedLazyIllustrations(['SubscriptionAnnual', 'SubscriptionPPU']);

    const options: Array<OptionsPickerItem<SubscriptionType>> = [
        {
            key: CONST.SUBSCRIPTION.TYPE.ANNUAL,
            title: 'subscription.details.annual',
            icon: illustrations.SubscriptionAnnual,
        },
        {
            key: CONST.SUBSCRIPTION.TYPE.PAY_PER_USE,
            title: 'subscription.details.payPerUse',
            icon: illustrations.SubscriptionPPU,
        },
    ];

    const openAdminsRoom = () => {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(adminsChatReportID));
    };

    const handleLinkPress = (href: string) => {
        if (href.endsWith('adminsRoom')) {
            if (adminsChatReportID) {
                openAdminsRoom();
            }
        } else if (href.endsWith(CONST.PRICING)) {
            openLink(CONST.PRICING, environmentURL, false, session);
        }
    };

    if (!subscriptionPlan || isSubscriptionTypeOfInvoicing(privateSubscription?.type)) {
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
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.ph5, styles.pb5]}>
                {shouldUseSimplifiedCollectUI ? (
                    <>
                        <Text style={[styles.textSupporting, styles.mb5]}>{translate('subscription.subscriptionSettings.collectBillingDescription')}</Text>
                        <View style={[styles.renderHTML, styles.mb5]}>
                            <RenderHTML
                                html={translate('subscription.subscriptionSettings.learnMore', !!adminsChatReportID)}
                                onLinkPress={(_evt, href) => handleLinkPress(href)}
                            />
                        </View>
                        <Text style={styles.mutedNormalTextLabel}>{translate('subscription.subscriptionSettings.pricing')}</Text>
                        <Text style={styles.mv1}>{translate('subscription.yourPlan.pricePerMemberPerMonth', collectPriceDisplay)}</Text>
                        <View style={[styles.mt5, styles.mb5]}>
                            <OptionItem
                                title="subscription.details.payPerUse"
                                icon={illustrations.SubscriptionPPU}
                                style={styles.flex0}
                                isSelected
                                isDisabled
                            />
                        </View>
                    </>
                ) : (
                    <>
                        <Text style={[styles.textSupporting, styles.mb5]}>{translate('subscription.subscriptionSettings.pricingConfiguration')}</Text>
                        <View style={[styles.renderHTML, styles.mb5]}>
                            <RenderHTML
                                html={translate('subscription.subscriptionSettings.learnMore', !!adminsChatReportID)}
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
                            <OfflineWithFeedback pendingAction={privateSubscription?.pendingFields?.type}>
                                <OptionsPicker
                                    options={options}
                                    selectedOption={privateSubscription?.type ?? CONST.SUBSCRIPTION.TYPE.ANNUAL}
                                    onOptionSelected={onOptionSelected}
                                    style={styles.mt5}
                                />
                            </OfflineWithFeedback>
                        )}
                    </>
                )}
                {!!freebieCredits && freebieCredits > 0 && (
                    <MenuItemSectionRoot>
                        <MenuItemField.Row
                            name={translate('subscription.details.creditBalance')}
                            value={convertToDisplayString(freebieCredits, defaultCard?.accountData?.currency ?? CONST.CURRENCY.USD)}
                        />
                    </MenuItemSectionRoot>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

export default SubscriptionSettings;
