import PropTypes from 'prop-types';

const propTypes = {
    /** Input label */
    children: PropTypes.node.isRequired,

    /** Has Label */
    hasLabel: PropTypes.bool.isRequired,

    /** On press to wrapper */
    onPress: PropTypes.func.isRequired,

    /** Is input in focus? */
    isFocused: PropTypes.bool.isRequired,

    /** Has error? */
    error: PropTypes.bool.isRequired,

    /** Styles for the outermost container for this component. */
    containerStyles: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    containerStyles: [],
};

export {propTypes, defaultProps};
