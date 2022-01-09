import PropTypes from 'prop-types';
import stylePropTypes from '../../../styles/stylePropTypes';

const propTypes = {
    /** Styles for Text */
    textStyle: stylePropTypes,

    /** Children to wrap with Tooltip. */
    children: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array,
        PropTypes.object,
    ]).isRequired,
};

const defaultProps = {
    textStyle: {},
};

export {
    propTypes, defaultProps,
};
