import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ScreenWrapper from '@components/ScreenWrapper';
import useActiveWorkspaceFromNavigationState from '@hooks/useActiveWorkspaceFromNavigationState';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateLastAccessedWorkspace} from '@libs/actions/Policy/Policy';
import * as Browser from '@libs/Browser';
import TopBar from '@libs/Navigation/AppNavigator/createCustomBottomTabNavigator/TopBar';
import Navigation from '@libs/Navigation/Navigation';
import Performance from '@libs/Performance';
import SidebarLinksData from '@pages/home/sidebar/SidebarLinksData';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function BaseSidebarScreen() {
    const styles = useThemeStyles();
    const activeWorkspaceID = useActiveWorkspaceFromNavigationState();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [activeWorkspace] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activeWorkspaceID ?? -1}`);

    useEffect(() => {
        Performance.markStart(CONST.TIMING.SIDEBAR_LOADED);
    }, []);

    const isSwitchingWorkspace = useRef(false);
    useEffect(() => {
        // Whether the active workspace or the "Everything" page is loaded
        const isWorkspaceOrEverythingLoaded = !!activeWorkspace || activeWorkspaceID === undefined;

        // If we are currently switching workspaces, we don't want to do anything until the target workspace is loaded
        if (isSwitchingWorkspace.current) {
            if (isWorkspaceOrEverythingLoaded) {
                isSwitchingWorkspace.current = false;
            }
            return;
        }

        // Otherwise, if the workspace is already loaded, we don't need to do anything
        if (isWorkspaceOrEverythingLoaded) {
            return;
        }

        isSwitchingWorkspace.current = true;
        Navigation.navigateWithSwitchPolicyID({policyID: undefined});
        updateLastAccessedWorkspace(undefined);
    }, [activeWorkspace, activeWorkspaceID]);

    const shouldDisplaySearch = shouldUseNarrowLayout;

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            style={[styles.sidebar, Browser.isMobile() ? styles.userSelectNone : {}, styles.pb0]}
            testID={BaseSidebarScreen.displayName}
            includePaddingTop={false}
        >
            {({insets}) => (
                <>
                    <TopBar
                        breadcrumbLabel={translate('common.inbox')}
                        activeWorkspaceID={activeWorkspaceID}
                        shouldDisplaySearch={shouldDisplaySearch}
                        onSwitchWorkspace={() => (isSwitchingWorkspace.current = true)}
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
