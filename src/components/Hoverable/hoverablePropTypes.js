import PropTypes from 'prop-types';

const propTypes = {
    /** Whether to disable the hover action */
    disabled: PropTypes.bool,

    /** Children to wrap with Hoverable. */
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,

    /** Function that executes when the mouse moves over the children. */
    onHoverIn: PropTypes.func,

    /** Function that executes when the mouse leaves the children. */
    onHoverOut: PropTypes.func,

    /** Direct pass-through of React's onMouseEnter event. */
    onMouseEnter: PropTypes.func,

    /** Direct pass-through of React's onMouseLeave event. */
    onMouseLeave: PropTypes.func,

    /** Decides whether to handle the scroll behaviour to show hover once the scroll ends */
    shouldHandleScroll: PropTypes.bool,
};

const defaultProps = {
    disabled: false,
    onHoverIn: () => {},
    onHoverOut: () => {},
    shouldHandleScroll: false,
};

export {propTypes, defaultProps};
