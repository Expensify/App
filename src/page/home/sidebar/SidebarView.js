import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../style/StyleSheet';
import SidebarTop from './SidebarTop';
import SidebarBottom from './SidebarBottom';
import SidebarLinks from './SidebarLinks';

const propTypes = {
    // Toggles the hamburger menu open and closed
    onLinkClick: PropTypes.func.isRequired,

    // Safe area insets required for mobile devices margins
    // eslint-disable-next-line react/forbid-prop-types
    insets: PropTypes.object.isRequired,
};

const SidebarView = ({insets, onLinkClick}) => (
    <View style={[styles.flex1, styles.sidebar]}>
        <SidebarTop insets={insets} />
        <SidebarLinks onLinkClick={onLinkClick} />
        <SidebarBottom insets={insets} />
    </View>
);

SidebarView.propTypes = propTypes;

export default SidebarView;
