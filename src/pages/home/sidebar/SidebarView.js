import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import SidebarBottom from './SidebarBottom';
import SidebarLinks from './SidebarLinks';
import SafeAreaInsetPropTypes from '../../SafeAreaInsetPropTypes';

const propTypes = {
    // Toggles the navigationMenu menu open and closed
    onLinkClick: PropTypes.func.isRequired,

    // Safe area insets required for mobile devices margins
    insets: SafeAreaInsetPropTypes.isRequired,

    // when the chat switcher is selected
    isChatSwitcherActive: PropTypes.bool,
};

const defaultProps = {
    isChatSwitcherActive: false,
};

const SidebarView = (props) => (
    <View style={[styles.flex1, styles.sidebar]}>
        <SidebarLinks
            onLinkClick={props.onLinkClick}
            insets={props.insets}
            isChatSwitcherActive={props.isChatSwitcherActive}
        />
        {!props.isChatSwitcherActive && <SidebarBottom insets={props.insets} />}
    </View>
);

SidebarView.propTypes = propTypes;
SidebarView.defaultProps = defaultProps;
SidebarView.displayName = 'SidebarView';
export default SidebarView;
