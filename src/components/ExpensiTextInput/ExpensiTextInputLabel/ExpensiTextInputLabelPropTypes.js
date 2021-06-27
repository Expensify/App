import PropTypes from 'prop-types';
import {Animated} from 'react-native';

const expensiTextInputLabelPropTypes = {
    label: PropTypes.string,

    /** Label vertical translate */
    labelTranslateY: PropTypes.instanceOf(Animated.Value).isRequired,

    /** Label horizontal translate */
    labelTranslateX: PropTypes.instanceOf(Animated.Value).isRequired,

    /** Label scale */
    labelScale: PropTypes.instanceOf(Animated.Value).isRequired,
};

export default expensiTextInputLabelPropTypes;
