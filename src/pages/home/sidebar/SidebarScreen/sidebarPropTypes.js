import PropTypes from 'prop-types';
import {windowDimensionsPropTypes} from '../../../../components/withWindowDimensions';

const sidebarPropTypes = {
    /** Callback when onLayout of sidebar is called */
    onLayout: PropTypes.func,
    ...windowDimensionsPropTypes,
};
export default sidebarPropTypes;
