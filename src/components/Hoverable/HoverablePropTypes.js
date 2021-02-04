import PropTypes from 'prop-types';

const propTypes = {
    // Children to wrap with Hoverable.
    children: PropTypes.node.isRequired,

    // Function that executes when the mouse moves over the children.
    onHoverIn: PropTypes.func,

    // Function that executes when the mouse leaves the children.
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
