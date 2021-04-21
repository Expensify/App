import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Text from './Text';
import EnvironmentBadge from './EnvironmentBadge';

const propTypes = {
    /** Title of the Header */
    title: PropTypes.string.isRequired,

    // Fontsize
    textSize: PropTypes.oneOf(['default', 'large']),
};

const defaultProps = {
    textSize: 'default',
};
const Header = props => (
    <View style={[styles.flex1, styles.flexRow]}>
        <Text numberOfLines={2} style={[styles.headerText, props.textSize === 'large' && styles.textLarge]}>
            {props.title}
        </Text>
        <EnvironmentBadge />
    </View>
);

Header.displayName = 'Header';
Header.propTypes = propTypes;
Header.defaultProps = defaultProps;
export default Header;
