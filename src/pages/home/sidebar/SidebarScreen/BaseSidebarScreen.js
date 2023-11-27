import React, {useEffect} from 'react';
import {View} from 'react-native';
import ScreenWrapper from '@components/ScreenWrapper';
import * as Browser from '@libs/Browser';
import Performance from '@libs/Performance';
import SidebarLinksData from '@pages/home/sidebar/SidebarLinksData';
import useThemeStyles from '@styles/useThemeStyles';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import sidebarPropTypes from './sidebarPropTypes';

/**
 * Function called when a pinned chat is selected.
 */
const startTimer = () => {
    Timing.start(CONST.TIMING.SWITCH_REPORT);
    Performance.markStart(CONST.TIMING.SWITCH_REPORT);
};

function BaseSidebarScreen(props) {
    const styles = useThemeStyles();
    useEffect(() => {
        Performance.markStart(CONST.TIMING.SIDEBAR_LOADED);
        Timing.start(CONST.TIMING.SIDEBAR_LOADED, true);
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            style={[styles.sidebar, Browser.isMobile() ? styles.userSelectNone : {}]}
            testID={BaseSidebarScreen.displayName}
        >
            {({insets}) => (
                <>
                    <View style={[styles.flex1]}>
                        <SidebarLinksData
                            onLinkClick={startTimer}
                            insets={insets}
                            onLayout={props.onLayout}
                        />
                    </View>
                    {props.children}
                </>
            )}
        </ScreenWrapper>
    );
}

BaseSidebarScreen.propTypes = sidebarPropTypes;
BaseSidebarScreen.displayName = 'BaseSidebarScreen';

export default BaseSidebarScreen;
