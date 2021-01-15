import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import SidebarBottom from './SidebarBottom';
import SidebarLinks from './SidebarLinks';
import CreateMenu from '../../../components/CreateMenu';
import SafeAreaInsetPropTypes from '../../SafeAreaInsetPropTypes';
import FAB from '../../../components/FAB';

const propTypes = {
    // Toggles the hamburger menu open and closed
    onLinkClick: PropTypes.func.isRequired,

    // Safe area insets required for mobile devices margins
    insets: SafeAreaInsetPropTypes.isRequired,

    // Current state of the chat switcher (active of inactive)
    isChatSwitcherActive: PropTypes.bool,

    // Current state of the CreateMenu component (active or inactive)
    isCreateMenuActive: PropTypes.bool,

    // Callback to fire on request to toggle the CreateMenu
    toggleCreateMenu: PropTypes.func.isRequired,

    // The data array containing the icon, text and callback information of each item
    menuItemData: PropTypes.arrayOf(PropTypes.shape({
        // The icon component of the item
        icon: PropTypes.func.isRequired,

        // The text content of the item
        text: PropTypes.string.isRequired,

        // Callback to fire on item press
        onPress: PropTypes.func.isRequired,
    })).isRequired,
};

const defaultProps = {
    isChatSwitcherActive: false,
    isCreateMenuActive: false,
};

const SidebarView = props => (
    <>
        <View style={[styles.flex1, styles.sidebar]}>
            <SidebarLinks
                onLinkClick={props.onLinkClick}
                insets={props.insets}
            />
            {!props.isChatSwitcherActive && (
            <SidebarBottom insets={props.insets} />
            )}
            <FAB
                isActive={props.isCreateMenuActive}
                onPress={props.toggleCreateMenu}
            />
        </View>
        <CreateMenu
            onClose={props.toggleCreateMenu}
            isVisible={props.isCreateMenuActive}
            menuItemData={props.menuItemData}
        />
    </>
);

SidebarView.propTypes = propTypes;
SidebarView.defaultProps = defaultProps;
SidebarView.displayName = 'SidebarView';
export default withOnyx(
    {
        isChatSwitcherActive: {
            key: ONYXKEYS.IS_CHAT_SWITCHER_ACTIVE,
            initWithStoredValues: false,
        },
    },
)(SidebarView);
