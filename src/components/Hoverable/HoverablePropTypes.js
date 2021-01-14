import {Component} from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    /* Child to wrap with Hoverable. Must be only child. */
    children: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.element,
        PropTypes.instanceOf(Component),
    ]).isRequired,

    /* Function that executes when the mouse moves over the child element. */
    onHoverIn: PropTypes.func,

    /* Function that executes when the mouse leaves the child element. */
    onHoverOut: PropTypes.func,
};

const defaultProps = {
    onHoverIn: () => {},
    onHoverOut: () => {},
};

export {
    propTypes,
    defaultProps,
};
