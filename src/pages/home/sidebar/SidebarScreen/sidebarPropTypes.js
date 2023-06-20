import PropTypes from 'prop-types';
import {windowDimensionsPropTypes} from '../../../../components/withWindowDimensions';

const sidebarPropTypes = {
    /** reportID in the current navigation state */
    reportIDFromRoute: PropTypes.string,

    /** Callback when onLayout of sidebar is called */
    onLayout: PropTypes.func,
    ...windowDimensionsPropTypes,
};
export default sidebarPropTypes;
