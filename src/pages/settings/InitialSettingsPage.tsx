import {findFocusedRoute, useNavigationState, useRoute} from '@react-navigation/native';
import {filterPersonalCards} from '@selectors/Card';
import {differenceInDays} from 'date-fns';
import {stopLocationUpdatesAsync} from 'expo-location';
import React, {useContext, useEffect, useLayoutEffect, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, ScrollView as RNScrollView, ScrollViewProps, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import AccountSwitcher from '@components/AccountSwitcher';
import AccountSwitcherSkeletonView from '@components/AccountSwitcherSkeletonView';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import {PressableWithFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useCardFeedErrors from '@hooks/useCardFeedErrors';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSingleExecution from '@hooks/useSingleExecution';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {resetExitSurveyForm} from '@libs/actions/ExitSurvey';
import {closeReactNativeApp} from '@libs/actions/HybridApp';
import {hasPartiallySetupBankAccount} from '@libs/BankAccountUtils';
import {hasPendingExpensifyCardAction} from '@libs/CardUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import useIsSidebarRouteActive from '@libs/Navigation/helpers/useIsSidebarRouteActive';
import Navigation from '@libs/Navigation/Navigation';
import {getFreeTrialText, hasSubscriptionRedDotError} from '@libs/SubscriptionUtils';
import {getProfilePageBrickRoadIndicator} from '@libs/UserUtils';
import type SETTINGS_TO_RHP from '@navigation/linkingConfig/RELATIONS/SETTINGS_TO_RHP';
import {showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {BACKGROUND_LOCATION_TRACKING_TASK_NAME} from '@pages/iou/request/step/IOURequestStepDistanceGPS/const';
import variables from '@styles/variables';
import {confirmReadyToOpenApp} from '@userActions/App';
import {openExternalLink, openOldDotLink} from '@userActions/Link';
import {hasPaymentMethodError} from '@userActions/PaymentMethods';
import {hasStashedSession, isSupportAuthToken, signOutAndRedirectToSignIn} from '@userActions/Session';
import {openInitialSettingsPage} from '@userActions/Wallet';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {isTrackingSelector} from '@src/selectors/GPSDraftDetails';
import type {Icon as TIcon} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';

type InitialSettingsPageProps = WithCurrentUserPersonalDetailsProps;

type SettingsTopLevelScreens = keyof typeof SETTINGS_TO_RHP;

type MenuData = {
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
};

type Menu = {sectionStyle: StyleProp<ViewStyle>; sectionTranslationKey: TranslationPaths; items: MenuData[]};

function InitialSettingsPage({currentUserPersonalDetails}: InitialSettingsPageProps) {
    const icons = useMemoizedLazyExpensifyIcons([
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
        'Emoji',
        'CreditCard',
        'Wallet',
        'Bolt',
    ] as const);
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET, {canBeMissing: true});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST, {canBeMissing: true});
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS, {canBeMissing: true});
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});
    const [vacationDelegate] = useOnyx(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {canBeMissing: true});
    const [allCards] = useOnyx(ONYXKEYS.CARD_LIST, {selector: filterPersonalCards, canBeMissing: true});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [stripeCustomerId] = useOnyx(ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [retryBillingSuccessful] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL, {canBeMissing: true});
    const [billingDisputePending] = useOnyx(ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING, {canBeMissing: true});
    const [retryBillingFailed] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED, {canBeMissing: true});
    const [billingStatus] = useOnyx(ONYXKEYS.NVP_PRIVATE_BILLING_STATUS, {canBeMissing: true});
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const network = useNetwork();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isExecuting, singleExecution} = useSingleExecution();
    const popoverAnchor = useRef(null);
    const {translate} = useLocalize();
    const focusedRouteName = useNavigationState((state) => findFocusedRoute(state)?.name);
    const emojiCode = currentUserPersonalDetails?.status?.emojiCode ?? '';
    const isScreenFocused = useIsSidebarRouteActive(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, shouldUseNarrowLayout);
    const hasActivatedWallet = ([CONST.WALLET.TIER_NAME.GOLD, CONST.WALLET.TIER_NAME.PLATINUM] as string[]).includes(userWallet?.tierName ?? '');
    const [firstDayFreeTrial] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, {canBeMissing: true});
    const [isTrackingGPS = false] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {canBeMissing: true, selector: isTrackingSelector});
    const [lastDayFreeTrial] = useOnyx(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, {canBeMissing: true});
    const [unsharedBankAccount] = useOnyx(ONYXKEYS.UNSHARE_BANK_ACCOUNT, {canBeMissing: true});
    const privateSubscription = usePrivateSubscription();
    const subscriptionPlan = useSubscriptionPlan();
    const previousUserPersonalDetails = usePrevious(currentUserPersonalDetails);
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {canBeMissing: true});

    const freeTrialText = getFreeTrialText(translate, policies, introSelected, firstDayFreeTrial, lastDayFreeTrial);

    const shouldDisplayLHB = !shouldUseNarrowLayout;

    const {
        all: {shouldShowRBR},
    } = useCardFeedErrors();

    const hasPendingCardAction = hasPendingExpensifyCardAction(allCards, privatePersonalDetails);
    let walletBrickRoadIndicator;
    if (
        hasPaymentMethodError(bankAccountList, fundList, allCards) ||
        !isEmptyObject(userWallet?.errors) ||
        !isEmptyObject(walletTerms?.errors) ||
        !isEmptyObject(unsharedBankAccount?.errors) ||
        shouldShowRBR
    ) {
        walletBrickRoadIndicator = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    } else if (hasPartiallySetupBankAccount(bankAccountList) || hasPendingCardAction) {
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
        confirmReadyToOpenApp();
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
    const accountItems: MenuData[] = [
        {
            translationKey: 'common.profile',
            icon: icons.Profile,
            screenName: SCREENS.SETTINGS.PROFILE.ROOT,
            brickRoadIndicator: profileBrickRoadIndicator,
            action: () => Navigation.navigate(ROUTES.SETTINGS_PROFILE.getRoute()),
        },
        {
            translationKey: 'common.wallet',
            icon: icons.Wallet,
            screenName: SCREENS.SETTINGS.WALLET.ROOT,
            brickRoadIndicator: walletBrickRoadIndicator,
            action: () => Navigation.navigate(ROUTES.SETTINGS_WALLET),
            badgeText: hasActivatedWallet ? convertToDisplayString(userWallet?.currentBalance) : undefined,
        },
        {
            translationKey: 'common.preferences',
            icon: icons.Gear,
            screenName: SCREENS.SETTINGS.PREFERENCES.ROOT,
            action: () => Navigation.navigate(ROUTES.SETTINGS_PREFERENCES),
        },
        {
            translationKey: 'initialSettingsPage.security',
            icon: icons.Lock,
            screenName: SCREENS.SETTINGS.SECURITY,
            action: () => Navigation.navigate(ROUTES.SETTINGS_SECURITY),
        },
    ];

    if (subscriptionPlan) {
        accountItems.splice(1, 0, {
            translationKey: 'allSettingsScreen.subscription',
            icon: icons.CreditCard,
            screenName: SCREENS.SETTINGS.SUBSCRIPTION.ROOT,
            brickRoadIndicator:
                !!privateSubscription?.errors || hasSubscriptionRedDotError(stripeCustomerId, retryBillingSuccessful, billingDisputePending, retryBillingFailed, fundList, billingStatus)
                    ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                    : undefined,
            badgeText: freeTrialText,
            badgeStyle: freeTrialText ? styles.badgeSuccess : undefined,
            action: () => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION.route),
        });
    }

    const accountMenuItemsData: Menu = {
        sectionStyle: styles.accountSettingsSectionContainer,
        sectionTranslationKey: 'initialSettingsPage.account',
        items: accountItems,
    };

    let classicRedirectMenuItem: MenuData | null = null;
    if (!tryNewDot?.classicRedirect?.isLockedToNewDot) {
        const shouldOpenSurveyReasonPage = tryNewDot?.classicRedirect?.dismissed === false;

        classicRedirectMenuItem = {
            translationKey: 'exitSurvey.goToExpensifyClassic',
            icon: icons.ExpensifyLogoNew,
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
                                  Navigation.navigate(ROUTES.SETTINGS_EXIT_SURVEY_REASON);
                                  return;
                              }
                              Navigation.navigate(ROUTES.SETTINGS_EXIT_SURVEY_CONFIRM.route);
                          });
                      },
                  }),
        };
    }

    /**
     * Return a list of menu items data for general section
     * @returns object with translationKey, style and items for the general section
     */
    const signOutTranslationKey = isSupportAuthToken() && hasStashedSession() ? 'initialSettingsPage.restoreStashed' : 'initialSettingsPage.signOut';
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
                iconRight: icons.NewWindow,
                shouldShowRightIcon: true,
                link: CONST.NEWHELP_URL,
                action: () => {
                    openExternalLink(CONST.NEWHELP_URL);
                },
            },
            {
                translationKey: 'initialSettingsPage.whatIsNew',
                icon: icons.TreasureChest,
                iconRight: icons.NewWindow,
                shouldShowRightIcon: true,
                link: CONST.WHATS_NEW_URL,
                action: () => {
                    openExternalLink(CONST.WHATS_NEW_URL);
                },
            },
            {
                translationKey: 'initialSettingsPage.about',
                icon: icons.Info,
                screenName: SCREENS.SETTINGS.ABOUT,
                action: () => Navigation.navigate(ROUTES.SETTINGS_ABOUT),
            },
            {
                translationKey: 'initialSettingsPage.aboutPage.troubleshoot',
                icon: icons.Lightbulb,
                screenName: SCREENS.SETTINGS.TROUBLESHOOT,
                action: () => Navigation.navigate(ROUTES.SETTINGS_TROUBLESHOOT),
            },
            {
                translationKey: 'sidebarScreen.saveTheWorld',
                icon: icons.Heart,
                screenName: SCREENS.SETTINGS.SAVE_THE_WORLD,
                action: () => Navigation.navigate(ROUTES.SETTINGS_SAVE_THE_WORLD),
            },
            {
                translationKey: signOutTranslationKey,
                icon: icons.Exit,
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
        const openPopover = (link: string | (() => Promise<string>) | undefined, event: GestureResponderEvent | MouseEvent) => {
            if (!isScreenFocused) {
                return;
            }

            if (typeof link === 'function') {
                link?.()?.then((url) =>
                    showContextMenu({
                        type: CONST.CONTEXT_MENU_TYPES.LINK,
                        event,
                        selection: url,
                        contextMenuAnchor: popoverAnchor.current,
                    }),
                );
            } else if (link) {
                showContextMenu({
                    type: CONST.CONTEXT_MENU_TYPES.LINK,
                    event,
                    selection: link,
                    contextMenuAnchor: popoverAnchor.current,
                });
            }
        };

        return (
            <View style={[menuItemsData.sectionStyle, styles.pb4, styles.mh3]}>
                <Text style={styles.sectionTitle}>{translate(menuItemsData.sectionTranslationKey)}</Text>
                {menuItemsData.items.map((item) => {
                    const keyTitle = item.translationKey ? translate(item.translationKey) : item.title;
                    const isFocused = focusedRouteName ? focusedRouteName === item.screenName : false;

                    return (
                        <MenuItem
                            key={keyTitle}
                            wrapperStyle={styles.sectionMenuItem}
                            title={keyTitle}
                            icon={item.icon}
                            iconType={item.iconType}
                            disabled={isExecuting}
                            onPress={singleExecution(item.action)}
                            iconStyles={item.iconStyles}
                            badgeText={item.badgeText}
                            badgeStyle={item.badgeStyle}
                            fallbackIcon={item.fallbackIcon}
                            brickRoadIndicator={item.brickRoadIndicator}
                            shouldStackHorizontally={item.shouldStackHorizontally}
                            ref={popoverAnchor}
                            shouldBlockSelection={!!item.link}
                            onSecondaryInteraction={item.link ? (event) => openPopover(item.link, event) : undefined}
                            focused={isFocused}
                            isPaneMenu
                            iconRight={item.iconRight}
                            shouldShowRightIcon={item.shouldShowRightIcon}
                            shouldIconUseAutoWidthStyle
                        />
                    );
                })}
            </View>
        );
    };

    const accountMenuItems = getMenuItemsSection(accountMenuItemsData);
    const generalMenuItems = getMenuItemsSection(generalMenuItemsData);

    const headerContent = (
        <View style={[styles.ph5, styles.pv4]}>
            {isEmptyObject(currentUserPersonalDetails) || currentUserPersonalDetails.displayName === undefined ? (
                <AccountSwitcherSkeletonView avatarSize={CONST.AVATAR_SIZE.DEFAULT} />
            ) : (
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.gap3]}>
                    <AccountSwitcher isScreenFocused={isScreenFocused} />
                    <Tooltip text={translate('statusPage.status')}>
                        <PressableWithFeedback
                            accessibilityLabel={emojiCode ? `${translate('statusPage.status')}: ${emojiCode}` : translate('statusPage.status')}
                            accessibilityRole="button"
                            accessible
                            onPress={() => Navigation.navigate(ROUTES.SETTINGS_STATUS)}
                        >
                            <View style={styles.primaryMediumIcon}>
                                {emojiCode ? (
                                    <Text style={styles.primaryMediumText}>{emojiCode}</Text>
                                ) : (
                                    <Icon
                                        src={icons.Emoji}
                                        width={variables.iconSizeNormal}
                                        height={variables.iconSizeNormal}
                                        fill={theme.icon}
                                    />
                                )}
                            </View>
                        </PressableWithFeedback>
                    </Tooltip>
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
            bottomContent={!shouldDisplayLHB && <NavigationTabBar selectedTab={NAVIGATION_TABS.SETTINGS} />}
            shouldEnableKeyboardAvoidingView={false}
        >
            {shouldDisplayLHB && <NavigationTabBar selectedTab={NAVIGATION_TABS.SETTINGS} />}
            {headerContent}
            <ScrollView
                ref={scrollViewRef}
                onScroll={onScroll}
                scrollEventThrottle={16}
                contentContainerStyle={[styles.w100]}
                showsVerticalScrollIndicator={false}
            >
                {accountMenuItems}
                {generalMenuItems}
            </ScrollView>
        </ScreenWrapper>
    );
}

export default withCurrentUserPersonalDetails(InitialSettingsPage);
