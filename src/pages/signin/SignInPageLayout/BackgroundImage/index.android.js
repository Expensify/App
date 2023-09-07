import React from 'react';
import PropTypes from 'prop-types';
import AndroidBackgroundImage from '../../../../../assets/images/home-background--android.svg';
import styles from '../../../../styles/styles';

const propTypes = {
    pointerEvents: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
};

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
BackgroundImage.propTypes = propTypes;

export default BackgroundImage;
