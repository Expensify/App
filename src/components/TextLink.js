import PropTypes from 'prop-types';
import React from 'react';
import _ from 'underscore';
import stylePropTypes from '@styles/stylePropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import refPropTypes from './refPropTypes';
import Text from './Text';

const propTypes = {
    /** Link to open in new tab */
    href: PropTypes.string,

    /** Text content child */
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object]).isRequired,

    /** Additional style props */
    style: stylePropTypes,

    /** Overwrites the default link behavior with a custom callback */
    onPress: PropTypes.func,

    /** Callback that is called when mousedown is triggered */
    onMouseDown: PropTypes.func,

    /** A ref to forward to text */
    forwardedRef: refPropTypes,
};

const defaultProps = {
    forwardedRef: undefined,
    href: undefined,
    style: [],
    onPress: undefined,
    onMouseDown: (event) => event.preventDefault(),
};

function TextLink(props) {
    const styles = useThemeStyles();
    const rest = _.omit(props, _.keys(propTypes));
    const additionalStyles = _.isArray(props.style) ? props.style : [props.style];

    /**
     * @param {Event} event
     */
    const openLink = (event) => {
        event.preventDefault();
        if (props.onPress) {
            props.onPress();
            return;
        }

        Link.openExternalLink(props.href);
    };

    /**
     * @param {Event} event
     */
    const openLinkIfEnterKeyPressed = (event) => {
        if (event.key !== 'Enter') {
            return;
        }
        openLink(event);
    };

    return (
        <Text
            style={[styles.link, ...additionalStyles]}
            role={CONST.ACCESSIBILITY_ROLE.LINK}
            href={props.href}
            onPress={openLink}
            onMouseDown={props.onMouseDown}
            onKeyDown={openLinkIfEnterKeyPressed}
            ref={props.forwardedRef}
            suppressHighlighting
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        >
            {props.children}
        </Text>
    );
}

TextLink.defaultProps = defaultProps;
TextLink.propTypes = propTypes;
TextLink.displayName = 'TextLink';

const TextLinkWithRef = React.forwardRef((props, ref) => (
    <TextLink
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

TextLinkWithRef.displayName = 'TextLinkWithRef';

export default TextLinkWithRef;
