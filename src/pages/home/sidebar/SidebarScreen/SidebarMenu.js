import React, {useEffect} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../../styles/styles';
import SidebarLinksData from '../SidebarLinksData';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import Timing from '../../../../libs/actions/Timing';
import CONST from '../../../../CONST';
import Performance from '../../../../libs/Performance';
import * as Browser from '../../../../libs/Browser';

const propTypes = {
    isSmallScreenWidth: PropTypes.bool.isRequired,
    shownSidebarMenu: PropTypes.string.isRequired,
};

/**
 * Function called when a pinned chat is selected.
 */
const startTimer = () => {
    Timing.start(CONST.TIMING.SWITCH_REPORT);
    Performance.markStart(CONST.TIMING.SWITCH_REPORT);
};

function SidebarMenu(props) {
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
            {({insets}) => {
                if (props.shownSidebarMenu === CONST.SIDEBAR_MENU_OPTIONS.CHATS) {
                    return (
                        <SidebarLinksData
                            onLinkClick={startTimer}
                            insets={insets}
                            isSmallScreenWidth={props.isSmallScreenWidth}
                        />
                    );
                }
                if (props.shownSidebarMenu === CONST.SIDEBAR_MENU_OPTIONS.EXPENSES) {
                    // TODO: Add all other sidebar menus
                    return null;
                }
            }}
        </ScreenWrapper>
    );
}

SidebarMenu.propTypes = propTypes;
SidebarMenu.displayName = 'SidebarMenu';

export default SidebarMenu;
