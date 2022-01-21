import PropTypes from 'prop-types';
import {Animated} from 'react-native';

const propTypes = {
    /** Label */
    label: PropTypes.string.isRequired,

    /** Label vertical translate */
    labelTranslateY: PropTypes.instanceOf(Animated.Value).isRequired,

    /** Label scale */
    labelScale: PropTypes.instanceOf(Animated.Value).isRequired,

    /** For attribute for label */
    for: PropTypes.string,
};

const defaultProps = {
    for: '',
};

export {
    propTypes,
    defaultProps,
};
