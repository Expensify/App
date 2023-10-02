import React, {useEffect} from 'react';
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
};

/**
 * Function called when a pinned chat is selected.
 */
const startTimer = () => {
    Timing.start(CONST.TIMING.SWITCH_REPORT);
    Performance.markStart(CONST.TIMING.SWITCH_REPORT);
};

function SubNavigation(props) {
    useEffect(() => {
        Performance.markStart(CONST.TIMING.SIDEBAR_LOADED);
        Timing.start(CONST.TIMING.SIDEBAR_LOADED, true);
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            includePaddingTop={false}
            shouldEnableKeyboardAvoidingView={false}
            style={[styles.sidebar, Browser.isMobile() ? styles.userSelectNone : {}]}
            testID={SubNavigation.displayName}
        >
            {({insets}) => (
                <SidebarLinksData
                    onLinkClick={startTimer}
                    insets={insets}
                    isSmallScreenWidth={props.isSmallScreenWidth}
                />
            )}
        </ScreenWrapper>
    );
}

SubNavigation.propTypes = propTypes;
SubNavigation.displayName = 'SubNavigation';

export default SubNavigation;
