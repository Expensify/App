import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import ScreenWrapper from '@components/ScreenWrapper';
import * as Browser from '@libs/Browser';
import Performance from '@libs/Performance';
import GlobalNavigation from '@pages/home/sidebar/GlobalNavigation';
import SubNavigation from '@pages/home/sidebar/SubNavigation/SubNavigation';
import styles from '@styles/styles';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';

const propTypes = {
    /** Children to wrap (floating button). */
    children: PropTypes.node.isRequired,
};

/**
 * Function called when a pinned chat is selected.
 */
const startTimer = () => {
    Timing.start(CONST.TIMING.SWITCH_REPORT);
    Performance.markStart(CONST.TIMING.SWITCH_REPORT);
};

function BaseSidebarScreen(props) {
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            style={[styles.sidebar, Browser.isMobile() ? styles.userSelectNone : {}]}
            testID={BaseSidebarScreen.displayName}
        >
            {({insets}) => (
                <>
                    <View style={[styles.flex1, styles.flexRow, styles.globalAndSubNavigationContainer]}>
                        <GlobalNavigation />
                        <SubNavigation
                            onLinkClick={startTimer}
                            insets={insets}
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

export default BaseSidebarScreen;
