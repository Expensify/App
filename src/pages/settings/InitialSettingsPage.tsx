import AccountSwitcher from '@components/AccountSwitcher';
import AccountSwitcherSkeletonView from '@components/AccountSwitcherSkeletonView';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import TopBarWithLoadingBar from '@components/Navigation/TopBarWithLoadingBar';
import ScreenWrapper from '@components/ScreenWrapper';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';

import useCardFeedErrors from '@hooks/useCardFeedErrors';
import useConfirmModal from '@hooks/useConfirmModal';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useNonPersonalCardList from '@hooks/useNonPersonalCardList';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSingleExecution from '@hooks/useSingleExecution';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useThemeStyles from '@hooks/useThemeStyles';

import {resetExitSurveyForm} from '@libs/actions/ExitSurvey';
import {closeReactNativeApp} from '@libs/actions/HybridApp';
import {hasPartiallySetupBankAccount, hasPersonalBankAccountMissingInfo} from '@libs/BankAccountUtils';
import {hasPendingExpensifyCardAction, hasVirtualExpensifyCardMissingPersonalDetails} from '@libs/CardUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import useIsSidebarRouteActive from '@libs/Navigation/helpers/useIsSidebarRouteActive';
import Navigation from '@libs/Navigation/Navigation';
import {useIsAgentAccount} from '@libs/SessionUtils';
import {getFreeTrialText, hasSubscriptionRedDotError} from '@libs/SubscriptionUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import {shouldHideOldAppRedirect} from '@libs/TryNewDotUtils';
import {expensifyLoginsSelector, getProfilePageBrickRoadIndicator, hasDeviceManagementError} from '@libs/UserUtils';

import type SETTINGS_TO_RHP from '@navigation/linkingConfig/RELATIONS/SETTINGS_TO_RHP';

import {BACKGROUND_LOCATION_TRACKING_TASK_NAME} from '@pages/iou/request/step/IOURequestStepDistanceGPS/const';
import {stopGpsTripNotification} from '@pages/iou/request/step/IOURequestStepDistanceGPS/GPSNotifications';

import {openExternalLink, openOldDotLink} from '@userActions/Link';
import {hasPaymentMethodError} from '@userActions/PaymentMethods';
import {hasStashedSession, isSupportAuthToken, signOutAndRedirectToSignIn} from '@userActions/Session';
import {openInitialSettingsPage} from '@userActions/Wallet';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {isActingAsDelegateSelector} from '@src/selectors/Account';
import {isTrackingSelector} from '@src/selectors/GPSDraftDetails';
import type {Icon as TIcon} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView, ScrollViewProps, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import {findFocusedRoute, useNavigationState, useRoute} from '@react-navigation/native';
import {differenceInDays} from 'date-fns';
import {stopLocationUpdatesAsync} from 'expo-location';
import React, {useContext, useEffect, useLayoutEffect, useRef} from 'react';
import {View} from 'react-native';

import SettingsMenuItem from './SettingsMenuItem';

type InitialSettingsPageProps = WithCurrentUserPersonalDetailsProps;

type SettingsTopLevelScreens = keyof typeof SETTINGS_TO_RHP;

type MenuData = WithSentryLabel & {
    translationKey: TranslationPaths;
    icon: IconAsset;
    screenName?: SettingsTopLevelScreens;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    action: () => void;
    link?: string | (() => Promise<string>);
    iconType?: typeof CONST.ICON_TYPE_ICON | typeof CONST.ICON_TYPE_AVATAR | typeof CONST.ICON_TYPE_WORKSPACE;
    iconStyles?: StyleProp<ViewStyle>;
    fallbackIcon?: IconAsset;
    shouldStackHorizontally?: boolean;
    avatarSize?: ValueOf<typeof CONST.AVATAR_SIZE>;
    floatRightAvatars?: TIcon[];
    title?: string;
    shouldShowRightIcon?: boolean;
    iconRight?: IconAsset;
    badgeText?: string;
    badgeStyle?: ViewStyle;
    isBadgeSuccess?: boolean;
    isBadgeStrong?: boolean;
    isBadgeCondensed?: boolean;
};

type Menu = {sectionStyle: StyleProp<ViewStyle>; sectionTranslationKey: TranslationPaths; items: MenuData[]};

export type {MenuData};

function InitialSettingsPage({currentUserPersonalDetails}: InitialSettingsPageProps) {
    const {convertToDisplayString} = useCurrencyListActions();
    const icons = useMemoizedLazyExpensifyIcons([
        'Bot',
        'Gear',
        'Profile',
        'NewWindow',
        'Heart',
        'Info',
        'QuestionMark',
        'ExpensifyLogoNew',
        'TreasureChest',
        'Exit',
        'Lightbulb',
        'Lock',
        'Users',
        'CreditCard',
        'Wallet',
        'Bolt',
    ]);
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS);
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});
    const [hasDeviceManagementErrorValue] = useOnyx(ONYXKEYS.LOGINS, {selector: hasDeviceManagementError});
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [vacationDelegate] = useOnyx(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
    const allCards = useNonPersonalCardList();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [stripeCustomerId] = useOnyx(ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [retryBillingSuccessful] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL);
    const [billingDisputePending] = useOnyx(ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING);
    const [retryBillingFailed] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED);
    const [billingStatus] = useOnyx(ONYXKEYS.NVP_PRIVATE_BILLING_STATUS);
    const [amountOwed = 0] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const tabBarContent = <TabBarBottomContent selectedTab={NAVIGATION_TABS.SETTINGS} />;
    const network = useNetwork();
    const styles = useThemeStyles();
    const {isExecuting, singleExecution} = useSingleExecution();
    const {translate} = useLocalize();
    const focusedRouteName = useNavigationState((state) => findFocusedRoute(state)?.name);
    const isScreenFocused = useIsSidebarRouteActive(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, shouldUseNarrowLayout);
    const hasActivatedWallet = ([CONST.WALLET.TIER_NAME.GOLD, CONST.WALLET.TIER_NAME.PLATINUM] as string[]).includes(userWallet?.tierName ?? '');
    const hasLockedBankAccount = bankAccountList ? Object.values(bankAccountList).some((bankAccount) => bankAccount.accountData?.state === CONST.BANK_ACCOUNT.STATE.LOCKED) : false;
    const [firstDayFreeTrial] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL);
    const [isTrackingGPS = false] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {selector: isTrackingSelector});
    const [lastDayFreeTrial] = useOnyx(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL);
    const [unsharedBankAccount] = useOnyx(ONYXKEYS.UNSHARE_BANK_ACCOUNT);
    const [stashedCredentials] = useOnyx(ONYXKEYS.STASHED_CREDENTIALS);
    const [stashedSession] = useOnyx(ONYXKEYS.STASHED_SESSION);
    const [hasAgentErrors] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT, {
        selector: (agents) => Object.values(agents ?? {}).some((agent) => !isEmptyObject(agent?.nameErrors) || !isEmptyObject(agent?.promptErrors) || !isEmptyObject(agent?.avatarErrors)),
    });
    const privateSubscription = usePrivateSubscription();
    const subscriptionPlan = useSubscriptionPlan();
    const previousUserPersonalDetails = usePrevious(currentUserPersonalDetails);
    const [tryNewDot, tryNewDotMetadata] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT);
    const isLoadingTryNewDot = isLoadingOnyxValue(tryNewDotMetadata);
    const {isBetaEnabled} = usePermissions();
    const isAgentAccount = useIsAgentAccount();

    const freeTrialText = getFreeTrialText(currentUserPersonalDetails.accountID, translate, policies, introSelected, firstDayFreeTrial, lastDayFreeTrial);

    const {
        personalCard: {shouldShowRBR: shouldShowRBRForPersonalCard},
    } = useCardFeedErrors();
    const hasPendingCardAction = hasPendingExpensifyCardAction(allCards, privatePersonalDetails);
    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isActingAsDelegateSelector});
    const hasVirtualCardMissingDetails = hasVirtualExpensifyCardMissingPersonalDetails(allCards, privatePersonalDetails, isActingAsDelegate);
    let walletBrickRoadIndicator;
    if (
        hasLockedBankAccount ||
        hasPaymentMethodError(bankAccountList, fundList, allCards, session, policies) ||
        !isEmptyObject(userWallet?.errors) ||
        !isEmptyObject(walletTerms?.errors) ||
        !isEmptyObject(unsharedBankAccount?.errors) ||
        shouldShowRBRForPersonalCard
    ) {
        walletBrickRoadIndicator = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    } else if (hasPartiallySetupBankAccount(bankAccountList) || hasPersonalBankAccountMissingInfo(bankAccountList) || hasPendingCardAction || hasVirtualCardMissingDetails) {
        walletBrickRoadIndicator = CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
    }

    const hasAccountBeenSwitched = currentUserPersonalDetails.accountID !== previousUserPersonalDetails.accountID;

    useEffect(() => {
        if (!hasAccountBeenSwitched) {
            return;
        }

        Navigation.clearPreloadedRoutes();
    }, [hasAccountBeenSwitched]);

    useEffect(() => {
        openInitialSettingsPage();
    }, []);

    const {showConfirmModal} = useConfirmModal();
    const confirmModalTitle = isTrackingGPS ? translate('gps.signOutWarningTripInProgress.title') : translate('common.areYouSure');
    const confirmModalPrompt = isTrackingGPS ? translate('gps.signOutWarningTripInProgress.prompt') : translate('initialSettingsPage.signOutConfirmationText');
    const confirmModalConfirmText = isTrackingGPS ? translate('gps.signOutWarningTripInProgress.confirm') : translate('initialSettingsPage.signOut');

    const showSignOutModal = () => {
        return showConfirmModal({
            title: confirmModalTitle,
            prompt: confirmModalPrompt,
            confirmText: confirmModalConfirmText,
            cancelText: translate('common.cancel'),
            shouldShowCancelButton: true,
            danger: true,
        });
    };

    const signOut = async (shouldForceSignout = false) => {
        if ((!network.isOffline && !isTrackingGPS) || shouldForceSignout) {
            return signOutAndRedirectToSignIn();
        }

        // When offline, warn the user that any actions they took while offline will be lost if they sign out
        const result = await showSignOutModal();
        if (result.action !== ModalActions.CONFIRM) {
            return;
        }
        if (isTrackingGPS) {
            stopGpsTripNotification();
            stopLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME).catch((error) => console.error('[GPS distance request] Failed to stop location tracking', error));
        }
        signOut(true);
    };

    const surveyThresholdInDays = 30;
    let surveyCompletedWithinLastMonth = false;
    if (tryNewDot?.classicRedirect?.timestamp && tryNewDot?.classicRedirect?.dismissed) {
        const daysSinceLastSurvey = differenceInDays(new Date(), new Date(tryNewDot.classicRedirect.timestamp));
        surveyCompletedWithinLastMonth = daysSinceLastSurvey < surveyThresholdInDays;
    }

    /**
     * Return a list of menu items data for account section
     * @returns object with translationKey, style and items for the account section
     */
    const profileBrickRoadIndicator = getProfilePageBrickRoadIndicator(loginList, privatePersonalDetails, vacationDelegate, session?.email);
    const securityBrickRoadIndicator = hasDeviceManagementErrorValue ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined;
    const accountItems: MenuData[] = [
        {
            translationKey: 'common.profile',
            icon: icons.Profile,
            screenName: SCREENS.SETTINGS.PROFILE.ROOT,
            brickRoadIndicator: profileBrickRoadIndicator,
            sentryLabel: CONST.SENTRY_LABEL.ACCOUNT.PROFILE,
            action: () => Navigation.navigate(ROUTES.SETTINGS_PROFILE.getRoute()),
        },
        ...(!isAgentAccount
            ? [
                  {
                      translationKey: 'common.wallet' as const,
                      icon: icons.Wallet,
                      screenName: SCREENS.SETTINGS.WALLET.ROOT,
                      brickRoadIndicator: walletBrickRoadIndicator,
                      sentryLabel: CONST.SENTRY_LABEL.ACCOUNT.WALLET,
                      action: () => Navigation.navigate(ROUTES.SETTINGS_WALLET),
                      badgeText: hasActivatedWallet ? convertToDisplayString(userWallet?.currentBalance, CONST.CURRENCY.USD) : undefined,
                  },
              ]
            : []),
        {
            translationKey: 'expenseRulesPage.title',
            icon: icons.Bolt,
            screenName: SCREENS.SETTINGS.RULES.ROOT,
            sentryLabel: CONST.SENTRY_LABEL.ACCOUNT.RULES,
            action: () => Navigation.navigate(ROUTES.SETTINGS_RULES),
        },
        ...(!isAgentAccount
            ? [
                  {
                      translationKey: 'common.preferences' as const,
                      icon: icons.Gear,
                      screenName: SCREENS.SETTINGS.PREFERENCES.ROOT,
                      sentryLabel: CONST.SENTRY_LABEL.ACCOUNT.PREFERENCES,
                      action: () => Navigation.navigate(ROUTES.SETTINGS_PREFERENCES),
                  },
              ]
            : []),
        {
            translationKey: 'delegate.copilot',
            icon: icons.Users,
            screenName: SCREENS.SETTINGS.COPILOT,
            sentryLabel: CONST.SENTRY_LABEL.ACCOUNT.COPILOT,
            action: () => Navigation.navigate(ROUTES.SETTINGS_COPILOT),
        },
        ...(!isAgentAccount
            ? [
                  {
                      translationKey: 'initialSettingsPage.security' as const,
                      icon: icons.Lock,
                      screenName: SCREENS.SETTINGS.SECURITY,
                      brickRoadIndicator: securityBrickRoadIndicator,
                      sentryLabel: CONST.SENTRY_LABEL.ACCOUNT.SECURITY,
                      action: () => Navigation.navigate(ROUTES.SETTINGS_SECURITY),
                  },
              ]
            : []),
    ];

    if (!isAgentAccount && isBetaEnabled(CONST.BETAS.CUSTOM_AGENT)) {
        const rulesIndex = accountItems.findIndex((item) => item.screenName === SCREENS.SETTINGS.RULES.ROOT);
        accountItems.splice(rulesIndex + 1, 0, {
            translationKey: 'agentsPage.title',
            icon: icons.Bot,
            screenName: SCREENS.SETTINGS.AGENTS.ROOT,
            sentryLabel: CONST.SENTRY_LABEL.ACCOUNT.AGENTS,
            action: () => Navigation.navigate(ROUTES.SETTINGS_AGENTS),
            badgeText: translate('common.beta'),
            brickRoadIndicator: hasAgentErrors ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        });
    }

    if (!isAgentAccount && (subscriptionPlan || (amountOwed ?? 0) > 0)) {
        accountItems.splice(1, 0, {
            translationKey: 'allSettingsScreen.subscription',
            icon: icons.CreditCard,
            screenName: SCREENS.SETTINGS.SUBSCRIPTION.ROOT,
            brickRoadIndicator:
                !!privateSubscription?.errors ||
                hasSubscriptionRedDotError(
                    stripeCustomerId,
                    retryBillingSuccessful,
                    billingDisputePending,
                    retryBillingFailed,
                    fundList,
                    billingStatus,
                    amountOwed,
                    ownerBillingGracePeriodEnd,
                )
                    ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                    : undefined,
            badgeText: freeTrialText,
            isBadgeSuccess: !!freeTrialText,
            isBadgeCondensed: !!freeTrialText,
            sentryLabel: CONST.SENTRY_LABEL.ACCOUNT.SUBSCRIPTION,
            action: () => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION.route),
        });
    }

    const accountMenuItemsData: Menu = {
        sectionStyle: styles.accountSettingsSectionContainer,
        sectionTranslationKey: 'initialSettingsPage.account',
        items: accountItems,
    };

    let classicRedirectMenuItem: MenuData | null = null;
    if (!shouldHideOldAppRedirect(tryNewDot, isLoadingTryNewDot, CONFIG.IS_HYBRID_APP)) {
        const shouldOpenSurveyReasonPage = tryNewDot?.classicRedirect?.dismissed === false;

        classicRedirectMenuItem = {
            translationKey: 'exitSurvey.goToExpensifyClassic',
            icon: icons.ExpensifyLogoNew,
            sentryLabel: CONST.SENTRY_LABEL.SETTINGS_GENERAL.GO_TO_CLASSIC,
            ...(CONFIG.IS_HYBRID_APP
                ? {
                      action: () => closeReactNativeApp({shouldSetNVP: true, isTrackingGPS}),
                  }
                : {
                      action() {
                          if (surveyCompletedWithinLastMonth) {
                              openOldDotLink(CONST.OLDDOT_URLS.INBOX, true);
                              return;
                          }

                          resetExitSurveyForm(() => {
                              if (shouldOpenSurveyReasonPage) {
                                  Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.EXIT_SURVEY_REASON.path));
                                  return;
                              }
                              Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.EXIT_SURVEY_CONFIRM.path));
                          });
                      },
                  }),
        };
    }

    /**
     * Return a list of menu items data for general section
     * @returns object with translationKey, style and items for the general section
     */
    const signOutTranslationKey = isSupportAuthToken() && hasStashedSession(stashedSession, stashedCredentials) ? 'initialSettingsPage.restoreStashed' : 'initialSettingsPage.signOut';
    const generalMenuItemsData: Menu = {
        sectionStyle: {
            ...styles.pt4,
        },
        sectionTranslationKey: 'initialSettingsPage.general',
        items: [
            ...(classicRedirectMenuItem && tryNewDot?.nudgeMigration ? [classicRedirectMenuItem] : []),
            {
                translationKey: 'initialSettingsPage.help',
                icon: icons.QuestionMark,
                screenName: SCREENS.SETTINGS.HELP,
                sentryLabel: CONST.SENTRY_LABEL.SETTINGS_GENERAL.HELP,
                action: () => Navigation.navigate(ROUTES.SETTINGS_HELP),
            },
            {
                translationKey: 'initialSettingsPage.whatIsNew',
                icon: icons.TreasureChest,
                iconRight: icons.NewWindow,
                shouldShowRightIcon: true,
                sentryLabel: CONST.SENTRY_LABEL.SETTINGS_GENERAL.WHATS_NEW,
                link: CONST.WHATS_NEW_URL,
                action: () => {
                    openExternalLink(CONST.WHATS_NEW_URL);
                },
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
            {
                translationKey: signOutTranslationKey,
                icon: icons.Exit,
                sentryLabel: CONST.SENTRY_LABEL.SETTINGS_GENERAL.SIGN_OUT,
                action: () => {
                    signOut(false);
                },
            },
        ],
    };

    /**
     * Return JSX.Element with menu items
     * @param menuItemsData list with menu items data
     * @returns the menu items for passed data
     */
    const getMenuItemsSection = (menuItemsData: Menu) => {
        return (
            <View style={[menuItemsData.sectionStyle, styles.pb4, styles.mh3]}>
                <Text
                    style={styles.sectionTitle}
                    accessibilityRole={CONST.ROLE.HEADER}
                >
                    {translate(menuItemsData.sectionTranslationKey)}
                </Text>
                {menuItemsData.items.map((item) => {
                    const keyTitle = item.translationKey ? translate(item.translationKey) : item.title;
                    const isFocused = focusedRouteName ? focusedRouteName === item.screenName : false;

                    return (
                        <SettingsMenuItem
                            key={keyTitle}
                            item={item}
                            keyTitle={keyTitle}
                            isFocused={isFocused}
                            isExecuting={isExecuting}
                            isScreenFocused={isScreenFocused}
                            onPress={singleExecution(item.action)}
                            wrapperStyle={styles.sectionMenuItem(shouldUseNarrowLayout)}
                        />
                    );
                })}
            </View>
        );
    };

    const accountMenuItems = getMenuItemsSection(accountMenuItemsData);
    const generalMenuItems = getMenuItemsSection(generalMenuItemsData);

    const isPersonalDetailsEmpty = isEmptyObject(currentUserPersonalDetails) || currentUserPersonalDetails.displayName === undefined;
    const skeletonReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'InitialSettingsPage',
        isPersonalDetailsEmpty,
    };

    const headerContent = (
        <View style={[styles.ph5, styles.pv4]}>
            {isPersonalDetailsEmpty ? (
                <AccountSwitcherSkeletonView
                    avatarSize={CONST.AVATAR_SIZE.DEFAULT}
                    reasonAttributes={skeletonReasonAttributes}
                />
            ) : (
                <View style={[styles.flexRow, styles.alignItemsCenter]}>
                    <AccountSwitcher isScreenFocused={isScreenFocused} />
                </View>
            )}
        </View>
    );

    const {saveScrollOffset, getScrollOffset} = useContext(ScrollOffsetContext);
    const route = useRoute();
    const scrollViewRef = useRef<RNScrollView>(null);

    const onScroll: NonNullable<ScrollViewProps['onScroll']> = (e) => {
        // If the layout measurement is 0, it means the flash list is not displayed but the onScroll may be triggered with offset value 0.
        // We should ignore this case.
        if (e.nativeEvent.layoutMeasurement.height === 0) {
            return;
        }
        saveScrollOffset(route, e.nativeEvent.contentOffset.y);
    };

    useLayoutEffect(() => {
        const scrollOffset = getScrollOffset(route);
        if (!scrollOffset || !scrollViewRef.current) {
            return;
        }
        scrollViewRef.current.scrollTo({y: scrollOffset, animated: false});
    }, [getScrollOffset, route]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID="InitialSettingsPage"
            shouldEnableKeyboardAvoidingView={false}
            bottomContent={tabBarContent}
            bottomContentStyle={styles.overflowVisible}
        >
            <TopBarWithLoadingBar
                breadcrumbLabel={translate('initialSettingsPage.account')}
                shouldDisplaySearch={shouldUseNarrowLayout}
                shouldDisplayHelpButton={shouldUseNarrowLayout}
            />
            <ScrollView
                ref={scrollViewRef}
                onScroll={onScroll}
                scrollEventThrottle={CONST.TIMING.MIN_SMOOTH_SCROLL_EVENT_THROTTLE}
                contentContainerStyle={[styles.w100]}
                showsVerticalScrollIndicator={false}
            >
                {headerContent}
                {accountMenuItems}
                {generalMenuItems}
            </ScrollView>
        </ScreenWrapper>
    );
}

export default withCurrentUserPersonalDetails(InitialSettingsPage);
