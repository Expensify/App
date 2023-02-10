import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import variables from '../../styles/variables';
import Icon from '../Icon';
import Text from '../Text';
import themeColors from '../../styles/themes/default';

const propTypes = {
    /** Expensicon for the page */
    icon: PropTypes.func.isRequired,

    /** Color for the icon (should be from theme) */
    iconColor: PropTypes.string,

    /** Title message below the icon */
    title: PropTypes.string.isRequired,

    /** Subtitle message below the title */
    subtitle: PropTypes.string.isRequired,
};

const defaultProps = {
    iconColor: themeColors.offline,
};

const BlockingView = props => (
    <View
        style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, styles.ph10]}
    >
        <Icon
            src={props.icon}
            fill={props.iconColor}
            width={variables.iconSizeSuperLarge}
            height={variables.iconSizeSuperLarge}
        />
        <Text style={[styles.notFoundTextHeader]}>{props.title}</Text>
        <Text style={[styles.textAlignCenter]}>{props.subtitle}</Text>
    </View>
);

BlockingView.propTypes = propTypes;
BlockingView.defaultProps = defaultProps;
BlockingView.displayName = 'BlockingView';

export default BlockingView;
