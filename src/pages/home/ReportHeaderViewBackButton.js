import React from 'react';
import PropTypes from 'prop-types';
import {Pressable} from 'react-native';
import styles from '../../styles/styles';
import * as Expensicons from '../../components/Icon/Expensicons';
import Tooltip from '../../components/Tooltip';
import Icon from '../../components/Icon';

const propTypes = {
    /** Text for tooltip */
    tooltipText: PropTypes.string.isRequired,

    /** Callback when pressed */
    onPress: PropTypes.func.isRequired,
};

const ReportHeaderViewBackButton = props => (
    <Tooltip text={props.tooltipText}>
        <Pressable
            onPress={props.onPress}
            style={[styles.LHNToggle]}
            accessibilityHint="Navigate back to chats list"
        >
            <Icon src={Expensicons.BackArrow} />
        </Pressable>
    </Tooltip>
);

ReportHeaderViewBackButton.displayName = 'ReportHeaderViewBackButton';
ReportHeaderViewBackButton.propTypes = propTypes;
export default ReportHeaderViewBackButton;
