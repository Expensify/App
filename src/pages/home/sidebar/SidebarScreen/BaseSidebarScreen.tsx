import React, {useEffect} from 'react';
import {View} from 'react-native';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Browser from '@libs/Browser';
import TopBar from '@libs/Navigation/AppNavigator/createCustomBottomTabNavigator/TopBar';
import Performance from '@libs/Performance';
import {getPolicyIDFromNavigationState} from '@libs/PolicyUtils';
import SidebarLinksData from '@pages/home/sidebar/SidebarLinksData';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';

/**
 * Function called when a pinned chat is selected.
 */
const startTimer = () => {
    Timing.start(CONST.TIMING.SWITCH_REPORT);
    Performance.markStart(CONST.TIMING.SWITCH_REPORT);
};

function BaseSidebarScreen() {
    const styles = useThemeStyles();
    const activeWorkspaceID = getPolicyIDFromNavigationState();
    const {translate} = useLocalize();

    useEffect(() => {
        Performance.markStart(CONST.TIMING.SIDEBAR_LOADED);
        Timing.start(CONST.TIMING.SIDEBAR_LOADED, true);
    }, []);

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
                        breadcrumbLabel={translate('common.chats')}
                        activeWorkspaceID={activeWorkspaceID}
                    />
                    <View style={[styles.flex1]}>
                        <SidebarLinksData
                            onLinkClick={startTimer}
                            insets={insets}
                        />
                    </View>
                </>
            )}
        </ScreenWrapper>
    );
}

BaseSidebarScreen.displayName = 'BaseSidebarScreen';

export default BaseSidebarScreen;
