import {findFocusedRoute, useNavigationState} from '@react-navigation/native';
import {Str} from 'expensify-common';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import HighlightableMenuItem from '@components/HighlightableMenuItem';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import {confirmReadyToOpenApp} from '@libs/actions/App';
import {openDomainInitialPage} from '@libs/actions/Domain';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type DOMAIN_TO_RHP from '@navigation/linkingConfig/RELATIONS/DOMAIN_TO_RHP';
import type {DomainSplitNavigatorParamList} from '@navigation/types';
import type CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type IconAsset from '@src/types/utils/IconAsset';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type DomainTopLevelScreens = keyof typeof DOMAIN_TO_RHP;

type DomainMenuItem = {
    translationKey: TranslationPaths;
    icon: IconAsset;
    action: () => void;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    screenName: DomainTopLevelScreens;
    badgeText?: string;
    highlighted?: boolean;
};

type DomainInitialPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.INITIAL>;

function DomainInitialPage({route}: DomainInitialPageProps) {
    const icons = useMemoizedLazyExpensifyIcons(['UserLock', 'UserShield']);
    const styles = useThemeStyles();
    const waitForNavigate = useWaitForNavigation();
    const {singleExecution, isExecuting} = useSingleExecution();
    const activeRoute = useNavigationState((state) => findFocusedRoute(state)?.name);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const shouldDisplayLHB = !shouldUseNarrowLayout;

    const domainAccountID = route.params?.domainAccountID;
    const [domain, domainMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: true});
    const domainName = domain?.email ? Str.extractEmailDomain(domain.email) : undefined;
    const [isAdmin, isAdminMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_ADMIN_ACCESS}${domainAccountID}`, {canBeMissing: false});

    const domainMenuItems: DomainMenuItem[] = [
        {
            translationKey: 'domain.domainAdmins',
            icon: icons.UserShield,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.DOMAIN_ADMINS.getRoute(domainAccountID)))),
            screenName: SCREENS.DOMAIN.ADMINS,
        },
        {
            translationKey: 'domain.saml',
            icon: icons.UserLock,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.DOMAIN_SAML.getRoute(domainAccountID)))),
            screenName: SCREENS.DOMAIN.SAML,
        },
    ];

    const fetchDomainData = useCallback(() => {
        if (!domainName) {
            return;
        }
        openDomainInitialPage(domainName);
    }, [domainName]);

    useEffect(() => {
        fetchDomainData();
    }, [fetchDomainData]);

    useNetwork({onReconnect: fetchDomainData});

    useEffect(() => {
        confirmReadyToOpenApp();
    }, []);

    const shouldShowFullScreenLoadingIndicator = isLoadingOnyxValue(domainMetadata, isAdminMetadata);

    useEffect(() => {
        if (shouldShowFullScreenLoadingIndicator || (domain && isAdmin)) {
            return;
        }

        Navigation.goBack(ROUTES.WORKSPACES_LIST.route);
    }, [domain, isAdmin, shouldShowFullScreenLoadingIndicator]);

    return (
        <ScreenWrapper
            testID="DomainInitialPage"
            enableEdgeToEdgeBottomSafeAreaPadding={false}
            bottomContent={
                !shouldDisplayLHB && (
                    <NavigationTabBar
                        selectedTab={NAVIGATION_TABS.WORKSPACES}
                        shouldShowFloatingButtons={false}
                    />
                )
            }
        >
            <FullPageNotFoundView
                onBackButtonPress={() => Navigation.dismissModal()}
                onLinkPress={Navigation.goBackToHome}
                shouldShow={!domain || !isAdmin}
                addBottomSafeAreaPadding
                shouldForceFullScreen
                shouldDisplaySearchRouter
            >
                <HeaderWithBackButton
                    title={domainName}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACES_LIST.route)}
                    shouldDisplayHelpButton={shouldUseNarrowLayout}
                />

                <ScrollView contentContainerStyle={[styles.flexColumn]}>
                    <View style={[styles.pb4, styles.mh3, styles.mt3]}>
                        {/*
                            Ideally we should use MenuList component for MenuItems with singleExecution/Navigation actions.
                            In this case where user can click on menu items, we need to have a check for `isExecuting`. So, we are directly mapping menuItems.
                        */}
                        {domainMenuItems.map((item) => (
                            <HighlightableMenuItem
                                key={item.translationKey}
                                disabled={isExecuting}
                                title={translate(item.translationKey)}
                                icon={item.icon}
                                onPress={item.action}
                                brickRoadIndicator={item.brickRoadIndicator}
                                wrapperStyle={styles.sectionMenuItem}
                                highlighted={!!item?.highlighted}
                                focused={!!(item.screenName && activeRoute?.startsWith(item.screenName))}
                                badgeText={item.badgeText}
                                shouldIconUseAutoWidthStyle
                            />
                        ))}
                    </View>
                </ScrollView>
                {shouldDisplayLHB && <NavigationTabBar selectedTab={NAVIGATION_TABS.WORKSPACES} />}
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default DomainInitialPage;
