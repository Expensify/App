import React, {useEffect} from 'react';
import {View} from 'react-native';
import styles from '../../../../styles/styles';
import SidebarLinks from '../SidebarLinks';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import Navigation from '../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../ROUTES';
import Timing from '../../../../libs/actions/Timing';
import CONST from '../../../../CONST';
import Performance from '../../../../libs/Performance';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../../components/withWindowDimensions';
import sidebarPropTypes from './sidebarPropTypes';
import * as Browser from '../../../../libs/Browser';

const propTypes = {
    ...sidebarPropTypes,
    ...windowDimensionsPropTypes,
};

/**
 * Function called when avatar is clicked
 */
const navigateToSettings = () => {
    Navigation.navigate(ROUTES.SETTINGS);
};

/**
 * Function called when a pinned chat is selected.
 */
const startTimer = () => {
    Timing.start(CONST.TIMING.SWITCH_REPORT);
    Performance.markStart(CONST.TIMING.SWITCH_REPORT);
};

function BaseSidebarScreen(props) {
    useEffect(() => {
        Performance.markStart(CONST.TIMING.SIDEBAR_LOADED);
        Timing.start(CONST.TIMING.SIDEBAR_LOADED, true);
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            style={[styles.sidebar, Browser.isMobile() ? styles.userSelectNone : {}]}
        >
            {({insets}) => (
                <>
                    <View style={[styles.flex1]}>
                        <SidebarLinks
                            onLinkClick={startTimer}
                            insets={insets}
                            onAvatarClick={navigateToSettings}
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
