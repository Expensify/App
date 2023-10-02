import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../../styles/styles';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import * as Browser from '../../../../libs/Browser';
import GlobalNavigation from '../GlobalNavigation';
import SubNavigation from '../SubNavigation/SubNavigation';

const propTypes = {
    /** Children to wrap (floating button). */
    children: PropTypes.node.isRequired,
};

function BaseSidebarScreen(props) {
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            style={[styles.sidebar, Browser.isMobile() ? styles.userSelectNone : {}]}
            testID={BaseSidebarScreen.displayName}
        >
            <View style={[styles.flex1, styles.flexRow, styles.globalAndSubNavigationContainer]}>
                <GlobalNavigation />
                <SubNavigation />
            </View>
            {props.children}
        </ScreenWrapper>
    );
}

BaseSidebarScreen.propTypes = propTypes;
BaseSidebarScreen.displayName = 'BaseSidebarScreen';

export default BaseSidebarScreen;
