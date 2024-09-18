import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ScreenWrapper from '@components/ScreenWrapper';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateLastAccessedWorkspace} from '@libs/actions/Policy/Policy';
import * as Browser from '@libs/Browser';
import BottomTabBar from '@libs/Navigation/AppNavigator/createCustomBottomTabNavigator/BottomTabBar';
import TopBar from '@libs/Navigation/AppNavigator/createCustomBottomTabNavigator/TopBar';
import Navigation from '@libs/Navigation/Navigation';
import Performance from '@libs/Performance';
import SidebarLinksData from '@pages/home/sidebar/SidebarLinksData';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

/**
 * Function called when a pinned chat is selected.
 */
const startTimer = () => {
    Timing.start(CONST.TIMING.SWITCH_REPORT);
    Performance.markStart(CONST.TIMING.SWITCH_REPORT);
};

function BaseSidebarScreen() {
    const styles = useThemeStyles();
    const {activeWorkspaceID} = useActiveWorkspace();
    const {translate} = useLocalize();
    const [activeWorkspace] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activeWorkspaceID ?? -1}`);

    useEffect(() => {
        Performance.markStart(CONST.TIMING.SIDEBAR_LOADED);
        Timing.start(CONST.TIMING.SIDEBAR_LOADED);
    }, []);

    // useEffect(() => {
    //     if (!!activeWorkspace || activeWorkspaceID === undefined) {
    //         return;
    //     }

    //     Navigation.switchPolicyID({policyID: undefined});
    //     updateLastAccessedWorkspace(undefined);
    // }, [activeWorkspace, activeWorkspaceID]);

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
                    />
                    <View style={[styles.flex1]}>
                        <SidebarLinksData
                            onLinkClick={startTimer}
                            insets={insets}
                        />
                    </View>
                    <BottomTabBar selectedTab={SCREENS.HOME} />
                </>
            )}
        </ScreenWrapper>
    );
}

BaseSidebarScreen.displayName = 'BaseSidebarScreen';

export default BaseSidebarScreen;
