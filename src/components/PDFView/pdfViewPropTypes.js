import PropTypes from 'prop-types';
import {windowDimensionsPropTypes} from '../withWindowDimensions';

const propTypes = {

    /** URL to full-sized image */
    sourceURL: PropTypes.string,

    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,

    /** Notify parent that we're requesting input from user */
    onUserInputRequired: PropTypes.func,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    sourceURL: '',
    style: {},
    onUserInputRequired: () => {},
};

export {propTypes, defaultProps};
