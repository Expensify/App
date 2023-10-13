import React from 'react';
import AndroidBackgroundImage from '../../../../../assets/images/home-background--android.svg';
import styles from '../../../../styles/styles';
import defaultPropTypes from './propTypes';

function BackgroundImage(props) {
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
