import React from 'react';
import {Image, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../style/StyleSheet';
import logo from '../../../../assets/images/expensify-logo_reversed.png';

const propTypes = {
    // Safe area insets required for mobile devices margins
    // eslint-disable-next-line react/forbid-prop-types
    insets: PropTypes.object.isRequired,
};

const SidebarTop = ({insets}) => (
    <View style={[styles.sidebarHeader, {marginTop: insets.top}]}>
        <Image
            resizeMode="contain"
            style={[styles.sidebarHeaderLogo]}
            source={logo}
        />
    </View>
);

SidebarTop.propTypes = propTypes;
SidebarTop.displayName = 'SidebarTop';

export default SidebarTop;
