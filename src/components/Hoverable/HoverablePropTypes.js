import PropTypes from 'prop-types';

const propTypes = {
    // Children to wrap with Hoverable.
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.func,
    ]).isRequired,

    // Styles to be assigned to the Hoverable Container
    containerStyle: PropTypes.object,

    // Function that executes when the mouse moves over the children.
    onHoverIn: PropTypes.func,

    // Function that executes when the mouse leaves the children.
    onHoverOut: PropTypes.func,
};

const defaultProps = {
    containerStyle: {},
    onHoverIn: () => {},
    onHoverOut: () => {},
};

export {
    propTypes,
    defaultProps,
};
