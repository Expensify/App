import React, {useEffect} from 'react';
import styles from '../../../../styles/styles';
import SidebarLinksData from '../SidebarLinksData';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import Timing from '../../../../libs/actions/Timing';
import CONST from '../../../../CONST';
import Performance from '../../../../libs/Performance';
import * as Browser from '../../../../libs/Browser';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';

const propTypes = {};

function SubNavigation() {
    const {isSmallScreenWidth} = useWindowDimensions();

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
                    insets={insets}
                    isSmallScreenWidth={isSmallScreenWidth}
                />
            )}
        </ScreenWrapper>
    );
}

SubNavigation.propTypes = propTypes;
SubNavigation.displayName = 'SubNavigation';

export default SubNavigation;
