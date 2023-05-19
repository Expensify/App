import {useEffect} from 'react';
import PropTypes from 'prop-types';
import BootSplash from '../../libs/BootSplash';

const propTypes = {
    /** Splash screen has been hidden */
    onHide: PropTypes.func,
};

const defaultProps = {
    onHide: () => {},
};

const SplashScreenHider = (props) => {
    const {onHide} = props;

    useEffect(() => {
        BootSplash.hide().then(() => onHide());
    }, [onHide]);

    return null;
};

SplashScreenHider.displayName = 'SplashScreenHider';
SplashScreenHider.propTypes = propTypes;
SplashScreenHider.defaultProps = defaultProps;

export default SplashScreenHider;
