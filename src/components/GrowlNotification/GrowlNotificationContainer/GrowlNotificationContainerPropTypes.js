import {Animated} from 'react-native';
import PropTypes from 'prop-types';

const propTypes = {
    /** GrowlNotification content */
    children: PropTypes.node.isRequired,

    /** GrowlNotification Y postion, required to show or hide with fling animation */
    translateY: PropTypes.instanceOf(Animated.Value).isRequired,
};

export default propTypes;
