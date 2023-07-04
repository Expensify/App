import React, {useCallback} from 'react';
import PropTypes from 'prop-types';
import MenuItem from './MenuItem';
import Icon from './Icon';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import getButtonState from '../libs/getButtonState';
import withDelayToggleButtonState, {withDelayToggleButtonStatePropTypes} from './withDelayToggleButtonState';
import BaseMiniContextMenuItem from './BaseMiniContextMenuItem';
import useWindowDimensions from '../hooks/useWindowDimensions';
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
    const {isDelayButtonStateComplete, onPress, successIcon, successText, autoReset, toggleDelayButtonState} = props;
    const {windowWidth} = useWindowDimensions();

    const triggerPressAndUpdateSuccess = useCallback(() => {
        if (isDelayButtonStateComplete) {
            return;
        }
        onPress();

        if (successIcon || successText) {
            toggleDelayButtonState(autoReset);
        }
    }, [isDelayButtonStateComplete, onPress, successIcon, successText, autoReset, toggleDelayButtonState]);

    const icon = isDelayButtonStateComplete ? successIcon || props.icon : props.icon;
    const text = isDelayButtonStateComplete ? successText || props.text : props.text;

    return props.isMini ? (
        <BaseMiniContextMenuItem
            tooltipText={text}
            onPress={triggerPressAndUpdateSuccess}
            isDelayButtonStateComplete={isDelayButtonStateComplete}
        >
            {({hovered, pressed}) => (
                <Icon
                    small
                    src={icon}
                    fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed, isDelayButtonStateComplete))}
                />
            )}
        </BaseMiniContextMenuItem>
    ) : (
        <MenuItem
            title={text}
            icon={icon}
            onPress={triggerPressAndUpdateSuccess}
            wrapperStyle={styles.pr9}
            success={isDelayButtonStateComplete}
            description={props.description}
            descriptionTextStyle={styles.breakAll}
            style={getContextMenuItemStyles(windowWidth)}
        />
    );
}

ContextMenuItem.propTypes = propTypes;
ContextMenuItem.defaultProps = defaultProps;

export default withDelayToggleButtonState(ContextMenuItem);
