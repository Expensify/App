import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {getDomainsWithErrors} from '@libs/DomainUtils';
import Navigation from '@libs/Navigation/Navigation';

import useReviewDomainAdminRequests from '@pages/home/ForYouSection/useReviewDomainAdminRequests';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

import {useDebugTabViewHeight} from './Navigation/DebugTabView';
import NAVIGATION_TABS from './Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from './Navigation/TabBarBottomContent';
import TopBarWithLoadingBar from './Navigation/TopBarWithLoadingBar';
import OfflineIndicator from './OfflineIndicator';
import ScreenWrapper from './ScreenWrapper';
import TabSelectorBase from './TabSelector/TabSelectorBase';

type WorkspaceListActiveTabKey = 'workspaces' | 'domains';

type WorkspaceListHeaderContentProps = {
    activeTabKey: WorkspaceListActiveTabKey;
    headerButton?: React.ReactNode;
    shouldShowHeaderButton?: boolean;
};

type WorkspaceListLayoutProps = {
    children: React.ReactNode;
    headerButton?: React.ReactNode;
    headerComponent?: React.ReactElement;
    activeTabKey: WorkspaceListActiveTabKey;
    scrollHeaderWithTable?: boolean;
};

function WorkspaceListHeaderContent({activeTabKey, headerButton, shouldShowHeaderButton = true}: WorkspaceListHeaderContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Globe', 'Building']);
    const {domainAccountIDs: pendingDomainAdminRequestAccountIDs} = useReviewDomainAdminRequests();
    const [allDomainErrors] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN_ERRORS);
    const [allDomains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);
    const errorDomainAccountIDs = getDomainsWithErrors(allDomainErrors, allDomains).map(([key]) => Number(key.replace(ONYXKEYS.COLLECTION.DOMAIN_ERRORS, '')));

    // Domains tab badge: counts the domain rows needing attention (a pending admin request or an error).
    // A domain with both is counted once so the badge matches the number of marked rows in the list.
    // The count is colored red when any marked row has an error, otherwise green.
    const hasDomainErrors = errorDomainAccountIDs.length > 0;
    const markedDomainAccountIDs = new Set([...pendingDomainAdminRequestAccountIDs, ...errorDomainAccountIDs]);
    const domainsBadgeCount = markedDomainAccountIDs.size;
    const domainsBadgeText = domainsBadgeCount > 0 ? domainsBadgeCount.toString() : undefined;
    const navigationOptions = [
        {
            key: 'workspaces',
            title: translate('common.workspaces'),
            icon: icons.Building,
            route: ROUTES.WORKSPACES_LIST.getRoute(),
            screenName: SCREENS.WORKSPACES_LIST,
        },
        {
            key: 'domains',
            title: translate('common.domains'),
            icon: icons.Globe,
            route: ROUTES.DOMAINS_LIST.getRoute(),
            screenName: SCREENS.DOMAINS_LIST,
            badgeText: domainsBadgeText,
            isBadgeCondensed: true,
            isBadgeError: hasDomainErrors,
        },
    ];

    const onTabPress = (key: string) => {
        const matchingNavigationOption = navigationOptions.find((option) => option.key === key);

        if (!matchingNavigationOption) {
            return;
        }

        Navigation.navigate(matchingNavigationOption.route);
    };

    return (
        <View style={[styles.flexRow, styles.justifyContentBetween, styles.pr5, styles.pt1, styles.pb2]}>
            <TabSelectorBase
                tabs={navigationOptions}
                activeTabKey={activeTabKey}
                onTabPress={onTabPress}
            />
            {shouldShowHeaderButton && headerButton}
        </View>
    );
}

function WorkspaceListLayout({children, activeTabKey, headerButton, headerComponent, scrollHeaderWithTable = false}: WorkspaceListLayoutProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const debugTabViewHeight = useDebugTabViewHeight();
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();

    const isWorkspacesListPage = activeTabKey === 'workspaces';
    const testID = isWorkspacesListPage ? 'WorkspacesListPage' : 'DomainsListPage';
    const activeTabLabel = isWorkspacesListPage ? translate('common.workspaces') : translate('common.domains');
    const headerContent = headerComponent ?? (
        <WorkspaceListHeaderContent
            activeTabKey={activeTabKey}
            headerButton={headerButton}
            shouldShowHeaderButton={shouldDisplayButtonsInSeparateLine}
        />
    );

    const content = (
        <>
            {!scrollHeaderWithTable && headerContent}
            {children}
        </>
    );

    return (
        <ScreenWrapper
            testID={testID}
            shouldEnableMaxHeight
            shouldEnablePickerAvoiding={false}
            enableEdgeToEdgeBottomSafeAreaPadding={false}
            bottomContentStyle={styles.overflowVisible}
            bottomContent={<TabBarBottomContent selectedTab={NAVIGATION_TABS.WORKSPACES} />}
        >
            <View style={[styles.flex1, styles.flexRow]}>
                <View style={[styles.flex1]}>
                    <TopBarWithLoadingBar
                        shouldDisplayHelpButton
                        breadcrumbLabel={activeTabLabel}
                    >
                        {!scrollHeaderWithTable && <View style={[styles.pr3]}>{!shouldDisplayButtonsInSeparateLine && headerButton}</View>}
                    </TopBarWithLoadingBar>

                    {content}
                    {!shouldUseNarrowLayout && <OfflineIndicator style={styles.pl5} />}
                    {debugTabViewHeight > 0 && (
                        <View
                            style={StyleUtils.getHeight(debugTabViewHeight)}
                            testID="DebugTabViewSpacer"
                        />
                    )}
                </View>
            </View>
        </ScreenWrapper>
    );
}

export {WorkspaceListHeaderContent};
export default WorkspaceListLayout;
