import React, {useContext} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {View} from 'react-native';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import OptionsPicker from '@components/OptionsPicker';
import type {OptionsPickerItem} from '@components/OptionsPicker';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useHasTeam2025Pricing from '@hooks/useHasTeam2025Pricing';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePreferredCurrency from '@hooks/usePreferredCurrency';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useSubscriptionPossibleCostSavings from '@hooks/useSubscriptionPossibleCostSavings';
import useTheme from '@hooks/useTheme';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToShortDisplayString} from '@libs/CurrencyUtils';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import {getSubscriptionPrice} from '@libs/SubscriptionUtils';
import Navigation from '@navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import {formatSubscriptionEndDate} from '@pages/settings/Subscription/utils';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import variables from '@styles/variables';
import {navigateToConciergeChat} from '@userActions/Report';
import {clearUpdateSubscriptionSizeError, requestTaxExempt, updateSubscriptionAddNewUsersAutomatically, updateSubscriptionAutoRenew, updateSubscriptionType} from '@userActions/Subscription';
import CONST from '@src/CONST';
import type {SubscriptionType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SubscriptionSettings() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const privateSubscription = usePrivateSubscription();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const activePolicy = usePolicy(activePolicyID);
    const isActivePolicyAdmin = isPolicyAdmin(activePolicy);
    const subscriptionPlan = useSubscriptionPlan();
    const hasTeam2025Pricing = useHasTeam2025Pricing();
    const preferredCurrency = usePreferredCurrency();
    const themeIllustrations = useThemeIllustrations();
    const possibleCostSavings = useSubscriptionPossibleCostSavings();
    const {isActingAsDelegate, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const isAnnual = privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL;
    const [privateTaxExempt] = useOnyx(ONYXKEYS.NVP_PRIVATE_TAX_EXEMPT, {canBeMissing: true});
    const subscriptionPrice = getSubscriptionPrice(subscriptionPlan, preferredCurrency, privateSubscription?.type, hasTeam2025Pricing);
    const priceDetails = translate(`subscription.yourPlan.${subscriptionPlan === CONST.POLICY.TYPE.CORPORATE ? 'control' : 'collect'}.${isAnnual ? 'priceAnnual' : 'pricePayPerUse'}`, {
        lower: convertToShortDisplayString(subscriptionPrice, preferredCurrency),
        upper: convertToShortDisplayString(subscriptionPrice * CONST.SUBSCRIPTION_PRICE_FACTOR, preferredCurrency),
    });
    const adminsChatReportID = isActivePolicyAdmin && activePolicy?.chatReportIDAdmins ? activePolicy.chatReportIDAdmins.toString() : undefined;

    const onOptionSelected = (option: SubscriptionType) => {
        if (privateSubscription?.type !== option && isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        if (privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL && option === CONST.SUBSCRIPTION.TYPE.PAY_PER_USE && !account?.canDowngrade) {
            Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_SIZE.getRoute(0));
            return;
        }

        updateSubscriptionType(option);
    };

    const onSubscriptionSizePress = () => {
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_SIZE.getRoute(1));
    };
    const illustrations = useMemoizedLazyIllustrations(['SubscriptionAnnual', 'SubscriptionPPU'] as const);

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

    // This section is only shown when the subscription is annual
    const subscriptionSizeSection: React.JSX.Element | null =
        privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL ? (
            <>
                <OfflineWithFeedback
                    pendingAction={privateSubscription?.pendingFields?.userCount}
                    errors={privateSubscription?.errorFields?.userCount}
                    onClose={() => {
                        clearUpdateSubscriptionSizeError();
                    }}
                >
                    <MenuItemWithTopDescription
                        description={translate('subscription.details.subscriptionSize')}
                        shouldShowRightIcon
                        onPress={onSubscriptionSizePress}
                        wrapperStyle={styles.sectionMenuItemTopDescription}
                        style={styles.mt5}
                        title={`${privateSubscription?.userCount ?? ''}`}
                    />
                </OfflineWithFeedback>
                {!privateSubscription?.userCount && <Text style={[styles.mt2, styles.textLabelSupporting, styles.textLineHeightNormal]}>{translate('subscription.details.headsUp')}</Text>}
            </>
        ) : null;

    const autoRenewalDate = formatSubscriptionEndDate(privateSubscription?.endDate);

    const handleAutoRenewToggle = () => {
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        if (!privateSubscription?.autoRenew) {
            updateSubscriptionAutoRenew(true);
            return;
        }
        if (account?.hasPurchases) {
            Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_DISABLE_AUTO_RENEW_SURVEY);
        } else {
            updateSubscriptionAutoRenew(false);
        }
    };

    const handleAutoIncreaseToggle = () => {
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        updateSubscriptionAddNewUsersAutomatically(!privateSubscription?.addNewUsersAutomatically);
    };

    const customTitleSecondSentenceStyles: StyleProp<TextStyle> = [styles.textNormal, {color: theme.success}];
    const customTitle = (
        <Text>
            <Text style={[styles.mr1, styles.textNormalThemeText]}>{translate('subscription.subscriptionSettings.autoIncrease')}</Text>
            <Text style={customTitleSecondSentenceStyles}>
                {translate('subscription.subscriptionSettings.saveUpTo', {
                    amountWithCurrency: convertToShortDisplayString(possibleCostSavings, preferredCurrency),
                })}
            </Text>
        </Text>
    );

    const openAdminsRoom = () => {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(adminsChatReportID));
    };

    if (!subscriptionPlan || (hasTeam2025Pricing && subscriptionPlan === CONST.POLICY.TYPE.TEAM)) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            testID={SubscriptionSettings.displayName}
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('subscription.subscriptionSettings.title')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.ph5]}>
                <Text style={[styles.textSupporting, styles.mb5]}>{translate('subscription.subscriptionSettings.pricingConfiguration')}</Text>
                <Text style={[styles.textSupporting, styles.mb5]}>
                    {translate('subscription.subscriptionSettings.learnMore.part1')}
                    <TextLink href={CONST.PRICING}>{translate('subscription.subscriptionSettings.learnMore.pricingPage')}</TextLink>
                    {translate('subscription.subscriptionSettings.learnMore.part2')}
                    {adminsChatReportID ? (
                        <TextLink onPress={openAdminsRoom}>{translate('subscription.subscriptionSettings.learnMore.adminsRoom')}</TextLink>
                    ) : (
                        translate('subscription.subscriptionSettings.learnMore.adminsRoom')
                    )}
                </Text>
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
                        {subscriptionSizeSection}
                    </OfflineWithFeedback>
                )}
                {isAnnual ? (
                    <>
                        <OfflineWithFeedback pendingAction={privateSubscription?.pendingFields?.autoRenew}>
                            <View style={styles.mt5}>
                                <ToggleSettingOptionRow
                                    title={translate('subscription.subscriptionSettings.autoRenew')}
                                    switchAccessibilityLabel={translate('subscription.subscriptionSettings.autoRenew')}
                                    onToggle={handleAutoRenewToggle}
                                    isActive={privateSubscription?.autoRenew}
                                />
                                {!!autoRenewalDate && (
                                    <Text style={[styles.mutedTextLabel, styles.mt2]}>{translate('subscription.subscriptionSettings.renewsOn', {date: autoRenewalDate})}</Text>
                                )}
                            </View>
                        </OfflineWithFeedback>
                        <OfflineWithFeedback pendingAction={privateSubscription?.pendingFields?.addNewUsersAutomatically}>
                            <View style={styles.mt3}>
                                <ToggleSettingOptionRow
                                    customTitle={customTitle}
                                    switchAccessibilityLabel={translate('subscription.subscriptionSettings.autoRenew')}
                                    onToggle={handleAutoIncreaseToggle}
                                    isActive={privateSubscription?.addNewUsersAutomatically ?? false}
                                />
                                <Text style={[styles.mutedTextLabel, styles.mt2]}>{translate('subscription.subscriptionSettings.automaticallyIncrease')}</Text>
                            </View>
                        </OfflineWithFeedback>
                    </>
                ) : null}
                <MenuItemWithTopDescription
                    description={privateTaxExempt ? translate('subscription.details.taxExemptStatus') : undefined}
                    shouldShowRightIcon
                    onPress={() => {
                        requestTaxExempt();
                        navigateToConciergeChat();
                    }}
                    icon={Expensicons.Coins}
                    wrapperStyle={styles.sectionMenuItemTopDescription}
                    style={styles.mv5}
                    titleStyle={privateTaxExempt ? undefined : styles.textBold}
                    title={privateTaxExempt ? translate('subscription.details.taxExemptEnabled') : translate('subscription.details.taxExempt')}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

SubscriptionSettings.displayName = 'SubscriptionSettings';

export default SubscriptionSettings;
