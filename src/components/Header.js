import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Text from './Text';
import EnvironmentBadge from './EnvironmentBadge';

const propTypes = {
    /** Title of the Header */
    title: PropTypes.string.isRequired,

    /** Subtitle of the header */
    subtitle: PropTypes.string,

    /** Should we show the environment badge (dev/stg)?  */
    shouldShowEnvironmentBadge: PropTypes.bool,
};

const defaultProps = {
    shouldShowEnvironmentBadge: false,
    subtitle: '',
};
const Header = props => (


    <View style={[styles.flex1, styles.flexRow]}>
        <View style={[styles.flex1, styles.flexColumn]}>
            <Text numberOfLines={2} style={[styles.headerText, styles.textLarge]}>
                {props.title}
            </Text>
            {/* If there's no subtitle then display a fragment to avoid an empty space which moves the main title */}
            {props.subtitle ? <Text style={[styles.mutedTextLabel]}>{props.subtitle}</Text> : <></> }
        </View>
        {props.shouldShowEnvironmentBadge && (
            <EnvironmentBadge />
        )}
    </View>
);

Header.displayName = 'Header';
Header.propTypes = propTypes;
Header.defaultProps = defaultProps;
export default Header;
