import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import SidebarLinks from './SidebarLinks';
import CreateMenu from '../../../components/CreateMenu';
import FAB from '../../../components/FAB';
import ScreenWrapper from '../../../components/ScreenWrapper';
import CONST from '../../../CONST';


const propTypes = {
    // Toggles the navigation menu open and closed
    onLinkClick: PropTypes.func.isRequired,

    // Current state of the CreateMenu component (active or inactive)
    isCreateMenuActive: PropTypes.bool.isRequired,

    // Callback to fire on request to toggle the CreateMenu
    toggleCreateMenu: PropTypes.func.isRequired,

    // Callback to fire when a CreateMenu item is selected
    onCreateMenuItemSelected: PropTypes.func.isRequired,

    // Callback to fire on avatar click
    onAvatarClick: PropTypes.func.isRequired,
};

const SidebarScreen = props => (
    <ScreenWrapper
        includePaddingBottom={false}
    >
        {insets => (
            <>
                <View style={[styles.flex1, styles.sidebar]}>
                    <SidebarLinks
                        onLinkClick={props.onLinkClick}
                        insets={insets}
                        onAvatarClick={props.onAvatarClick}
                    />
                    <FAB
                        isActive={props.isCreateMenuActive}
                        onPress={props.toggleCreateMenu}
                    />
                </View>
                <CreateMenu
                    onClose={props.toggleCreateMenu}
                    isVisible={props.isCreateMenuActive}
                    onItemSelected={props.onCreateMenuItemSelected}
                    menuOptions={[
                        CONST.MENU_ITEM_KEYS.NEW_CHAT,
                        CONST.MENU_ITEM_KEYS.REQUEST_MONEY,
                        CONST.MENU_ITEM_KEYS.NEW_GROUP,
                        CONST.MENU_ITEM_KEYS.SPLIT_BILL,
                    ]}
                />
            </>
        )}
    </ScreenWrapper>
);

SidebarScreen.propTypes = propTypes;
SidebarScreen.displayName = 'SidebarScreen';
export default SidebarScreen;
