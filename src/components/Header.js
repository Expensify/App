import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';

const propTypes = {
    /** Title of the Header */
    title: PropTypes.string.isRequired,
};

const Header = props => (
    <View style={[styles.flex1]}>
        <Text numberOfLines={1} style={[styles.navText]}>
            {props.title}
        </Text>
    </View>
);

Header.displayName = 'Header';
Header.propTypes = propTypes;
export default Header;
