import {Image} from 'expo-image';
import PropTypes from 'prop-types';
import React from 'react';
import AndroidBackgroundImage from '@assets/images/home-background--android.svg';
import useThemeStyles from '@hooks/useThemeStyles';
import defaultPropTypes from './propTypes';

const defaultProps = {
    onLoadEnd: () => {},
};

const propTypes = {
    /** Called when the image load either succeeds or fails. */
    onLoadEnd: PropTypes.func,

    ...defaultPropTypes,
};

function BackgroundImage(props) {
    const styles = useThemeStyles();
    return (
        <Image
            source={AndroidBackgroundImage}
            pointerEvents={props.pointerEvents}
            style={[styles.signInBackground, {width: props.width}]}
            onLoadEnd={props.onLoadEnd}
        />
    );
}

BackgroundImage.displayName = 'BackgroundImage';
BackgroundImage.propTypes = propTypes;
BackgroundImage.defaultProps = defaultProps;

export default BackgroundImage;
