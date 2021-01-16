import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Text from './Text';

const propTypes = {
    /** Title of the Header */
    title: PropTypes.string.isRequired,

    /** Size of the displayed text */
    textSize: PropTypes.oneOf(['default', 'large']),
};

const defaultProps = {
    textSize: 'default',
};

const Header = ({textSize, title}) => (
    <View style={[styles.flex1]}>
        <Text
            numberOfLines={2}
            style={[styles.headerText, textSize === 'large' && styles.textLarge]}
        >
            {title}
        </Text>
    </View>
);

Header.displayName = 'Header';
Header.propTypes = propTypes;
Header.defaultProps = defaultProps;
export default Header;
