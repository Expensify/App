/**
 * Builds the lightweight Settings menu data shared by Settings and navigation surfaces.
 */

import useIsAgentAccount from '@hooks/useIsAgentAccount';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';

import Navigation from '@libs/Navigation/Navigation';

import type SETTINGS_TO_RHP from '@navigation/linkingConfig/RELATIONS/SETTINGS_TO_RHP';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Icon as TIcon} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

/** Settings screens that can be opened as top-level RHP destinations. */
type SettingsTopLevelScreens = keyof typeof SETTINGS_TO_RHP;

/** Shared descriptor for a Settings menu row. */
type MenuData = WithSentryLabel & {
    /** Translation key used for the row label. */
    translationKey: TranslationPaths;

    /** Icon shown with the row. */
    icon: IconAsset;

    /** Top-level Settings screen opened by the row. */
    screenName?: SettingsTopLevelScreens;

    /** Status indicator shown when the destination needs attention. */
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;

    /** Action performed when the row is selected. */
    action: () => void;

    /** External link associated with the row. */
    link?: string | (() => Promise<string>);

    /** Visual type used to render the icon. */
    iconType?: typeof CONST.ICON_TYPE_ICON | typeof CONST.ICON_TYPE_AVATAR | typeof CONST.ICON_TYPE_WORKSPACE;

    /** Additional styles applied to the icon. */
    iconStyles?: StyleProp<ViewStyle>;

    /** Icon used when the primary icon cannot be displayed. */
    fallbackIcon?: IconAsset;

    /** Whether the row contents should use a horizontal layout. */
    shouldStackHorizontally?: boolean;

    /** Size used when the icon is rendered as an avatar. */
    avatarSize?: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Avatars displayed at the end of the row. */
    floatRightAvatars?: TIcon[];

    /** Optional pre-localized row title. */
    title?: string;

    /** Whether to display the trailing icon. */
    shouldShowRightIcon?: boolean;

    /** Icon displayed at the end of the row. */
    iconRight?: IconAsset;

    /** Text displayed in the row badge. */
    badgeText?: string;

    /** Additional styles applied to the badge. */
    badgeStyle?: ViewStyle;

    /** Whether the badge uses success styling. */
    isBadgeSuccess?: boolean;

    /** Whether the badge uses emphasized styling. */
    isBadgeStrong?: boolean;

    /** Whether the badge uses the condensed layout. */
    isBadgeCondensed?: boolean;
};

/** Group of Settings menu rows displayed under one translated heading. */
type MenuSection = {
    /** Translation key used for the section heading. */
    sectionTranslationKey: TranslationPaths;

    /** Rows displayed in the section. */
    items: MenuData[];
};

function useSettingsNavigationMenuData(): {accountMenuItemsData: MenuSection; generalMenuItemsData: MenuSection} {
    const icons = useMemoizedLazyExpensifyIcons(['Bot', 'Gear', 'Profile', 'Heart', 'Info', 'QuestionMark', 'Lightbulb', 'Lock', 'Users', 'CreditCard', 'Wallet', 'Bolt']);
    const [amountOwed = 0] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const subscriptionPlan = useSubscriptionPlan();
    const {isBetaEnabled} = usePermissions();
    const isAgentAccount = useIsAgentAccount();

    const accountItems: MenuData[] = [
        {
            translationKey: 'common.profile',
            icon: icons.Profile,
            screenName: SCREENS.SETTINGS.PROFILE.ROOT,
            sentryLabel: CONST.SENTRY_LABEL.ACCOUNT.PROFILE,
            action: () => Navigation.navigate(ROUTES.SETTINGS_PROFILE.getRoute()),
        },
        {
            translationKey: 'common.wallet',
            icon: icons.Wallet,
            screenName: SCREENS.SETTINGS.WALLET.ROOT,
            sentryLabel: CONST.SENTRY_LABEL.ACCOUNT.WALLET,
            action: () => Navigation.navigate(ROUTES.SETTINGS_WALLET),
        },
        {
            translationKey: 'expenseRulesPage.title',
            icon: icons.Bolt,
            screenName: SCREENS.SETTINGS.RULES.ROOT,
            sentryLabel: CONST.SENTRY_LABEL.ACCOUNT.RULES,
            action: () => Navigation.navigate(ROUTES.SETTINGS_RULES),
        },
        {
            translationKey: 'common.preferences',
            icon: icons.Gear,
            screenName: SCREENS.SETTINGS.PREFERENCES.ROOT,
            sentryLabel: CONST.SENTRY_LABEL.ACCOUNT.PREFERENCES,
            action: () => Navigation.navigate(ROUTES.SETTINGS_PREFERENCES),
        },
        {
            translationKey: 'delegate.copilot',
            icon: icons.Users,
            screenName: SCREENS.SETTINGS.COPILOT,
            sentryLabel: CONST.SENTRY_LABEL.ACCOUNT.COPILOT,
            action: () => Navigation.navigate(ROUTES.SETTINGS_COPILOT),
        },
        {
            translationKey: 'initialSettingsPage.security',
            icon: icons.Lock,
            screenName: SCREENS.SETTINGS.SECURITY,
            sentryLabel: CONST.SENTRY_LABEL.ACCOUNT.SECURITY,
            action: () => Navigation.navigate(ROUTES.SETTINGS_SECURITY),
        },
    ];

    if (!isAgentAccount && isBetaEnabled(CONST.BETAS.CUSTOM_AGENT)) {
        const rulesIndex = accountItems.findIndex((item) => item.screenName === SCREENS.SETTINGS.RULES.ROOT);
        accountItems.splice(rulesIndex + 1, 0, {
            translationKey: 'agentsPage.title',
            icon: icons.Bot,
            screenName: SCREENS.SETTINGS.AGENTS.ROOT,
            sentryLabel: CONST.SENTRY_LABEL.ACCOUNT.AGENTS,
            action: () => Navigation.navigate(ROUTES.SETTINGS_AGENTS),
        });
    }

    if (subscriptionPlan || amountOwed > 0) {
        accountItems.splice(1, 0, {
            translationKey: 'allSettingsScreen.subscription',
            icon: icons.CreditCard,
            screenName: SCREENS.SETTINGS.SUBSCRIPTION.ROOT,
            sentryLabel: CONST.SENTRY_LABEL.ACCOUNT.SUBSCRIPTION,
            action: () => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION.route),
        });
    }

    return {
        accountMenuItemsData: {
            sectionTranslationKey: 'initialSettingsPage.account',
            items: accountItems,
        },
        generalMenuItemsData: {
            sectionTranslationKey: 'initialSettingsPage.general',
            items: [
                {
                    translationKey: 'initialSettingsPage.help',
                    icon: icons.QuestionMark,
                    screenName: SCREENS.SETTINGS.HELP,
                    sentryLabel: CONST.SENTRY_LABEL.SETTINGS_GENERAL.HELP,
                    action: () => Navigation.navigate(ROUTES.SETTINGS_HELP),
                },
                {
                    translationKey: 'initialSettingsPage.about',
                    icon: icons.Info,
                    screenName: SCREENS.SETTINGS.ABOUT,
                    sentryLabel: CONST.SENTRY_LABEL.SETTINGS_GENERAL.ABOUT,
                    action: () => Navigation.navigate(ROUTES.SETTINGS_ABOUT),
                },
                {
                    translationKey: 'initialSettingsPage.aboutPage.troubleshoot',
                    icon: icons.Lightbulb,
                    screenName: SCREENS.SETTINGS.TROUBLESHOOT,
                    sentryLabel: CONST.SENTRY_LABEL.SETTINGS_GENERAL.TROUBLESHOOT,
                    action: () => Navigation.navigate(ROUTES.SETTINGS_TROUBLESHOOT),
                },
                {
                    translationKey: 'sidebarScreen.saveTheWorld',
                    icon: icons.Heart,
                    screenName: SCREENS.SETTINGS.SAVE_THE_WORLD,
                    sentryLabel: CONST.SENTRY_LABEL.SETTINGS_GENERAL.SAVE_THE_WORLD,
                    action: () => Navigation.navigate(ROUTES.SETTINGS_SAVE_THE_WORLD),
                },
            ],
        },
    };
}

export default useSettingsNavigationMenuData;
export type {MenuData, MenuSection};
