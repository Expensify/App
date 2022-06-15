import PropTypes from 'prop-types';
import {windowDimensionsPropTypes} from '../withWindowDimensions';

const propTypes = {

    /** URL to full-sized image */
    sourceURL: PropTypes.string,

    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    sourceURL: '',
    style: {},
};

export {propTypes, defaultProps};
