import PropTypes from 'prop-types';
import {Animated} from 'react-native';

const propTypes = {
    /** GrowlNotification content */
    children: PropTypes.node.isRequired,

    /** GrowlNotification Y postion, required to show or hide with fling animation */
    translateY: PropTypes.instanceOf(Animated.Value).isRequired,
};

export default propTypes;
