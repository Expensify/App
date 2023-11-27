import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@styles/useThemeStyles';
import Text from './Text';

const propTypes = {
    /** Title displayed in badge */
    title: PropTypes.string.isRequired,

    /** Banner Description */
    description: PropTypes.string.isRequired,

    /** Whether we show the border bottom */
    shouldShowBorderBottom: PropTypes.bool.isRequired,
};

function MoneyRequestHeaderStatusBar({title, description, shouldShowBorderBottom}) {
    const styles = useThemeStyles();
    const borderBottomStyle = shouldShowBorderBottom ? styles.borderBottom : {};
    return (
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.overflowHidden, styles.ph5, styles.pb3, borderBottomStyle]}>
            <View style={[styles.moneyRequestHeaderStatusBarBadge]}>
                <Text style={[styles.textStrong, styles.textLabel]}>{title}</Text>
            </View>
            <View style={[styles.flexShrink1]}>
                <Text style={[styles.textLabelSupporting]}>{description}</Text>
            </View>
        </View>
    );
}

MoneyRequestHeaderStatusBar.displayName = 'MoneyRequestHeaderStatusBar';
MoneyRequestHeaderStatusBar.propTypes = propTypes;

export default MoneyRequestHeaderStatusBar;
