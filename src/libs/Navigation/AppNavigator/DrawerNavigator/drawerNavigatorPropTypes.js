import PropTypes from 'prop-types';
import {windowDimensionsPropTypes} from '../../../../components/withWindowDimensions';

const propTypes = {
    /** Screens to be passed in the Drawer */
    screens: PropTypes.arrayOf(PropTypes.shape({
        /** Name of the Screen */
        name: PropTypes.string.isRequired,

        /** Component for the Screen */
        component: PropTypes.elementType.isRequired,

        /** Optional params to be passed to the Screen */
        // eslint-disable-next-line react/forbid-prop-types
        initialParams: PropTypes.object,
    })).isRequired,

    /** Drawer content Component */
    drawerContent: PropTypes.elementType.isRequired,

    /** If it's the main screen, don't wrap the content even if it's a full screen modal. */
    isMainScreen: PropTypes.bool,

    /** Window Dimensions props */
    ...windowDimensionsPropTypes,
};

export default propTypes;
