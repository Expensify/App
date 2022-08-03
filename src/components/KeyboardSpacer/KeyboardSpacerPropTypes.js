import PropTypes from 'prop-types';
import {
    LayoutAnimation,
    ViewPropTypes,
} from 'react-native';

const propTypes = {
    topSpacing: PropTypes.number,
    onToggle: PropTypes.func,
    style: ViewPropTypes.style,
    iOSAnimated: PropTypes.bool,
    keyboardShowMethod: PropTypes.string,
    keyboardHideMethod: PropTypes.string,
};

const defaultProps = {
    topSpacing: 0,
    onToggle: () => null,
    style: [],
    iOSAnimated: false,
};

const defaultAnimation = {
    duration: 500,
    create: {
        duration: 300,
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
    },
    update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 200,
    },
};

export {propTypes, defaultProps, defaultAnimation};
