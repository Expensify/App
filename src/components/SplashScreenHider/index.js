import PropTypes from 'prop-types';
import {useEffect} from 'react';
import BootSplash from '@libs/BootSplash';

const propTypes = {
    /** Splash screen has been hidden */
    onHide: PropTypes.func,
};

const defaultProps = {
    onHide: () => {},
};

function SplashScreenHider(props) {
    const {onHide} = props;

    useEffect(() => {
        BootSplash.hide().then(() => onHide());
    }, [onHide]);

    return null;
}

SplashScreenHider.displayName = 'SplashScreenHider';
SplashScreenHider.propTypes = propTypes;
SplashScreenHider.defaultProps = defaultProps;

export default SplashScreenHider;
