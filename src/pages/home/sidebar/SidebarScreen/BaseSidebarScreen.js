import React from 'react';
import {View} from 'react-native';
import styles from '../../../../styles/styles';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import sidebarPropTypes from './sidebarPropTypes';
import * as Browser from '../../../../libs/Browser';
import GlobalNavigation from '../GlobalNavigation/GlobalNavigation';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../../components/withWindowDimensions';
import SubNavigation from '../SubNavigation/SubNavigation';

const propTypes = {
    ...sidebarPropTypes,
    ...windowDimensionsPropTypes,
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
                <GlobalNavigation
                    isSmallScreenWidth={props.isSmallScreenWidth}
                    isCreateMenuOpen={props.isCreateMenuOpen}
                />
                <SubNavigation isSmallScreenWidth={props.isSmallScreenWidth} />
            </View>
            {props.children}
        </ScreenWrapper>
    );
}

BaseSidebarScreen.propTypes = propTypes;
BaseSidebarScreen.displayName = 'BaseSidebarScreen';

export default withWindowDimensions(BaseSidebarScreen);
