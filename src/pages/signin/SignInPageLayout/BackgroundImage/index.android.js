import React from 'react';
import AndroidBackgroundImage from '@assets/images/home-background--android.svg';
import useThemeStyles from '@styles/useThemeStyles';
import defaultPropTypes from './propTypes';

function BackgroundImage(props) {
    const styles = useThemeStyles();
    return (
        <AndroidBackgroundImage
            pointerEvents={props.pointerEvents}
            width={props.width}
            style={styles.signInBackground}
        />
    );
}

BackgroundImage.displayName = 'BackgroundImage';
BackgroundImage.propTypes = defaultPropTypes;

export default BackgroundImage;
