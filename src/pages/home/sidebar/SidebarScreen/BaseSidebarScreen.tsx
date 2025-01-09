import {useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import BottomTabBar, {BOTTOM_TABS} from '@components/Navigation/BottomTabBar';
import TopBar from '@components/Navigation/TopBar';
import ScreenWrapper from '@components/ScreenWrapper';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateLastAccessedWorkspace} from '@libs/actions/Policy/Policy';
import * as Browser from '@libs/Browser';
import getInitialSplitNavigatorState from '@libs/Navigation/AppNavigator/createSplitNavigator/getInitialSplitNavigatorState';
import {getPreservedSplitNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveSplitNavigatorState';
import navigationRef from '@libs/Navigation/navigationRef';
import Performance from '@libs/Performance';
import SidebarLinksData from '@pages/home/sidebar/SidebarLinksData';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

function BaseSidebarScreen() {
    const styles = useThemeStyles();
    const {activeWorkspaceID} = useActiveWorkspace();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [activeWorkspace, activeWorkspaceResult] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activeWorkspaceID ?? CONST.DEFAULT_NUMBER_ID}`);
    const currentRoute = useRoute();
    const isLoading = isLoadingOnyxValue(activeWorkspaceResult);

    useEffect(() => {
        Performance.markStart(CONST.TIMING.SIDEBAR_LOADED);
        Timing.start(CONST.TIMING.SIDEBAR_LOADED);
    }, []);

    useEffect(() => {
        if (!!activeWorkspace || activeWorkspaceID === undefined || isLoading) {
            return;
        }

        // Otherwise, if the workspace is already loaded, we don't need to do anything
        const topmostReport = navigationRef.getRootState()?.routes.findLast((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);

        if (!topmostReport) {
            return;
        }

        // Switching workspace to global should only be performed from the currently opened sidebar screen
        const topmostReportState = topmostReport?.state ?? getPreservedSplitNavigatorState(topmostReport?.key);
        const isCurrentSidebar = topmostReportState?.routes.some((route) => currentRoute.key === route.key);

        if (!isCurrentSidebar) {
            return;
        }

        navigationRef.current?.dispatch({
            target: navigationRef.current.getRootState().key,
            payload: getInitialSplitNavigatorState({name: SCREENS.HOME}, {name: SCREENS.REPORT}),
            type: CONST.NAVIGATION.ACTION_TYPE.REPLACE,
        });
        updateLastAccessedWorkspace(undefined);
    }, [activeWorkspace, activeWorkspaceID, isLoading, currentRoute.key]);

    const shouldDisplaySearch = shouldUseNarrowLayout;

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            style={[styles.sidebar, Browser.isMobile() ? styles.userSelectNone : {}]}
            testID={BaseSidebarScreen.displayName}
            bottomContent={<BottomTabBar selectedTab={BOTTOM_TABS.HOME} />}
        >
            {({insets}) => (
                <>
                    <TopBar
                        breadcrumbLabel={translate('common.inbox')}
                        activeWorkspaceID={activeWorkspaceID}
                        shouldDisplaySearch={shouldDisplaySearch}
                    />
                    <View style={[styles.flex1]}>
                        <SidebarLinksData insets={insets} />
                    </View>
                </>
            )}
        </ScreenWrapper>
    );
}

BaseSidebarScreen.displayName = 'BaseSidebarScreen';

export default BaseSidebarScreen;
