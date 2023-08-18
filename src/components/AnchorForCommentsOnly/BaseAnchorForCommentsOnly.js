import _ from 'underscore';
import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import Text from '../Text';
import PressableWithSecondaryInteraction from '../PressableWithSecondaryInteraction';
import * as ReportActionContextMenu from '../../pages/home/report/ContextMenu/ReportActionContextMenu';
import * as ContextMenuActions from '../../pages/home/report/ContextMenu/ContextMenuActions';
import Tooltip from '../Tooltip';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import {propTypes as anchorForCommentsOnlyPropTypes} from './anchorForCommentsOnlyPropTypes';
import CONST from '../../CONST';
import useWindowDimensions from '../../hooks/useWindowDimensions';

const propTypes = {
    /** Press in handler for the link */
    // eslint-disable-next-line react/require-default-props
    onPressIn: PropTypes.func,

    /** Press out handler for the link */
    // eslint-disable-next-line react/require-default-props
    onPressOut: PropTypes.func,

    ...anchorForCommentsOnlyPropTypes,
};

/*
 * This is a default anchor component for regular links.
 */
function BaseAnchorForCommentsOnly({onPressIn, onPressOut, href = '', rel = '', target = '', children = null, style = {}, onPress, ...rest}) {
    useEffect(
        () => () => {
            ReportActionContextMenu.hideContextMenu();
        },
        [],
    );

    const {isSmallScreenWidth} = useWindowDimensions();

    let linkRef;

    const linkProps = {};
    if (_.isFunction(onPress)) {
        linkProps.onPress = onPress;
    } else {
        linkProps.href = href;
    }
    const defaultTextStyle = DeviceCapabilities.canUseTouchScreen() || isSmallScreenWidth ? {} : {...styles.userSelectText, ...styles.cursorPointer};
    const isEmail = Str.isValidEmailMarkdown(href.replace(/mailto:/i, ''));

    return (
        <PressableWithSecondaryInteraction
            inline
            style={[styles.cursorDefault, StyleUtils.getFontSizeStyle(style.fontSize)]}
            onSecondaryInteraction={(event) => {
                ReportActionContextMenu.showContextMenu(
                    isEmail ? ContextMenuActions.CONTEXT_MENU_TYPES.EMAIL : ContextMenuActions.CONTEXT_MENU_TYPES.LINK,
                    event,
                    href,
                    lodashGet(linkRef, 'current'),
                );
            }}
            onPress={(event) => {
                if (!linkProps.onPress) {
                    return;
                }

                event.preventDefault();
                linkProps.onPress();
            }}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.LINK}
            accessibilityLabel={href}
        >
            <Tooltip text={href}>
                <Text
                    ref={(el) => (linkRef = el)}
                    style={StyleSheet.flatten([style, defaultTextStyle])}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.LINK}
                    hrefAttrs={{
                        rel,
                        target: isEmail || !linkProps.href ? '_self' : target,
                    }}
                    href={linkProps.href || href}
                    suppressHighlighting
                    // Add testID so it gets selected as an anchor tag by SelectionScraper
                    testID="a"
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rest}
                >
                    {children}
                </Text>
            </Tooltip>
        </PressableWithSecondaryInteraction>
    );
}

BaseAnchorForCommentsOnly.propTypes = propTypes;
BaseAnchorForCommentsOnly.displayName = 'BaseAnchorForCommentsOnly';

export default BaseAnchorForCommentsOnly;
