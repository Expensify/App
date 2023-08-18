import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import Text from './Text';
import styles from '../styles/styles';
import stylePropTypes from '../styles/stylePropTypes';
import CONST from '../CONST';
import * as Link from '../libs/actions/Link';

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
    forwardedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.instanceOf(React.Component)})]),
};

const defaultProps = {
    forwardedRef: undefined,
    href: undefined,
    style: [],
    onPress: undefined,
    onMouseDown: (event) => event.preventDefault(),
};

function TextLink(props) {
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
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.LINK}
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
export default React.forwardRef((props, ref) => (
    <TextLink
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));
