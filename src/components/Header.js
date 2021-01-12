import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Text from './Text';

const propTypes = {
    /** Title of the Header */
    title: PropTypes.string.isRequired,
};

const Header = props => (
    <View style={[styles.flex1]}>
        <Text numberOfLines={2} style={[styles.headerText]}>
            {props.title}
        </Text>
    </View>
);

Header.displayName = 'Header';
Header.propTypes = propTypes;
export default Header;
