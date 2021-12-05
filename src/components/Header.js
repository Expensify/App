import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import ExpensifyText from './ExpensifyText';
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
        <View>
            <ExpensifyText numberOfLines={2} style={[styles.headerText, styles.textLarge]}>
                {props.title}
            </ExpensifyText>
            {/* If there's no subtitle then display a fragment to avoid an empty space which moves the main title */}
            {props.subtitle ? <ExpensifyText style={[styles.mutedTextLabel]}>{props.subtitle}</ExpensifyText> : <></> }
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
