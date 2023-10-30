import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import styles from '../../../../styles/styles';
import SidebarLinksData from '../SidebarLinksData';
import Timing from '../../../../libs/actions/Timing';
import CONST from '../../../../CONST';
import Performance from '../../../../libs/Performance';
import safeAreaInsetPropTypes from '../../../safeAreaInsetPropTypes';

const propTypes = {
    /** Function called when a pinned chat is selected. */
    onLinkClick: PropTypes.func.isRequired,

    /** Insets for SidebarLInksData */
    insets: safeAreaInsetPropTypes.isRequired,
};

function SubNavigation({onLinkClick, insets}) {
    useEffect(() => {
        Performance.markStart(CONST.TIMING.SIDEBAR_LOADED);
        Timing.start(CONST.TIMING.SIDEBAR_LOADED, true);
    }, []);

    return (
        <View style={styles.subNavigationContainer}>
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
