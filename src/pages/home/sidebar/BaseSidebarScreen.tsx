import {useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import BottomTabBar from '@components/Navigation/BottomTabBar';
import BOTTOM_TABS from '@components/Navigation/BottomTabBar/BOTTOM_TABS';
import TopBar from '@components/Navigation/TopBar';
import ScreenWrapper from '@components/ScreenWrapper';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateLastAccessedWorkspace} from '@libs/actions/Policy/Policy';
import {isMobile} from '@libs/Browser';
import getInitialSplitNavigatorState from '@libs/Navigation/AppNavigator/createSplitNavigator/getInitialSplitNavigatorState';
import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import getTopmostReportsSplitNavigator from '@libs/Navigation/helpers/getTopmostReportsSplitNavigator';
import Navigation from '@libs/Navigation/Navigation';
import Performance from '@libs/Performance';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import SidebarLinksData from './SidebarLinksData';

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
        const topmostReportSplit = getTopmostReportsSplitNavigator();
        const topmostReportSplitPolicyID = topmostReportSplit?.params && `policyID` in topmostReportSplit.params ? topmostReportSplit.params.policyID : undefined;
        const hasWorkspaceBeenDeleted = !activeWorkspace && activeWorkspaceResult.status === 'loaded' && !!topmostReportSplitPolicyID;

        if (!topmostReportSplit || !hasWorkspaceBeenDeleted || isLoading) {
            return;
        }

        // Switching workspace to global should only be performed from the currently opened sidebar screen
        const topmostReportSplitState = topmostReportSplit?.state ?? getPreservedNavigatorState(topmostReportSplit?.key);
        const isCurrentSidebar = topmostReportSplitState?.routes.some((route) => currentRoute.key === route.key);

        if (!isCurrentSidebar) {
            return;
        }

        const reportsSplitNavigatorWithoutPolicyID = getInitialSplitNavigatorState({name: SCREENS.HOME}, {name: SCREENS.REPORT});
        Navigation.replaceWithSplitNavigator(reportsSplitNavigatorWithoutPolicyID);
        updateLastAccessedWorkspace(undefined);
    }, [activeWorkspace, isLoading, currentRoute.key, activeWorkspaceResult]);

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            style={[styles.sidebar, isMobile() ? styles.userSelectNone : {}]}
            testID={BaseSidebarScreen.displayName}
            bottomContent={<BottomTabBar selectedTab={BOTTOM_TABS.HOME} />}
        >
            {({insets}) => (
                <>
                    <TopBar
                        breadcrumbLabel={translate('common.inbox')}
                        activeWorkspaceID={activeWorkspaceID}
                        shouldDisplaySearch={shouldUseNarrowLayout}
                        shouldDisplayHelpButton={shouldUseNarrowLayout}
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
