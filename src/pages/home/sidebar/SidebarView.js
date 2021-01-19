import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import SidebarBottom from './SidebarBottom';
import SidebarLinks from './SidebarLinks';
import CreateMenu from '../../../components/CreateMenu';
import SafeAreaInsetPropTypes from '../../SafeAreaInsetPropTypes';
import FAB from '../../../components/FAB';

const propTypes = {
    // Toggles the navigation menu open and closed
    onLinkClick: PropTypes.func.isRequired,

    // Safe area insets required for mobile devices margins
    insets: SafeAreaInsetPropTypes.isRequired,

    // Current state of the chat switcher (active of inactive)
    isChatSwitcherActive: PropTypes.bool,

    // Current state of the CreateMenu component (active or inactive)
    isCreateMenuActive: PropTypes.bool.isRequired,

    // Callback to fire on request to toggle the CreateMenu
    toggleCreateMenu: PropTypes.func.isRequired,

    // Callback to fire when a CreateMenu item is selected
    onCreateMenuItemSelected: PropTypes.func.isRequired,

    // Callback to fire on avatar click
    onAvatarClick: PropTypes.func.isRequired,
};

const defaultProps = {
    isChatSwitcherActive: false,
};

const SidebarView = props => (
    <>
        <View style={[styles.flex1, styles.sidebar]}>
            <SidebarLinks
                onLinkClick={props.onLinkClick}
                insets={props.insets}
                onAvatarClick={props.onAvatarClick}
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
            onItemSelected={props.onCreateMenuItemSelected}
        />
    </>
);

SidebarView.propTypes = propTypes;
SidebarView.defaultProps = defaultProps;
SidebarView.displayName = 'SidebarView';
export default SidebarView;
