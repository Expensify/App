import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import variables from '../../styles/variables';
import Icon from '../Icon';
import Text from '../Text';

const propTypes = {
    /** Expensicon for the page */
    icon: PropTypes.func.isRequired,

    /** Color for the icon (should be from theme) */
    iconColor: PropTypes.string.isRequired,

    /** Title message below the icon */
    title: PropTypes.string.isRequired,

    /** Subtitle message below the title */
    subtitle: PropTypes.string.isRequired,
};

const BlockingView = props => (
    <View
        style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}
    >
        <Icon
            src={props.icon}
            fill={props.iconColor}
            width={variables.iconSizeSuperLarge}
            height={variables.iconSizeSuperLarge}
        />
        <Text style={[styles.headerText, styles.textLarge, styles.mt5]}>{props.title}</Text>
        <Text style={[styles.w70, styles.textAlignCenter]}>{props.subtitle}</Text>
    </View>
);

BlockingView.propTypes = propTypes;
BlockingView.displayName = 'BlockingView';

export default BlockingView;
