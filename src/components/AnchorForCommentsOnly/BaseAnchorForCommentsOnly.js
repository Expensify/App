import _ from 'underscore';
import React from 'react';
import {StyleSheet} from 'react-native';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import Text from '../Text';
import PressableWithSecondaryInteraction from '../PressableWithSecondaryInteraction';
import * as ReportActionContextMenu from '../../pages/home/report/ContextMenu/ReportActionContextMenu';
import * as ContextMenuActions from '../../pages/home/report/ContextMenu/ContextMenuActions';
import Tooltip from '../Tooltip';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import styles from '../../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import {propTypes as anchorForCommentsOnlyPropTypes, defaultProps} from './anchorForCommentsOnlyPropTypes';

const propTypes = {
    ...anchorForCommentsOnlyPropTypes,
    ...windowDimensionsPropTypes,
};

/*
 * This is a default anchor component for regular links.
 */
const BaseAnchorForCommentsOnly = (props) => {
    let linkRef;
    const rest = _.omit(props, _.keys(propTypes));
    const linkProps = {};
    if (_.isFunction(props.onPress)) {
        linkProps.onPress = props.onPress;
    } else {
        linkProps.href = props.href;
    }
    const defaultTextStyle = DeviceCapabilities.canUseTouchScreen() || props.isSmallScreenWidth ? {} : styles.userSelectText;

    return (
        <PressableWithSecondaryInteraction
            inline
            onSecondaryInteraction={
                (event) => {
                    ReportActionContextMenu.showContextMenu(
                        Str.isValidEmail(props.displayName) ? ContextMenuActions.CONTEXT_MENU_TYPES.EMAIL : ContextMenuActions.CONTEXT_MENU_TYPES.LINK,
                        event,
                        props.href,
                        lodashGet(linkRef, 'current'),
                    );
                }
            }
        >
            <Tooltip containerStyles={[styles.dInline]} text={Str.isValidEmail(props.displayName) ? '' : props.href}>
                <Text
                    ref={el => linkRef = el}
                    style={StyleSheet.flatten([props.style, defaultTextStyle])}
                    accessibilityRole="link"
                    hrefAttrs={{
                        rel: props.rel,
                        target: props.target,
                    }}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...linkProps}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rest}
                >
                    {props.children}
                </Text>
            </Tooltip>
        </PressableWithSecondaryInteraction>
    );
};

BaseAnchorForCommentsOnly.propTypes = propTypes;
BaseAnchorForCommentsOnly.defaultProps = defaultProps;
BaseAnchorForCommentsOnly.displayName = 'BaseAnchorForCommentsOnly';

export default withWindowDimensions(BaseAnchorForCommentsOnly);
