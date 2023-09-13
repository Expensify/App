import React, {useEffect} from 'react';
import {View} from 'react-native';
import SidebarLinksData from '../SidebarLinksData';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import Timing from '../../../../libs/actions/Timing';
import CONST from '../../../../CONST';
import Performance from '../../../../libs/Performance';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../../components/withWindowDimensions';
import sidebarPropTypes from './sidebarPropTypes';
import * as Browser from '../../../../libs/Browser';
import useThemeStyles from '../../../../styles/useThemeStyles';

const propTypes = {
    ...sidebarPropTypes,
    ...windowDimensionsPropTypes,
};

/**
 * Function called when a pinned chat is selected.
 */
const startTimer = () => {
    Timing.start(CONST.TIMING.SWITCH_REPORT);
    Performance.markStart(CONST.TIMING.SWITCH_REPORT);
};

function BaseSidebarScreen(props) {
    const themeStyles = useThemeStyles();

    useEffect(() => {
        Performance.markStart(CONST.TIMING.SIDEBAR_LOADED);
        Timing.start(CONST.TIMING.SIDEBAR_LOADED, true);
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            style={[themeStyles.sidebar, Browser.isMobile() ? themeStyles.userSelectNone : {}]}
            shouldDisableFocusTrap
        >
            {({insets}) => (
                <>
                    <View style={[themeStyles.flex1]}>
                        <SidebarLinksData
                            onLinkClick={startTimer}
                            insets={insets}
                            isSmallScreenWidth={props.isSmallScreenWidth}
                            onLayout={props.onLayout}
                        />
                    </View>
                    {props.children}
                </>
            )}
        </ScreenWrapper>
    );
}

BaseSidebarScreen.propTypes = propTypes;
BaseSidebarScreen.displayName = 'BaseSidebarScreen';

export default withWindowDimensions(BaseSidebarScreen);
