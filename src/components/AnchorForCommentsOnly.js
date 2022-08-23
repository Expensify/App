import _ from 'underscore';
import React from 'react';
import {StyleSheet} from 'react-native';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import PropTypes from 'prop-types';
import Text from './Text';
import PressableWithSecondaryInteraction from './PressableWithSecondaryInteraction';
import * as ReportActionContextMenu from '../pages/home/report/ContextMenu/ReportActionContextMenu';
import * as ContextMenuActions from '../pages/home/report/ContextMenu/ContextMenuActions';
import Tooltip from './Tooltip';
import canUseTouchScreen from '../libs/canUseTouchscreen';
import styles from '../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';

const propTypes = {
    /** The URL to open */
    href: PropTypes.string,

    /** What headers to send to the linked page (usually noopener and noreferrer)
        This is unused in native, but is here for parity with web */
    rel: PropTypes.string,

    /** Used to determine where to open a link ("_blank" is passed for a new tab)
        This is unused in native, but is here for parity with web */
    target: PropTypes.string,

    /** Any children to display */
    children: PropTypes.node,

    /** Anchor text of URLs or emails. */
    displayName: PropTypes.string,

    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,

    /** Press handler for the link, when not passed, default href is used to create a link like behaviour */
    onPress: PropTypes.func,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    href: '',
    rel: '',
    target: '',
    children: null,
    style: {},
    displayName: '',
    onPress: undefined,
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
    const defaultTextStyle = canUseTouchScreen() || props.isSmallScreenWidth ? {} : styles.userSelectText;

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
            <Tooltip text={Str.isValidEmail(props.displayName) ? '' : props.href}>
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
