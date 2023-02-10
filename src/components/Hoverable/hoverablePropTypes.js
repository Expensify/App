import PropTypes from 'prop-types';

const propTypes = {
    /** Whether to disable additional wrapper around the children. It will only work for single native(View|Text) child.  */
    absolute: PropTypes.bool,

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
};

const defaultProps = {
    absolute: false,
    containerStyles: [],
    onHoverIn: () => {},
    onHoverOut: () => {},
};

export {
    propTypes,
    defaultProps,
};
