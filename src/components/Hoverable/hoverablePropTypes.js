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
};

const defaultProps = {
    disabled: false,
    onHoverIn: () => {},
    onHoverOut: () => {},
};

export {propTypes, defaultProps};
