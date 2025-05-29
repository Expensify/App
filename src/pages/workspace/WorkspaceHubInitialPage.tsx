import {findFocusedRoute, useNavigationState, useRoute} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, ScrollView as RNScrollView, ScrollViewProps, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ConfirmModal from '@components/ConfirmModal';
import DelegateNoAccessModal from '@components/DelegateNoAccessModal';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TopBar from '@components/Navigation/TopBar';
import ScreenWrapper from '@components/ScreenWrapper';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSingleExecution from '@hooks/useSingleExecution';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useThemeStyles from '@hooks/useThemeStyles';
import type {WORKSPACE_HUB_TO_RHP} from '@libs/Navigation/linkingConfig/RELATIONS';
import Navigation from '@libs/Navigation/Navigation';
import {getFreeTrialText, hasSubscriptionRedDotError} from '@libs/SubscriptionUtils';
import {hasGlobalWorkspaceSettingsRBR} from '@libs/WorkspacesSettingsUtils';
import {showContextMenu} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import {confirmReadyToOpenApp} from '@userActions/App';
import {buildOldDotURL, openOldDotLink} from '@userActions/Link';
import {signOutAndRedirectToSignIn} from '@userActions/Session';
import {openInitialSettingsPage} from '@userActions/Wallet';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Icon as TIcon} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';

type WorkspaceHubTopLevelScreens = keyof typeof WORKSPACE_HUB_TO_RHP;

type MenuData = {
    translationKey: TranslationPaths;
    icon: IconAsset;
    screenName?: WorkspaceHubTopLevelScreens;
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

function WorkspaceHubInitialPage() {
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});

    const [isNoDelegateAccessMenuVisible, setIsNoDelegateAccessMenuVisible] = useState(false);

    const network = useNetwork();
    const styles = useThemeStyles();
    const {isExecuting, singleExecution} = useSingleExecution();
    const popoverAnchor = useRef(null);
    const {translate} = useLocalize();
    const focusedRouteName = useNavigationState((state) => findFocusedRoute(state)?.name);
    const [allConnectionSyncProgresses] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}`, {canBeMissing: true});
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldDisplayLHB = !shouldUseNarrowLayout;

    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION, {canBeMissing: true});
    const subscriptionPlan = useSubscriptionPlan();

    const [shouldShowSignoutConfirmModal, setShouldShowSignoutConfirmModal] = useState(false);

    const freeTrialText = getFreeTrialText(policies);

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
     * Returns a list of menu items data for workspace section
     * @returns object with translationKey, style and items for the workspace section
     */
    const workspaceMenuItemsData: MenuData[] = useMemo(() => {
        const items: MenuData[] = [
            {
                translationKey: 'common.workspaces',
                icon: Expensicons.Buildings,
                screenName: SCREENS.WORKSPACE_HUB.WORKSPACES,
                brickRoadIndicator: hasGlobalWorkspaceSettingsRBR(policies, allConnectionSyncProgresses) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                action: () => Navigation.navigate(ROUTES.SETTINGS_WORKSPACES.route),
            },
            {
                translationKey: 'allSettingsScreen.domains',
                icon: Expensicons.Globe,
                shouldShowRightIcon: true,
                iconRight: Expensicons.NewWindow,
                link: () => buildOldDotURL(CONST.OLDDOT_URLS.ADMIN_DOMAINS_URL),
                action: () => {
                    openOldDotLink(CONST.OLDDOT_URLS.ADMIN_DOMAINS_URL);
                },
            },
        ];

        if (subscriptionPlan) {
            items.splice(1, 0, {
                translationKey: 'allSettingsScreen.subscription',
                icon: Expensicons.CreditCard,
                screenName: SCREENS.WORKSPACE_HUB.SUBSCRIPTION.ROOT,
                brickRoadIndicator: !!privateSubscription?.errors || hasSubscriptionRedDotError() ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                badgeText: freeTrialText,
                badgeStyle: freeTrialText ? styles.badgeSuccess : undefined,
                action: () => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION.route),
            });
        }

        return items;
    }, [allConnectionSyncProgresses, freeTrialText, policies, privateSubscription?.errors, styles.badgeSuccess, subscriptionPlan]);

    /**
     * Returns JSX.Element with menu items
     * @param menuItemsData list with menu items data
     * @returns the menu items for passed data
     */
    const getMenuItemsSection = useCallback(
        (items: MenuData[]) => {
            /**
             * @param isPaymentItem whether the item being rendered is the payments menu item
             * @returns the user's wallet balance
             */

            const openPopover = (link: string | (() => Promise<string>) | undefined, event: GestureResponderEvent | MouseEvent) => {
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
                <View style={styles.p3}>
                    {items.map((item) => {
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
        [styles.p3, styles.sectionMenuItem, translate, focusedRouteName, isExecuting, singleExecution],
    );

    const workspaceMenuItems = useMemo(() => getMenuItemsSection(workspaceMenuItemsData), [workspaceMenuItemsData, getMenuItemsSection]);

    const {saveScrollOffset, getScrollOffset} = useContext(ScrollOffsetContext);
    const route = useRoute();
    const scrollViewRef = useRef<RNScrollView>(null);

    const onScroll = useCallback<NonNullable<ScrollViewProps['onScroll']>>(
        (e) => {
            // If the layout measurement is 0, it means the FlashList is not displayed but the onScroll may be triggered with offset value 0.
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
            testID={WorkspaceHubInitialPage.displayName}
            bottomContent={!shouldDisplayLHB && <NavigationTabBar selectedTab={NAVIGATION_TABS.WORKSPACES} />}
            shouldEnableKeyboardAvoidingView={false}
        >
            <TopBar
                shouldDisplaySearch={shouldUseNarrowLayout}
                breadcrumbLabel={translate('common.workspaces')}
            />
            <ScrollView
                ref={scrollViewRef}
                onScroll={onScroll}
                scrollEventThrottle={16}
                contentContainerStyle={[styles.w100]}
                showsVerticalScrollIndicator={false}
            >
                {workspaceMenuItems}
                <ConfirmModal
                    danger
                    title={translate('common.areYouSure')}
                    prompt={translate('initialSettingsPage.signOutConfirmationText')}
                    confirmText={translate('initialSettingsPage.signOut')}
                    cancelText={translate('common.cancel')}
                    isVisible={shouldShowSignoutConfirmModal}
                    onConfirm={() => signOut(true)}
                    onCancel={() => toggleSignoutConfirmModal(false)}
                />
            </ScrollView>
            <DelegateNoAccessModal
                isNoDelegateAccessMenuVisible={isNoDelegateAccessMenuVisible}
                onClose={() => setIsNoDelegateAccessMenuVisible(false)}
            />
            {shouldDisplayLHB && <NavigationTabBar selectedTab={NAVIGATION_TABS.WORKSPACES} />}
        </ScreenWrapper>
    );
}

WorkspaceHubInitialPage.displayName = 'WorkspaceHubInitialPage';

export default WorkspaceHubInitialPage;
