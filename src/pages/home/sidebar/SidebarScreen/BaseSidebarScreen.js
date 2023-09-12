import React from 'react';
import {View} from 'react-native';
import styles from '../../../../styles/styles';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import CONST from '../../../../CONST';
import sidebarPropTypes from './sidebarPropTypes';
import * as Browser from '../../../../libs/Browser';
import GlobalNavigation from '../GlobalNavigation';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../../components/withWindowDimensions';
import SidebarMenu from './SidebarMenu';

const propTypes = {
    ...sidebarPropTypes,
    ...windowDimensionsPropTypes,
};

function BaseSidebarScreen(props) {
    const [shownSidebarMenu, setShownSidebarMenu] = React.useState(CONST.SIDEBAR_MENU_OPTIONS.CHATS);

    const switchSidebarMenu = (sidebarOption) => {
        setShownSidebarMenu(sidebarOption);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            style={[styles.sidebar, Browser.isMobile() ? styles.userSelectNone : {}]}
            testID={BaseSidebarScreen.displayName}
        >
            <View style={[styles.flex1, styles.flexRow]}>
                <GlobalNavigation
                    isSmallScreenWidth={props.isSmallScreenWidth}
                    isCreateMenuOpen={props.isCreateMenuOpen}
                    switchSidebarMenu={switchSidebarMenu}
                />
                <SidebarMenu
                    isSmallScreenWidth={props.isSmallScreenWidth}
                    shownSidebarMenu={shownSidebarMenu}
                />
            </View>
            {props.children}
        </ScreenWrapper>
    );
}

BaseSidebarScreen.propTypes = propTypes;
BaseSidebarScreen.displayName = 'BaseSidebarScreen';

export default withWindowDimensions(BaseSidebarScreen);
