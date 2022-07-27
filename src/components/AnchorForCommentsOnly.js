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

/**
 * Text based component that is passed a URL to open onPress
 */
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

    /** Filename in case of attachments, anchor text in case of URLs or emails. */
    displayName: PropTypes.string,

    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,

    /** Press handler for the link */
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
class BaseAnchorForCommentsOnly extends React.Component {
    render() {
        let linkRef;
        const rest = _.omit(this.props, _.keys(propTypes));
        const linkProps = {};
        if (_.isFunction(this.props.onPress)) {
            linkProps.onPress = this.props.onPress;
        } else {
            linkProps.href = this.props.href;
        }
        const defaultTextStyle = canUseTouchScreen() || this.props.isSmallScreenWidth ? {} : styles.userSelectText;

        return (
            <PressableWithSecondaryInteraction
                inline
                onSecondaryInteraction={
                        (event) => {
                            ReportActionContextMenu.showContextMenu(
                                Str.isValidEmail(this.props.displayName) ? ContextMenuActions.CONTEXT_MENU_TYPES.EMAIL : ContextMenuActions.CONTEXT_MENU_TYPES.LINK,
                                event,
                                this.props.href,
                                lodashGet(linkRef, 'current'),
                            );
                        }
                    }
            >
                <Tooltip text={Str.isValidEmail(this.props.displayName) ? '' : this.props.href}>
                    <Text
                        ref={el => linkRef = el}
                        style={StyleSheet.flatten([this.props.style, defaultTextStyle])}
                        accessibilityRole="link"
                        hrefAttrs={{
                            rel: this.props.rel,
                            target: this.props.target,
                        }}
                                // eslint-disable-next-line react/jsx-props-no-spreading
                        {...linkProps}
                                // eslint-disable-next-line react/jsx-props-no-spreading
                        {...rest}
                    >
                        {this.props.children}
                    </Text>
                </Tooltip>
            </PressableWithSecondaryInteraction>
        );
    }
}

BaseAnchorForCommentsOnly.propTypes = propTypes;
BaseAnchorForCommentsOnly.defaultProps = defaultProps;
BaseAnchorForCommentsOnly.displayName = 'BaseAnchorForCommentsOnly';

export default withWindowDimensions(BaseAnchorForCommentsOnly);
