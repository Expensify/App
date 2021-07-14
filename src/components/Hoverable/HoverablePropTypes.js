import PropTypes from 'prop-types';

const propTypes = {
    /** Children to wrap with Hoverable. */
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.func,
    ]).isRequired,

    /** Styles to be assigned to the Hoverable Container */
    // eslint-disable-next-line react/forbid-prop-types
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Function that executes when the mouse moves over the children. */
    onHoverIn: PropTypes.func,

    /** Function that executes when the mouse leaves the children. */
    onHoverOut: PropTypes.func,

    // If the mouse clicks outside, should we dismiss hover?
    resetsOnClickOutside: PropTypes.bool,
};

const defaultProps = {
    containerStyles: [],
    onHoverIn: () => {},
    onHoverOut: () => {},
    resetsOnClickOutside: false,
};

export {
    propTypes,
    defaultProps,
};
