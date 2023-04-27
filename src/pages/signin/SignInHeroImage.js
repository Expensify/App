import React from 'react';
import Lottie from 'lottie-react-native';
import hands from '../../../assets/animations/Hands.json';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import styles from '../../styles/styles';
import variables from '../../styles/variables';

const propTypes = {
    ...windowDimensionsPropTypes,
};

const SignInHeroImage = (props) => {
    let imageSize;
    if (props.isSmallScreenWidth) {
        imageSize = {
            height: variables.signInHeroImageMobileHeight,
            width: variables.signInHeroImageMobileWidth,
        };
    } else if (props.isMediumScreenWidth) {
        imageSize = {
            height: variables.signInHeroImageTabletHeight,
            width: variables.signInHeroImageTabletWidth,
        };
    } else {
        imageSize = {
            height: variables.signInHeroImageDesktopHeight,
            width: variables.signInHeroImageDesktopWidth,
        };
    }

    return (
        <Lottie
            source={hands}
            loop
            autoPlay
            style={[styles.alignSelfCenter, imageSize]}
        />
    );
};

SignInHeroImage.displayName = 'SignInHeroImage';
SignInHeroImage.propTypes = propTypes;

export default withWindowDimensions(SignInHeroImage);
