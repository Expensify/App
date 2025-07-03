import HybridAppModule from '@expensify/react-native-hybrid-app/src';
import {findFocusedRoute, useNavigationState, useRoute} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, ScrollView as RNScrollView, ScrollViewProps, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import AccountSwitcher from '@components/AccountSwitcher';
import AccountSwitcherSkeletonView from '@components/AccountSwitcherSkeletonView';
import ConfirmModal from '@components/ConfirmModal';
import CustomStatusBarAndBackgroundContext from '@components/CustomStatusBarAndBackground/CustomStatusBarAndBackgroundContext';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
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
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSingleExecution from '@hooks/useSingleExecution';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {resetExitSurveyForm} from '@libs/actions/ExitSurvey';
import {checkIfFeedConnectionIsBroken} from '@libs/CardUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import useIsSidebarRouteActive from '@libs/Navigation/helpers/useIsSidebarRouteActive';
import Navigation from '@libs/Navigation/Navigation';
import {getFreeTrialText, hasSubscriptionRedDotError} from '@libs/SubscriptionUtils';
import {getProfilePageBrickRoadIndicator} from '@libs/UserUtils';
import type SETTINGS_TO_RHP from '@navigation/linkingConfig/RELATIONS/SETTINGS_TO_RHP';
import {showContextMenu} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import variables from '@styles/variables';
import {confirmReadyToOpenApp} from '@userActions/App';
import {openExternalLink} from '@userActions/Link';
import {hasPaymentMethodError} from '@userActions/PaymentMethods';
import {isSupportAuthToken, signOutAndRedirectToSignIn} from '@userActions/Session';
import {openInitialSettingsPage} from '@userActions/Wallet';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
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
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET, {canBeMissing: true});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST, {canBeMissing: true});
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS, {canBeMissing: true});
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {canBeMissing: true});
    const [allCards] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const network = useNetwork();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isExecuting, singleExecution} = useSingleExecution();
    const popoverAnchor = useRef(null);
    const {translate} = useLocalize();
    const focusedRouteName = useNavigationState((state) => findFocusedRoute(state)?.name);
    const emojiCode = currentUserPersonalDetails?.status?.emojiCode ?? '';
    const {setRootStatusBarEnabled} = useContext(CustomStatusBarAndBackgroundContext);
    const isScreenFocused = useIsSidebarRouteActive(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, shouldUseNarrowLayout);
    const hasActivatedWallet = ([CONST.WALLET.TIER_NAME.GOLD, CONST.WALLET.TIER_NAME.PLATINUM] as string[]).includes(userWallet?.tierName ?? '');

    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION, {canBeMissing: true});
    const subscriptionPlan = useSubscriptionPlan();

    const shouldLogout = useRef(false);

    const freeTrialText = getFreeTrialText(policies);

    const shouldDisplayLHB = !shouldUseNarrowLayout;

    const hasBrokenFeedConnection = checkIfFeedConnectionIsBroken(allCards, CONST.EXPENSIFY_CARD.BANK);
    const walletBrickRoadIndicator =
        hasPaymentMethodError(bankAccountList, fundList) || !isEmptyObject(userWallet?.errors) || !isEmptyObject(walletTerms?.errors) || hasBrokenFeedConnection ? 'error' : undefined;

    const [shouldShowSignoutConfirmModal, setShouldShowSignoutConfirmModal] = useState(false);

    const shouldOpenSurveyReasonPage = tryNewDot?.classicRedirect?.dismissed === false;

    useEffect(() => {
        openInitialSettingsPage();
        confirmReadyToOpenApp();
    }, []);

    const toggleSignoutConfirmModal = (value: boolean) => {
        setShouldShowSignoutConfirmModal(value);
    };

    const signOut = useCallback(
        (shouldForceSignout = false) => {
            if (!network.isOffline || shouldForceSignout) {
                signOutAndRedirectToSignIn();
                return;
            }

            // When offline, warn the user that any actions they took while offline will be lost if they sign out
            toggleSignoutConfirmModal(true);
        },
        [network.isOffline],
    );

    /**
     * Return a list of menu items data for account section
     * @returns object with translationKey, style and items for the account section
     */
    const accountMenuItemsData: Menu = useMemo(() => {
        const profileBrickRoadIndicator = getProfilePageBrickRoadIndicator(loginList, privatePersonalDetails);
        const items: MenuData[] = [
            {
                translationKey: 'common.profile',
                icon: Expensicons.Profile,
                screenName: SCREENS.SETTINGS.PROFILE.ROOT,
                brickRoadIndicator: profileBrickRoadIndicator,
                action: () => Navigation.navigate(ROUTES.SETTINGS_PROFILE.getRoute()),
            },
            {
                translationKey: 'common.wallet',
                icon: Expensicons.Wallet,
                screenName: SCREENS.SETTINGS.WALLET.ROOT,
                brickRoadIndicator: walletBrickRoadIndicator,
                action: () => Navigation.navigate(ROUTES.SETTINGS_WALLET),
                badgeText: hasActivatedWallet ? convertToDisplayString(userWallet?.currentBalance) : undefined,
            },
            {
                translationKey: 'common.preferences',
                icon: Expensicons.Gear,
                screenName: SCREENS.SETTINGS.PREFERENCES.ROOT,
                action: () => Navigation.navigate(ROUTES.SETTINGS_PREFERENCES),
            },
            {
                translationKey: 'initialSettingsPage.security',
                icon: Expensicons.Lock,
                screenName: SCREENS.SETTINGS.SECURITY,
                action: () => Navigation.navigate(ROUTES.SETTINGS_SECURITY),
            },
        ];

        if (subscriptionPlan) {
            items.splice(1, 0, {
                translationKey: 'allSettingsScreen.subscription',
                icon: Expensicons.CreditCard,
                screenName: SCREENS.SETTINGS.SUBSCRIPTION.ROOT,
                brickRoadIndicator: !!privateSubscription?.errors || hasSubscriptionRedDotError() ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                badgeText: freeTrialText,
                badgeStyle: freeTrialText ? styles.badgeSuccess : undefined,
                action: () => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION.route),
            });
        }

        return {
            sectionStyle: styles.accountSettingsSectionContainer,
            sectionTranslationKey: 'initialSettingsPage.account',
            items,
        };
    }, [
        loginList,
        privatePersonalDetails,
        walletBrickRoadIndicator,
        hasActivatedWallet,
        userWallet?.currentBalance,
        subscriptionPlan,
        styles.accountSettingsSectionContainer,
        styles.badgeSuccess,
        privateSubscription?.errors,
        freeTrialText,
    ]);

    /**
     * Return a list of menu items data for general section
     * @returns object with translationKey, style and items for the general section
     */
    const generalMenuItemsData: Menu = useMemo(() => {
        const signOutTranslationKey = isSupportAuthToken() ? 'initialSettingsPage.restoreStashed' : 'initialSettingsPage.signOut';
        return {
            sectionStyle: {
                ...styles.pt4,
            },
            sectionTranslationKey: 'initialSettingsPage.general',
            items: [
                {
                    translationKey: 'initialSettingsPage.help',
                    icon: Expensicons.QuestionMark,
                    iconRight: Expensicons.NewWindow,
                    shouldShowRightIcon: true,
                    link: CONST.NEWHELP_URL,
                    action: () => {
                        openExternalLink(CONST.NEWHELP_URL);
                    },
                },
                {
                    translationKey: 'exitSurvey.goToExpensifyClassic',
                    icon: Expensicons.ExpensifyLogoNew,
                    ...(CONFIG.IS_HYBRID_APP
                        ? {
                              action: () => {
                                  HybridAppModule.closeReactNativeApp({shouldSignOut: false, shouldSetNVP: true});
                                  setRootStatusBarEnabled(false);
                              },
                          }
                        : {
                              action() {
                                  resetExitSurveyForm(() => {
                                      if (shouldOpenSurveyReasonPage) {
                                          Navigation.navigate(ROUTES.SETTINGS_EXIT_SURVEY_REASON.route);
                                          return;
                                      }
                                      Navigation.navigate(ROUTES.SETTINGS_EXIT_SURVEY_CONFIRM.route);
                                  });
                              },
                          }),
                },
                {
                    translationKey: 'initialSettingsPage.about',
                    icon: Expensicons.Info,
                    screenName: SCREENS.SETTINGS.ABOUT,
                    action: () => Navigation.navigate(ROUTES.SETTINGS_ABOUT),
                },
                {
                    translationKey: 'initialSettingsPage.aboutPage.troubleshoot',
                    icon: Expensicons.Lightbulb,
                    screenName: SCREENS.SETTINGS.TROUBLESHOOT,
                    action: () => Navigation.navigate(ROUTES.SETTINGS_TROUBLESHOOT),
                },
                {
                    translationKey: 'sidebarScreen.saveTheWorld',
                    icon: Expensicons.Heart,
                    screenName: SCREENS.SETTINGS.SAVE_THE_WORLD,
                    action: () => Navigation.navigate(ROUTES.SETTINGS_SAVE_THE_WORLD),
                },
                {
                    translationKey: signOutTranslationKey,
                    icon: Expensicons.Exit,
                    action: () => {
                        signOut(false);
                    },
                },
            ],
        };
    }, [styles.pt4, setRootStatusBarEnabled, shouldOpenSurveyReasonPage, signOut]);

    /**
     * Return JSX.Element with menu items
     * @param menuItemsData list with menu items data
     * @returns the menu items for passed data
     */
    const getMenuItemsSection = useCallback(
        (menuItemsData: Menu) => {
            const openPopover = (link: string | (() => Promise<string>) | undefined, event: GestureResponderEvent | MouseEvent) => {
                if (!Navigation.isActiveRoute(ROUTES.SETTINGS)) {
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
                                onPress={singleExecution(() => {
                                    item.action();
                                })}
                                iconStyles={item.iconStyles}
                                badgeText={item.badgeText}
                                badgeStyle={item.badgeStyle}
                                fallbackIcon={item.fallbackIcon}
                                brickRoadIndicator={item.brickRoadIndicator}
                                floatRightAvatars={item.floatRightAvatars}
                                shouldStackHorizontally={item.shouldStackHorizontally}
                                floatRightAvatarSize={item.avatarSize}
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
        },
        [styles.pb4, styles.mh3, styles.sectionTitle, styles.sectionMenuItem, translate, focusedRouteName, isExecuting, singleExecution],
    );

    const accountMenuItems = useMemo(() => getMenuItemsSection(accountMenuItemsData), [accountMenuItemsData, getMenuItemsSection]);
    const generalMenuItems = useMemo(() => getMenuItemsSection(generalMenuItemsData), [generalMenuItemsData, getMenuItemsSection]);

    const headerContent = (
        <View style={[styles.ph5, styles.pv4]}>
            {isEmptyObject(currentUserPersonalDetails) || currentUserPersonalDetails.displayName === undefined ? (
                <AccountSwitcherSkeletonView avatarSize={CONST.AVATAR_SIZE.DEFAULT} />
            ) : (
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.gap3]}>
                    <AccountSwitcher isScreenFocused={isScreenFocused} />
                    <Tooltip text={translate('statusPage.status')}>
                        <PressableWithFeedback
                            accessibilityLabel={translate('statusPage.status')}
                            accessibilityRole="button"
                            accessible
                            onPress={() => Navigation.navigate(ROUTES.SETTINGS_STATUS)}
                        >
                            <View style={styles.primaryMediumIcon}>
                                {emojiCode ? (
                                    <Text style={styles.primaryMediumText}>{emojiCode}</Text>
                                ) : (
                                    <Icon
                                        src={Expensicons.Emoji}
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

    const onScroll = useCallback<NonNullable<ScrollViewProps['onScroll']>>(
        (e) => {
            // If the layout measurement is 0, it means the flash list is not displayed but the onScroll may be triggered with offset value 0.
            // We should ignore this case.
            if (e.nativeEvent.layoutMeasurement.height === 0) {
                return;
            }
            saveScrollOffset(route, e.nativeEvent.contentOffset.y);
        },
        [route, saveScrollOffset],
    );

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
            testID={InitialSettingsPage.displayName}
            bottomContent={!shouldDisplayLHB && <NavigationTabBar selectedTab={NAVIGATION_TABS.SETTINGS} />}
            shouldEnableKeyboardAvoidingView={false}
        >
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
                <ConfirmModal
                    danger
                    title={translate('common.areYouSure')}
                    prompt={translate('initialSettingsPage.signOutConfirmationText')}
                    confirmText={translate('initialSettingsPage.signOut')}
                    cancelText={translate('common.cancel')}
                    isVisible={shouldShowSignoutConfirmModal}
                    onConfirm={() => {
                        toggleSignoutConfirmModal(false);
                        shouldLogout.current = true;
                    }}
                    onCancel={() => toggleSignoutConfirmModal(false)}
                    onModalHide={() => {
                        if (!shouldLogout.current) {
                            return;
                        }
                        signOut(true);
                    }}
                />
            </ScrollView>
            {shouldDisplayLHB && <NavigationTabBar selectedTab={NAVIGATION_TABS.SETTINGS} />}
        </ScreenWrapper>
    );
}

InitialSettingsPage.displayName = 'InitialSettingsPage';

export default withCurrentUserPersonalDetails(InitialSettingsPage);
