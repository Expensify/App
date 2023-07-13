import React from 'react';
import PropTypes from 'prop-types';
import MenuItem from './MenuItem';
import Icon from './Icon';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import getButtonState from '../libs/getButtonState';
import withDelayToggleButtonState, { withDelayToggleButtonStatePropTypes } from './withDelayToggleButtonState';
import BaseMiniContextMenuItem from './BaseMiniContextMenuItem';
import withWindowDimensions from './withWindowDimensions';
import getContextMenuItemStyles from '../styles/getContextMenuItemStyles';

const propTypes = {
    /** Icon Component */
    icon: PropTypes.elementType.isRequired,

    /** Text to display */
    text: PropTypes.string.isRequired,

    /** Icon to show when interaction was successful */
    successIcon: PropTypes.elementType,

    /** Text to show when interaction was successful */
    successText: PropTypes.string,

    /** Whether to show the mini menu */
    isMini: PropTypes.bool,

    /** Callback to fire when the item is pressed */
    onPress: PropTypes.func.isRequired,

    /** Automatically reset the success status */
    autoReset: PropTypes.bool,

    /** A description text to show under the title */
    description: PropTypes.string,

    ...withDelayToggleButtonStatePropTypes,
};

const defaultProps = {
    isMini: false,
    successIcon: null,
    successText: '',
    autoReset: true,
    description: '',
};

function ContextMenuItem(props) {
    const triggerPressAndUpdateSuccess = () => {
        if (props.isDelayButtonStateComplete) {
            return;
        }
        props.onPress();

        if (props.successIcon || props.successText) {
            props.toggleDelayButtonState(props.autoReset);
        }
    };

    const icon = props.isDelayButtonStateComplete ? props.successIcon || props.icon : props.icon;
    const text = props.isDelayButtonStateComplete ? props.successText || props.text : props.text;

    return props.isMini ? (
        <BaseMiniContextMenuItem
            tooltipText={text}
            onPress={triggerPressAndUpdateSuccess}
            isDelayButtonStateComplete={props.isDelayButtonStateComplete}
        >
            {({ hovered, pressed }) => (
                <Icon
                    small
                    src={icon}
                    fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed, props.isDelayButtonStateComplete))}
                />
            )}
        </BaseMiniContextMenuItem>
    ) : (
        <MenuItem
            title={text}
            icon={icon}
            onPress={triggerPressAndUpdateSuccess}
            wrapperStyle={styles.pr9}
            success={props.isDelayButtonStateComplete}
            description={props.description}
            descriptionTextStyle={styles.breakAll}
            style={getContextMenuItemStyles(props.windowWidth)}
        />
    );
}

ContextMenuItem.propTypes = propTypes;
ContextMenuItem.defaultProps = defaultProps;

export default compose(withWindowDimensions, withDelayToggleButtonState)(ContextMenuItem);
