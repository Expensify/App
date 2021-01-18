import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import SidebarBottom from './SidebarBottom';
import SidebarLinks from './SidebarLinks';
import SafeAreaInsetPropTypes from '../../SafeAreaInsetPropTypes';
import FAB from '../../../components/FAB';

const propTypes = {
    // Toggles the hamburger menu open and closed
    onLinkClick: PropTypes.func.isRequired,

    // Safe area insets required for mobile devices margins
    insets: SafeAreaInsetPropTypes.isRequired,

    // when the chat switcher is selected
    isChatSwitcherActive: PropTypes.bool,

    // Current state (active or not active) of the FAB
    isFloatingActionButtonActive: PropTypes.bool.isRequired,

    // Callback to fire on request to toggle the FAB
    onFloatingActionButtonPress: PropTypes.func.isRequired,

    // Callback to fire on avatar click
    onAvatarClick: PropTypes.func.isRequired,
};

const defaultProps = {
    isChatSwitcherActive: false,
};

const SidebarView = props => (
    <View style={[styles.flex1, styles.sidebar]}>
        <SidebarLinks
            onLinkClick={props.onLinkClick}
            onAvatarClick={props.onAvatarClick}
            insets={props.insets}
            isChatSwitcherActive={props.isChatSwitcherActive}
        />
        {!props.isChatSwitcherActive && (
            <SidebarBottom insets={props.insets} />
        )}
        <FAB
            isActive={props.isFloatingActionButtonActive}
            onPress={props.onFloatingActionButtonPress}
            isHidden
        />
    </View>
);

SidebarView.propTypes = propTypes;
SidebarView.defaultProps = defaultProps;
SidebarView.displayName = 'SidebarView';
export default SidebarView;
