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

    /** A description text to show under the title */
    description: PropTypes.string,

    /** The action accept for anonymous user or not */
    isAnonymousAction: PropTypes.bool,

    ...withDelayToggleButtonStatePropTypes,
};

const defaultProps = {
    isMini: false,
    successIcon: null,
    successText: '',
    description: '',
    isAnonymousAction: false,
};

function ContextMenuItem({isDelayButtonStateComplete, onPress, successIcon, successText, toggleDelayButtonState, icon, text, isMini, description, isAnonymousAction}) {
    const {windowWidth} = useWindowDimensions();

    const triggerPressAndUpdateSuccess = useCallback(() => {
        if (isDelayButtonStateComplete) {
            return;
        }
        onPress();

        // We only set the success state when we have icon or text to represent the success state
        // We may want to replace this check by checking the Result from OnPress Callback in future.
        if (successIcon || successText) {
            toggleDelayButtonState();
        }
    }, [isDelayButtonStateComplete, onPress, successIcon, successText, toggleDelayButtonState]);

    const itemIcon = isDelayButtonStateComplete && successIcon ? successIcon : icon;
    const itemText = isDelayButtonStateComplete && successText ? successText : text;

    return isMini ? (
        <BaseMiniContextMenuItem
            tooltipText={itemText}
            onPress={triggerPressAndUpdateSuccess}
            isDelayButtonStateComplete={isDelayButtonStateComplete}
        >
            {({hovered, pressed}) => (
                <Icon
                    small
                    src={itemIcon}
                    fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed, isDelayButtonStateComplete))}
                />
            )}
        </BaseMiniContextMenuItem>
    ) : (
        <MenuItem
            title={itemText}
            icon={itemIcon}
            onPress={triggerPressAndUpdateSuccess}
            wrapperStyle={styles.pr9}
            success={isDelayButtonStateComplete}
            description={description}
            descriptionTextStyle={styles.breakAll}
            style={getContextMenuItemStyles(windowWidth)}
            isAnonymousAction={isAnonymousAction}
        />
    );
}

ContextMenuItem.propTypes = propTypes;
ContextMenuItem.defaultProps = defaultProps;

export default withDelayToggleButtonState(ContextMenuItem);
