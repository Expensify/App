import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Text from './Text';
import EnvironmentBadge from './EnvironmentBadge';

const propTypes = {
    /** Title of the Header */
    title: PropTypes.string.isRequired,

    /** Should we show the environment badge (dev/stg)?  */
    shouldShowEnvironmentBadge: PropTypes.bool,
};

const defaultProps = {
    shouldShowEnvironmentBadge: false,
};
const Header = props => (
    <View style={[styles.flex1, styles.flexRow]}>
        <Text numberOfLines={2} style={[styles.headerText, styles.textLarge]}>
            {props.title}
        </Text>
        {props.shouldShowEnvironmentBadge && (
            <EnvironmentBadge />
        )}
    </View>
);

Header.displayName = 'Header';
Header.propTypes = propTypes;
Header.defaultProps = defaultProps;
export default Header;
