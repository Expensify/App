import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import SidebarLinks from './SidebarLinks';
import CreateMenu, {MENU_ITEM_KEYS} from '../../../components/CreateMenu';
import FAB from '../../../components/FAB';
import ScreenWrapper from '../../../components/ScreenWrapper';


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
                        MENU_ITEM_KEYS.NewChat,
                        MENU_ITEM_KEYS.RequestMoney,
                        MENU_ITEM_KEYS.NewGroup,
                        MENU_ITEM_KEYS.SplitBill,
                    ]}
                />
            </>
        )}
    </ScreenWrapper>
);

SidebarScreen.propTypes = propTypes;
SidebarScreen.displayName = 'SidebarScreen';
export default SidebarScreen;
