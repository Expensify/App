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
    tooltipText: PropTypes.string.isRequired,
    onPress: PropTypes.func.isRequired,
    children: PropTypes.oneOf([PropTypes.func, PropTypes.node]).isRequired,
    isDelayButtonStateComplete: PropTypes.bool,
};

const defaultProps = {
    isDelayButtonStateComplete: true,
};

const BaseMiniContextMenuItem = props => (
    <Tooltip text={props.tooltipText}>
        <Pressable
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
export default BaseMiniContextMenuItem;
