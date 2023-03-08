import {Pressable, View} from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import getButtonState from '../libs/getButtonState';
import variables from '../styles/variables';
import Tooltip from './Tooltip';

const propTypes = {
    /**
     * Text to display when hovering the menu item
     */
    tooltipText: PropTypes.string.isRequired,

    /**
     * Callback to fire on press
     */
    onPress: PropTypes.func.isRequired,

    /**
     * The children to display within the menu item
     */
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,

    /**
     * Whether the button should be in the active state
     */
    isDelayButtonStateComplete: PropTypes.bool,

    /**
     * A ref to forward to the Pressable
     */
    innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
};

const defaultProps = {
    isDelayButtonStateComplete: true,
    innerRef: () => {},
};

/**
 * Component that renders a mini context menu item with a
 * pressable. Also renders a tooltip when hovering the item.
 * @param {Object} props
 * @returns {JSX.Element}
 */
const BaseMiniContextMenuItem = props => (
    <Tooltip text={props.tooltipText}>
        <Pressable
            ref={props.innerRef}
            focusable
            onPress={props.onPress}
            accessibilityLabel={props.tooltipText}
            style={
                ({hovered, pressed}) => [
                    styles.reportActionContextMenuMiniButton,
                    StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed, props.isDelayButtonStateComplete)),
                ]
            }
        >
            {pressableState => (
                <View style={[StyleUtils.getWidthAndHeightStyle(variables.iconSizeNormal), styles.alignItemsCenter, styles.justifyContentCenter]}>
                    {_.isFunction(props.children) ? props.children(pressableState) : props.children}
                </View>
            )}
        </Pressable>
    </Tooltip>
);

BaseMiniContextMenuItem.propTypes = propTypes;
BaseMiniContextMenuItem.defaultProps = defaultProps;
BaseMiniContextMenuItem.displayName = 'BaseMiniContextMenuItem';

// eslint-disable-next-line react/jsx-props-no-spreading
export default React.forwardRef((props, ref) => <BaseMiniContextMenuItem {...props} innerRef={ref} />);
