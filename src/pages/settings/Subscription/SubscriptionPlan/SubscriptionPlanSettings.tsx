/**
 * Interactive "Your plan" subscription settings card: plan header, badges, type and size rows, and auto-renew and auto-increase toggles.
 */
import Badge from '@components/Badge';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type ThreeDotsMenuProps from '@components/ThreeDotsMenu/types';
import Tooltip from '@components/Tooltip';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useHasTeam2025Pricing from '@hooks/useHasTeam2025Pricing';
import useLayoutSpacing from '@hooks/useLayoutSpacing';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByIDs} from '@hooks/usePersonalDetails';
import usePolicy from '@hooks/usePolicy';
import usePreferredCurrency from '@hooks/usePreferredCurrency';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import useSubscriptionPossibleCostSavings from '@hooks/useSubscriptionPossibleCostSavings';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {openLink} from '@libs/actions/Link';
import {convertToShortDisplayString} from '@libs/CurrencyUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {isPolicyAdmin} from '@libs/PolicyUtils';

import Navigation from '@navigation/Navigation';

import {formatSubscriptionEndDate, getPrivatePromoDiscountInfo} from '@pages/settings/Subscription/utils';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import variables from '@styles/variables';

import {navigateToConciergeChat} from '@userActions/Report';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';
import {clearUpdateSubscriptionSizeError, requestTaxExempt, updateSubscriptionAddNewUsersAutomatically, updateSubscriptionAutoRenew} from '@userActions/Subscription';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';

import type {GestureResponderEvent} from 'react-native';

import {guidedSetupAndTourStatusSelector} from '@selectors/Onboarding';
import {View} from 'react-native';

import type {PersonalPolicyTypeExcludedProps} from './SubscriptionPlanCard';

import canEditSubscriptionSettingsInApp from './canEditSubscriptionSettingsInApp';
import {getAutoRenewToggleAction, getSubscriptionPlanCardView} from './getSubscriptionPlanCardView';
import SaveWithExpensifyRow from './SaveWithExpensifyRow';

type SubscriptionPlanSettingsProps = {
    planTitle: string;
    planIcon: IconAsset;
    subscriptionPlan: PersonalPolicyTypeExcludedProps | null;
};

const anchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

function AnnualSavingsTooltip() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const icons = useMemoizedLazyExpensifyIcons(['Info']);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const activePolicy = usePolicy(activePolicyID);
    const adminsChatReportID = isPolicyAdmin(activePolicy) && activePolicy?.chatReportIDAdmins ? activePolicy.chatReportIDAdmins.toString() : undefined;

    const openAdminsRoom = () => {
        if (!adminsChatReportID) {
            return;
        }
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(adminsChatReportID));
    };

    const openTooltipLink = (href: string) => {
        if (href.endsWith(CONST.SUBSCRIPTION.ADMINS_ROOM_LINK)) {
            openAdminsRoom();
            return;
        }
        if (!href.endsWith(CONST.PRICING)) {
            return;
        }
        openLink(CONST.PRICING, environmentURL);
    };

    const stopRowPress = (event: GestureResponderEvent | KeyboardEvent | undefined) => {
        if (!event || !('stopPropagation' in event)) {
            return;
        }
        event.stopPropagation();
    };

    return (
        <Tooltip
            isEducationTooltip
            minWidth={360}
            maxWidth={360}
            shouldForceRenderingBelow
            renderTooltipContentKey={[String(!!adminsChatReportID)]}
            wrapperStyle={[styles.pv4, styles.ph4, styles.appBG, styles.borderedContentCardLarge, styles.cardShadow]}
            renderTooltipContent={() => (
                <View style={styles.gap2}>
                    <Text style={[styles.textStrong, styles.themeTextColor]}>{translate('subscription.subscriptionSettings.saveWithAnnualSubscription')}</Text>
                    <View style={styles.renderHTML}>
                        <RenderHTML
                            html={translate('subscription.subscriptionSettings.annualSavingsDescription', !!adminsChatReportID)}
                            onLinkPress={(_event, href) => openTooltipLink(href)}
                        />
                    </View>
                </View>
            )}
        >
            <PressableWithoutFeedback
                onPress={stopRowPress}
                accessibilityLabel={translate('subscription.subscriptionSettings.saveWithAnnualSubscription')}
                role={CONST.ROLE.BUTTON}
                sentryLabel={CONST.SENTRY_LABEL.SETTINGS_SUBSCRIPTION.ANNUAL_SAVINGS}
            >
                <Icon
                    src={icons.Info}
                    width={variables.iconSizeExtraSmall}
                    height={variables.iconSizeExtraSmall}
                    fill={theme.icon}
                    additionalStyles={styles.ml2}
                />
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

function SubscriptionPlanSettings({planTitle, planIcon, subscriptionPlan}: SubscriptionPlanSettingsProps) {
    const styles = useThemeStyles();
    const {cardPaddingHorizontal, cardPaddingTop} = useLayoutSpacing();
    const {translate, dateFnsLocale} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Tag', 'Coins']);
    const privateSubscription = usePrivateSubscription();
    const hasTeam2025Pricing = useHasTeam2025Pricing();
    const preferredCurrency = usePreferredCurrency();
    const possibleCostSavings = useSubscriptionPossibleCostSavings();
    const {environmentURL} = useEnvironment();
    const {isActingAsDelegate} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [privatePromoCode] = useOnyx(ONYXKEYS.NVP_PRIVATE_PROMO_CODE);
    const [privatePromoDiscount] = useOnyx(ONYXKEYS.NVP_PRIVATE_PROMO_DISCOUNT);
    const [privateTaxExempt] = useOnyx(ONYXKEYS.NVP_PRIVATE_TAX_EXEMPT);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [conciergePersonalDetails] = usePersonalDetailsByIDs([CONST.ACCOUNT_ID.CONCIERGE]);
    const [guidedSetupAndTourStatus] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: guidedSetupAndTourStatusSelector});
    const isSelfTourViewed = guidedSetupAndTourStatus?.isSelfTourViewed;
    const hasCompletedGuidedSetupFlow = guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow;

    const isAnnual = privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL;
    const {isSecretPromoCode} = getPrivatePromoDiscountInfo(privatePromoDiscount, isAnnual);
    const cardView = getSubscriptionPlanCardView({
        subscriptionPlan,
        hasTeam2025Pricing,
        subscriptionType: privateSubscription?.type,
        userCount: privateSubscription?.userCount,
        promoCode: privatePromoCode,
        isSecretPromoCode,
        isTaxExempt: !!privateTaxExempt,
        isFromComparisonModal: false,
        canEditInApp: canEditSubscriptionSettingsInApp,
        isTouchDevice: canUseTouchScreen(),
    });

    const subscriptionTypeValue = cardView.subscriptionTypeLabel === 'annual' ? translate('subscription.subscriptionSettings.annual') : translate('subscription.details.payPerUse');
    const autoRenewalDate = formatSubscriptionEndDate(privateSubscription?.endDate, dateFnsLocale);
    const autoIncreaseSubtitle = translate('subscription.subscriptionSettings.autoIncreaseDescription', convertToShortDisplayString(possibleCostSavings, preferredCurrency));

    const navigateToSubscriptionDetails = () => {
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_SETTINGS_DETAILS);
    };

    const navigateToSubscriptionSize = () => {
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_SIZE.getRoute(CONST.SUBSCRIPTION_SIZE.PAGE_NAME.SIZE));
    };

    const navigateToExpensifyCode = () => {
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_EXPENSIFY_CODE);
    };

    const requestTaxExemptStatus = () => {
        requestTaxExempt();
        navigateToConciergeChat({
            conciergeReportID,
            introSelected,
            currentUserAccountID,
            isSelfTourViewed,
            hasCompletedGuidedSetupFlow,
            conciergePersonalDetails,
            shouldDismissModal: false,
        });
    };

    const toggleAutoRenew = () => {
        const action = getAutoRenewToggleAction({
            isActingAsDelegate,
            autoRenew: !!privateSubscription?.autoRenew,
            hasPurchases: account?.hasPurchases,
        });

        if (action === 'delegate') {
            showDelegateNoAccessModal();
            return;
        }
        if (action === 'enable') {
            updateSubscriptionAutoRenew(true);
            return;
        }
        if (action === 'survey') {
            Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_DISABLE_AUTO_RENEW_SURVEY);
            return;
        }
        updateSubscriptionAutoRenew(false);
    };

    const toggleAutoIncrease = () => {
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        updateSubscriptionAddNewUsersAutomatically(!privateSubscription?.addNewUsersAutomatically);
    };

    const overflowMenu: ThreeDotsMenuProps['menuItems'] = [];

    if (cardView.expensifyCodeMenu === 'add') {
        overflowMenu.push({
            icon: icons.Tag,
            text: translate('subscription.subscriptionSettings.addExpensifyCode'),
            onSelected: navigateToExpensifyCode,
        });
    }

    if (cardView.includeRequestTaxExempt) {
        overflowMenu.push({
            icon: icons.Coins,
            text: translate('subscription.details.taxExempt'),
            onSelected: requestTaxExemptStatus,
        });
    }

    if (!privateSubscription || !cardView.showSettings) {
        return null;
    }

    return (
        <View testID="SubscriptionPlanSettings">
            <View style={[cardPaddingHorizontal, cardPaddingTop, styles.pb2]}>
                <View>
                    <Text style={styles.textLabelSupporting}>{translate('subscription.yourPlan.plan')}</Text>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1, styles.mr2]}>
                            <Text
                                style={[styles.headerText, styles.textHeadlineH2, styles.flexShrink1]}
                                accessibilityRole={CONST.ROLE.HEADER}
                                numberOfLines={1}
                            >
                                {planTitle}
                            </Text>
                            <Icon
                                src={planIcon}
                                width={variables.iconHeader}
                                height={variables.iconHeader}
                                additionalStyles={styles.ml2}
                            />
                        </View>
                        <ThreeDotsMenu
                            shouldSelfPosition
                            menuItems={overflowMenu}
                            anchorAlignment={anchorAlignment}
                            shouldOverlay
                            testID="SubscriptionPlanSettings-menu"
                        />
                    </View>
                </View>
                {(cardView.showExpensifyCodeBadge || cardView.showTaxExemptBadge) && (
                    <View style={[styles.flexRow, styles.flexWrap, styles.gap2, styles.mt2]}>
                        {cardView.showExpensifyCodeBadge && (
                            <Badge
                                text={translate('subscription.subscriptionSettings.expensifyCodeApplied')}
                                icon={icons.Tag}
                            />
                        )}
                        {cardView.showTaxExemptBadge && (
                            <Badge
                                text={translate('subscription.details.taxExemptEnabled')}
                                icon={icons.Coins}
                            />
                        )}
                    </View>
                )}
            </View>
            <OfflineWithFeedback pendingAction={privateSubscription.pendingFields?.type}>
                <MenuItem.Root
                    onPress={callFunctionIfActionIsAllowed(navigateToSubscriptionDetails)}
                    testID="SubscriptionPlanSettings-subscriptionType"
                    accessibilityLabel={`${translate('subscription.subscriptionSettings.subscriptionType')}, ${subscriptionTypeValue}`}
                >
                    <MenuItem.Row>
                        <MenuItem.Content>
                            <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                <MenuItem.FieldName>{translate('subscription.subscriptionSettings.subscriptionType')}</MenuItem.FieldName>
                                {cardView.showAnnualSavingsTooltip && <AnnualSavingsTooltip />}
                            </View>
                            <MenuItem.FieldValue>{subscriptionTypeValue}</MenuItem.FieldValue>
                            {cardView.showAnnualSavingsHint && (
                                <Text style={[styles.textLabelSupporting, styles.mt1]}>{translate('subscription.subscriptionSettings.saveWithAnnualSubscription')}</Text>
                            )}
                        </MenuItem.Content>
                        <MenuItem.Trailing>
                            <MenuItem.Chevron />
                        </MenuItem.Trailing>
                    </MenuItem.Row>
                </MenuItem.Root>
            </OfflineWithFeedback>
            {cardView.showAnnualControls && (
                <>
                    <OfflineWithFeedback
                        pendingAction={privateSubscription.pendingFields?.userCount}
                        errors={privateSubscription.errorFields?.userCount}
                        onClose={clearUpdateSubscriptionSizeError}
                    >
                        <MenuItemField
                            name={translate('subscription.details.subscriptionSize')}
                            value={translate('subscription.subscriptionSettings.memberCount', {count: cardView.memberCount})}
                            onPress={cardView.canEditSize ? navigateToSubscriptionSize : undefined}
                            testID="SubscriptionPlanSettings-subscriptionSize"
                        />
                    </OfflineWithFeedback>
                    {cardView.showSizeNotSetHelper && (
                        <View style={[styles.renderHTML, cardPaddingHorizontal, styles.mb3]}>
                            <RenderHTML
                                html={translate('subscription.subscriptionSettings.sizeNotSet')}
                                onLinkPress={(_event, href) => {
                                    if (!href.endsWith(CONST.PRICING)) {
                                        return;
                                    }
                                    openLink(CONST.PRICING, environmentURL);
                                }}
                            />
                        </View>
                    )}
                    <View
                        style={cardPaddingHorizontal}
                        testID="SubscriptionPlanSettings-autoRenew"
                    >
                        <ToggleSettingOptionRow
                            title={translate('subscription.subscriptionSettings.autoRenew')}
                            subtitle={(privateSubscription.autoRenew ?? true) && autoRenewalDate ? translate('subscription.subscriptionSettings.renewsOn', autoRenewalDate) : undefined}
                            switchAccessibilityLabel={translate('subscription.subscriptionSettings.autoRenew')}
                            onToggle={toggleAutoRenew}
                            isActive={privateSubscription.autoRenew}
                            disabled={!cardView.canToggleAnnualSettings}
                            pendingAction={privateSubscription.pendingFields?.autoRenew}
                            shouldPlaceSubtitleBelowSwitch
                        />
                    </View>
                    <View
                        style={[cardPaddingHorizontal, styles.mt3, styles.mb3]}
                        testID="SubscriptionPlanSettings-autoIncrease"
                    >
                        <ToggleSettingOptionRow
                            title={translate('subscription.subscriptionSettings.autoIncrease')}
                            subtitle={autoIncreaseSubtitle}
                            switchAccessibilityLabel={translate('subscription.subscriptionSettings.autoIncrease')}
                            onToggle={toggleAutoIncrease}
                            isActive={privateSubscription.addNewUsersAutomatically ?? false}
                            disabled={!cardView.canToggleAnnualSettings}
                            pendingAction={privateSubscription.pendingFields?.addNewUsersAutomatically}
                            shouldPlaceSubtitleBelowSwitch
                        />
                    </View>
                </>
            )}
            <View style={styles.sectionDividerLine} />
            <SaveWithExpensifyRow />
        </View>
    );
}

export default SubscriptionPlanSettings;
