/**
 * Interactive "Your plan" subscription settings card: plan header, badges, type and size rows, and auto-renew and auto-increase toggles.
 */
import Badge from '@components/Badge';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Popover from '@components/Popover';
import {PressableWithFeedback} from '@components/Pressable';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type ThreeDotsMenuProps from '@components/ThreeDotsMenu/types';

import useAnchoredInfoPopover from '@hooks/useAnchoredInfoPopover';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useEnvironment from '@hooks/useEnvironment';
import useHasTeam2025Pricing from '@hooks/useHasTeam2025Pricing';
import useLayoutSpacing from '@hooks/useLayoutSpacing';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByIDs} from '@hooks/usePersonalDetails';
import usePreferredCurrency from '@hooks/usePreferredCurrency';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import useSubscriptionPossibleCostSavings from '@hooks/useSubscriptionPossibleCostSavings';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {openLink} from '@libs/actions/Link';
import {convertToShortDisplayString} from '@libs/CurrencyUtils';
import {getPolicyIDOrDefault, isPolicyAdmin} from '@libs/PolicyUtils';

import Navigation from '@navigation/Navigation';

import {formatSubscriptionEndDate, getExpensifyCodeDiscountMessage, getPrivatePromoDiscountInfo, openSubscriptionDescriptionLink} from '@pages/settings/Subscription/utils';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {menuItemHorizontalPadding} from '@styles/layoutSpacing';
import variables from '@styles/variables';

import {navigateToConciergeChat} from '@userActions/Report';
import {callIfAuthenticated} from '@userActions/Session';
import {clearUpdateSubscriptionSizeError, requestTaxExempt, updateSubscriptionAddNewUsersAutomatically, updateSubscriptionAutoRenew} from '@userActions/Subscription';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';

import type {KeyboardEvent as ReactKeyboardEvent, MouseEventHandler} from 'react';
import type {GestureResponderEvent} from 'react-native';

import {guidedSetupAndTourStatusSelector} from '@selectors/Onboarding';
import {authTokenTypeSelector} from '@selectors/Session';
import {useState} from 'react';
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

const settingsRowHorizontalPadding = {paddingHorizontal: menuItemHorizontalPadding};

const anchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

type SubscriptionSizeHint = {
    text: string;
    linkLabel: string;
};

// Locales store this hint as HTML with one pricing anchor. HelpText renders its message inside Text, and RenderHTML throws there, so the anchor is split into a TextLink that can live in the row.
const SUBSCRIPTION_SIZE_HINT_PATTERN = /^<muted-text(?:-label)?>([\s\S]*?)<a href="([^"]+)">([\s\S]*?)<\/a>\s*<\/muted-text(?:-label)?>$/;

function getSubscriptionSizeHint(html: string): SubscriptionSizeHint | undefined {
    const match = html.match(SUBSCRIPTION_SIZE_HINT_PATTERN);
    if (!match?.[2].endsWith(CONST.PRICING)) {
        return undefined;
    }

    return {
        text: match[1].replace(/^\s+/, ''),
        linkLabel: match[3].trim(),
    };
}

function AnnualSavingsInfo() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const icons = useMemoizedLazyExpensifyIcons(['Info']);
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [adminsChatReportID] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getPolicyIDOrDefault(activePolicyID)}`, {
        selector: (policy) => (isPolicyAdmin(policy) && policy?.chatReportIDAdmins ? policy.chatReportIDAdmins.toString() : undefined),
    });
    const [isVisible, setVisible] = useState(false);
    const {anchorRef, anchorPosition, contentPaddingStyle, outerStyle, innerContainerStyle} = useAnchoredInfoPopover(isVisible);

    const openSavingsInfo = (event: GestureResponderEvent | KeyboardEvent | undefined) => {
        if (event && 'stopPropagation' in event) {
            event.stopPropagation();
        }
        setVisible(true);
    };

    const openSavingsLink = (href: string) => {
        setVisible(false);
        openSubscriptionDescriptionLink(href, adminsChatReportID, environmentURL, session);
    };

    return (
        <>
            <View
                ref={anchorRef}
                style={styles.ml2}
            >
                <PressableWithFeedback
                    onPress={openSavingsInfo}
                    accessibilityLabel={translate('subscription.subscriptionSettings.saveWithAnnualSubscription')}
                    role={CONST.ROLE.BUTTON}
                    sentryLabel={CONST.SENTRY_LABEL.SETTINGS_SUBSCRIPTION.ANNUAL_SAVINGS}
                >
                    <Icon
                        src={icons.Info}
                        width={variables.iconSizeExtraSmall}
                        height={variables.iconSizeExtraSmall}
                        fill={theme.icon}
                    />
                </PressableWithFeedback>
            </View>
            <Popover
                onClose={() => setVisible(false)}
                isVisible={isVisible}
                outerStyle={outerStyle}
                innerContainerStyle={innerContainerStyle}
                anchorRef={anchorRef}
                anchorPosition={anchorPosition}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <View style={contentPaddingStyle}>
                    <Text
                        numberOfLines={2}
                        style={[styles.optionDisplayName, styles.textStrong, styles.mb2]}
                    >
                        {translate('subscription.subscriptionSettings.saveWithAnnualSubscription')}
                    </Text>
                    {/* A tooltip cannot hold these anchors. The popover is the pressable surface the card-label info icon uses. */}
                    <RenderHTML
                        html={translate('subscription.subscriptionSettings.annualSavingsDescription', !!adminsChatReportID)}
                        onLinkPress={(_event, href) => openSavingsLink(href)}
                    />
                </View>
            </Popover>
        </>
    );
}

function SubscriptionPlanSettings({planTitle, planIcon, subscriptionPlan}: SubscriptionPlanSettingsProps) {
    const styles = useThemeStyles();
    const {values} = useLayoutSpacing();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
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
    const delegateAccountID = useDelegateAccountID();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [privatePromoCode] = useOnyx(ONYXKEYS.NVP_PRIVATE_PROMO_CODE);
    const [privatePromoDiscount] = useOnyx(ONYXKEYS.NVP_PRIVATE_PROMO_DISCOUNT);
    const [privatePromoCodeValidBillingCycles] = useOnyx(ONYXKEYS.NVP_PRIVATE_PROMO_CODE_VALID_BILLING_CYCLES);
    const [privateTaxExempt] = useOnyx(ONYXKEYS.NVP_PRIVATE_TAX_EXEMPT);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [conciergePersonalDetails] = usePersonalDetailsByIDs([CONST.ACCOUNT_ID.CONCIERGE]);
    const [guidedSetupAndTourStatus] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: guidedSetupAndTourStatusSelector});
    const isSelfTourViewed = guidedSetupAndTourStatus?.isSelfTourViewed;
    const hasCompletedGuidedSetupFlow = guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow;

    const isAnnual = privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL;
    const {isSecretPromoCode, promoDiscountValue} = getPrivatePromoDiscountInfo(privatePromoDiscount, isAnnual);
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
    });

    const subscriptionTypeValue = cardView.subscriptionTypeLabel === 'annual' ? translate('subscription.subscriptionSettings.annual') : translate('subscription.details.payPerUse');
    const autoRenewalDate = formatSubscriptionEndDate(privateSubscription?.endDate, dateFnsLocale);
    const autoIncreaseSubtitle = translate('subscription.subscriptionSettings.autoIncreaseDescription', convertToShortDisplayString(possibleCostSavings, preferredCurrency));
    // A secret code stays off the card, but the customer still sees the discount it gives them.
    const discountMessage = promoDiscountValue !== undefined ? getExpensifyCodeDiscountMessage(translate, promoDiscountValue, privatePromoCodeValidBillingCycles) : undefined;

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

    // The hint sits inside the size row's press target, so the link has to stop the event or Learn more also opens the size page.
    const openPricingFromSizeHint = (event: GestureResponderEvent | ReactKeyboardEvent) => {
        event.stopPropagation();
        openLink(CONST.PRICING, environmentURL, false, session);
    };

    const keepSizeHintLinkFromOpeningSizeRow: MouseEventHandler = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const subscriptionSizeHint = cardView.showSizeNotSetHelper ? getSubscriptionSizeHint(translate('subscription.subscriptionSettings.sizeNotSet')) : undefined;

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
            delegateAccountID,
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

    if (cardView.expensifyCodeMenu !== 'hidden') {
        overflowMenu.push({
            icon: icons.Tag,
            text: translate(cardView.expensifyCodeMenu === 'edit' ? 'subscription.subscriptionSettings.editExpensifyCode' : 'subscription.subscriptionSettings.addExpensifyCode'),
            sentryLabel: CONST.SENTRY_LABEL.SETTINGS_SUBSCRIPTION.EXPENSIFY_CODE,
            onSelected: navigateToExpensifyCode,
        });
    }

    if (cardView.includeRequestTaxExempt) {
        overflowMenu.push({
            icon: icons.Coins,
            text: translate('subscription.details.taxExempt'),
            sentryLabel: CONST.SENTRY_LABEL.SETTINGS_SUBSCRIPTION.TAX_EXEMPT,
            onSelected: requestTaxExemptStatus,
        });
    }

    if (!privateSubscription || !cardView.showSettings) {
        return null;
    }

    return (
        <View testID="SubscriptionPlanSettings">
            <View style={[{paddingTop: values.cardPadding, paddingHorizontal: menuItemHorizontalPadding}, styles.pb2]}>
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
                            sentryLabel={CONST.SENTRY_LABEL.SETTINGS_SUBSCRIPTION.PLAN_MENU}
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
                {!!discountMessage && <Text style={[styles.textLabelSupporting, styles.mt2]}>{discountMessage}</Text>}
            </View>
            <OfflineWithFeedback pendingAction={privateSubscription.pendingFields?.type}>
                <MenuItem.Root
                    onPress={callIfAuthenticated(navigateToSubscriptionDetails, session)}
                    sentryLabel={CONST.SENTRY_LABEL.SETTINGS_SUBSCRIPTION.EDIT_SUBSCRIPTION}
                    testID="SubscriptionPlanSettings-subscriptionType"
                    accessibilityLabel={`${translate('subscription.subscriptionSettings.subscriptionType')}, ${subscriptionTypeValue}`}
                >
                    <MenuItem.Row>
                        <MenuItem.Content>
                            <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                <MenuItem.FieldName>{translate('subscription.subscriptionSettings.subscriptionType')}</MenuItem.FieldName>
                                {cardView.showAnnualSavingsInfo && <AnnualSavingsInfo />}
                            </View>
                            <MenuItem.FieldValue>{subscriptionTypeValue}</MenuItem.FieldValue>
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
                        <MenuItem.Root
                            onPress={cardView.canEditSize ? callIfAuthenticated(navigateToSubscriptionSize, session) : undefined}
                            sentryLabel={CONST.SENTRY_LABEL.SETTINGS_SUBSCRIPTION.SUBSCRIPTION_SIZE}
                            testID="SubscriptionPlanSettings-subscriptionSize"
                        >
                            <MenuItemField.Row
                                name={translate('subscription.details.subscriptionSize')}
                                value={translate('subscription.subscriptionSettings.memberCount', {count: cardView.memberCount})}
                            >
                                {cardView.canEditSize && <MenuItem.Chevron />}
                            </MenuItemField.Row>
                            {cardView.showSizeNotSetHelper && (
                                <MenuItem.HelpText
                                    message={
                                        subscriptionSizeHint ? (
                                            <>
                                                {subscriptionSizeHint.text}
                                                <TextLink
                                                    onPress={openPricingFromSizeHint}
                                                    onMouseDown={keepSizeHintLinkFromOpeningSizeRow}
                                                    sentryLabel={CONST.SENTRY_LABEL.SETTINGS_SUBSCRIPTION.SIZE_NOT_SET_LEARN_MORE}
                                                >
                                                    {subscriptionSizeHint.linkLabel}
                                                </TextLink>
                                            </>
                                        ) : (
                                            translate('subscription.subscriptionSettings.sizeNotSet')
                                                .replaceAll(/<[^>]+>/g, '')
                                                .replaceAll(/\s+/g, ' ')
                                                .trim()
                                        )
                                    }
                                />
                            )}
                        </MenuItem.Root>
                    </OfflineWithFeedback>
                    <View
                        style={[settingsRowHorizontalPadding, styles.pv3]}
                        testID="SubscriptionPlanSettings-autoRenew"
                    >
                        <ToggleSettingOptionRow
                            title={translate('subscription.subscriptionSettings.autoRenew')}
                            subtitle={(privateSubscription.autoRenew ?? true) && autoRenewalDate ? translate('subscription.subscriptionSettings.renewsOn', autoRenewalDate) : undefined}
                            switchAccessibilityLabel={translate('subscription.subscriptionSettings.autoRenew')}
                            switchSentryLabel={CONST.SENTRY_LABEL.SETTINGS_SUBSCRIPTION.AUTO_RENEW_SWITCH}
                            onToggle={toggleAutoRenew}
                            isActive={privateSubscription.autoRenew}
                            disabled={!cardView.canToggleAnnualSettings}
                            pendingAction={privateSubscription.pendingFields?.autoRenew}
                            shouldPlaceSubtitleBelowSwitch
                        />
                    </View>
                    <View
                        style={[settingsRowHorizontalPadding, styles.pt3]}
                        testID="SubscriptionPlanSettings-autoIncrease"
                    >
                        <ToggleSettingOptionRow
                            title={translate('subscription.subscriptionSettings.autoIncrease')}
                            subtitle={autoIncreaseSubtitle}
                            switchAccessibilityLabel={translate('subscription.subscriptionSettings.autoIncrease')}
                            switchSentryLabel={CONST.SENTRY_LABEL.SETTINGS_SUBSCRIPTION.AUTO_INCREASE_SWITCH}
                            onToggle={toggleAutoIncrease}
                            isActive={privateSubscription.addNewUsersAutomatically ?? false}
                            disabled={!cardView.canToggleAnnualSettings}
                            pendingAction={privateSubscription.pendingFields?.addNewUsersAutomatically}
                            shouldPlaceSubtitleBelowSwitch
                        />
                    </View>
                </>
            )}
            {/* The ad row already has 12px padding, so margin below the line would stack. Margin above keeps the hover off the line. */}
            <View style={[styles.sectionDividerLine, styles.mt3, styles.mh5]} />
            <SaveWithExpensifyRow />
        </View>
    );
}

export default SubscriptionPlanSettings;
