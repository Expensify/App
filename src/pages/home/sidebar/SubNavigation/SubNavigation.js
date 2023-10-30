import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import Performance from '@libs/Performance';
import SidebarLinksData from '@pages/home/sidebar/SidebarLinksData';
import safeAreaInsetPropTypes from '@pages/safeAreaInsetPropTypes';
import styles from '@styles/styles';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';

const propTypes = {
    /** Function called when a pinned chat is selected. */
    onLinkClick: PropTypes.func.isRequired,

    /** Insets for SidebarLInksData */
    insets: safeAreaInsetPropTypes.isRequired,

    /** Whether the sidebar should display a radius */
    shouldDisplayRadius: PropTypes.bool.isRequired,
};

function SubNavigation({onLinkClick, insets, shouldDisplayRadius}) {
    useEffect(() => {
        Performance.markStart(CONST.TIMING.SIDEBAR_LOADED);
        Timing.start(CONST.TIMING.SIDEBAR_LOADED, true);
    }, []);

    return (
        <View style={styles.subNavigationContainer(shouldDisplayRadius)}>
            <SidebarLinksData
                insets={insets}
                onLinkClick={onLinkClick}
            />
        </View>
    );
}

SubNavigation.propTypes = propTypes;
SubNavigation.displayName = 'SubNavigation';

export default SubNavigation;
