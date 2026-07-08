import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import HighlightableMenuItem from '@components/HighlightableMenuItem';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDocumentTitle from '@hooks/useDocumentTitle';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';

import {openDomainPage} from '@libs/actions/Domain';
import {hasDomainAdminsErrors, hasDomainGroupsErrors, hasDomainMembersErrors} from '@libs/DomainUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {DomainSplitNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isAdminSelector} from '@src/selectors/Domain';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {findFocusedRoute, useNavigationState} from '@react-navigation/native';
import {Str} from 'expensify-common';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';

import getDomainMenuItems from './getDomainMenuItems';

type DomainInitialPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.INITIAL>;

function DomainInitialPage({route}: DomainInitialPageProps) {
    const icons = useMemoizedLazyExpensifyIcons(['UserLock', 'UserShield', 'User', 'Users']);
    const styles = useThemeStyles();
    const waitForNavigate = useWaitForNavigation();
    const {singleExecution, isExecuting} = useSingleExecution();
    const activeRoute = useNavigationState((state) => findFocusedRoute(state)?.name);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const domainAccountID = route.params?.domainAccountID;
    const [domain, domainMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`);
    const domainName = domain?.email ? Str.extractEmailDomain(domain.email) : undefined;
    useDocumentTitle(domainName ?? '');
    const isAdmin = isAdminSelector(currentUserAccountID)(domain);
    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`);

    const domainMenuItems = getDomainMenuItems({icons: {User: icons.User, UserShield: icons.UserShield, Users: icons.Users, UserLock: icons.UserLock}}).map((item) => {
        const itemRoute = item.getRoute(domainAccountID);

        let brickRoadIndicator;
        if (item.translationKey === 'domain.domainMembers' && hasDomainMembersErrors(domainErrors)) {
            brickRoadIndicator = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
        } else if (item.translationKey === 'domain.domainAdmins' && hasDomainAdminsErrors(domainErrors)) {
            brickRoadIndicator = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
        } else if (item.translationKey === 'domain.groups.title' && hasDomainGroupsErrors(domainErrors)) {
            brickRoadIndicator = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
        }

        return {
            ...item,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(itemRoute))),
            brickRoadIndicator,
        };
    });

    const fetchDomainData = useCallback(() => {
        if (!domainAccountID) {
            return;
        }
        openDomainPage(domainAccountID);
    }, [domainAccountID]);

    useEffect(() => {
        fetchDomainData();
    }, [fetchDomainData]);

    useNetwork({onReconnect: fetchDomainData});

    const shouldShowFullScreenLoadingIndicator = isLoadingOnyxValue(domainMetadata);

    useEffect(() => {
        if (shouldShowFullScreenLoadingIndicator || (domain && isAdmin)) {
            return;
        }

        Navigation.goBack(ROUTES.DOMAINS_LIST.route);
    }, [domain, isAdmin, shouldShowFullScreenLoadingIndicator]);

    return (
        <ScreenWrapper
            testID="DomainInitialPage"
            enableEdgeToEdgeBottomSafeAreaPadding={false}
            bottomContent={<TabBarBottomContent selectedTab={NAVIGATION_TABS.WORKSPACES} />}
            bottomContentStyle={styles.overflowVisible}
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
                    onBackButtonPress={() => Navigation.goBack(ROUTES.DOMAINS_LIST.route)}
                    shouldDisplayHelpButton={shouldUseNarrowLayout}
                />

                <ScrollView contentContainerStyle={styles.flexColumn}>
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
                                wrapperStyle={styles.sectionMenuItem(shouldUseNarrowLayout)}
                                focused={!!(item.screenName && activeRoute?.startsWith(item.screenName))}
                                shouldIconUseAutoWidthStyle
                            />
                        ))}
                    </View>
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default DomainInitialPage;
