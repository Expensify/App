import React, {forwardRef, useImperativeHandle} from 'react';
import PropTypes from 'prop-types';
import MenuItem from './MenuItem';
import Icon from './Icon';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import getButtonState from '../libs/getButtonState';
import useThrottledButtonState from '../hooks/useThrottledButtonState';
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

    /** Whether the menu item is focused or not */
    isFocused: PropTypes.bool,

    /** Forwarded ref to ContextMenuItem */
    innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
};

const defaultProps = {
    isMini: false,
    successIcon: null,
    successText: '',
    description: '',
    isAnonymousAction: false,
    isFocused: false,
    innerRef: null,
};

function ContextMenuItem({onPress, successIcon, successText, icon, text, isMini, description, isAnonymousAction, isFocused, innerRef}) {
    const {windowWidth} = useWindowDimensions();
    const [isThrottledButtonActive, setThrottledButtonInactive] = useThrottledButtonState();

    const triggerPressAndUpdateSuccess = () => {
        if (!isThrottledButtonActive) {
            return;
        }
        onPress();

        // We only set the success state when we have icon or text to represent the success state
        // We may want to replace this check by checking the Result from OnPress Callback in future.
        if (successIcon || successText) {
            setThrottledButtonInactive();
        }
    };

    useImperativeHandle(innerRef, () => ({triggerPressAndUpdateSuccess}));

    const itemIcon = !isThrottledButtonActive && successIcon ? successIcon : icon;
    const itemText = !isThrottledButtonActive && successText ? successText : text;

    return isMini ? (
        <BaseMiniContextMenuItem
            tooltipText={itemText}
            onPress={triggerPressAndUpdateSuccess}
            isDelayButtonStateComplete={!isThrottledButtonActive}
        >
            {({hovered, pressed}) => (
                <Icon
                    small
                    src={itemIcon}
                    fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed, !isThrottledButtonActive))}
                />
            )}
        </BaseMiniContextMenuItem>
    ) : (
        <MenuItem
            title={itemText}
            icon={itemIcon}
            onPress={triggerPressAndUpdateSuccess}
            wrapperStyle={styles.pr9}
            success={!isThrottledButtonActive}
            description={description}
            descriptionTextStyle={styles.breakAll}
            style={getContextMenuItemStyles(windowWidth)}
            isAnonymousAction={isAnonymousAction}
            focused={isFocused}
            interactive={isThrottledButtonActive}
        />
    );
}

ContextMenuItem.propTypes = propTypes;
ContextMenuItem.defaultProps = defaultProps;
ContextMenuItem.displayName = 'ContextMenuItem';

const ContextMenuItemWithRef = forwardRef((props, ref) => (
    <ContextMenuItem
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));

ContextMenuItemWithRef.displayName = 'ContextMenuItemWithRef';

export default ContextMenuItemWithRef;
