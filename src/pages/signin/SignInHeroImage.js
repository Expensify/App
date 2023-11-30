import PropTypes from 'prop-types';
import React from 'react';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';

const propTypes = {
    ...windowDimensionsPropTypes,

    shouldShowSmallScreen: PropTypes.bool,
};

const defaultProps = {
    shouldShowSmallScreen: false,
};

function SignInHeroImage(props) {
    const styles = useThemeStyles();
    let imageSize;
    if (props.isSmallScreenWidth || props.shouldShowSmallScreen) {
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
            source={LottieAnimations.Hands}
            loop
            autoPlay
            style={[styles.alignSelfCenter, imageSize]}
            webStyle={{...styles.alignSelfCenter, ...imageSize}}
        />
    );
}

SignInHeroImage.displayName = 'SignInHeroImage';
SignInHeroImage.propTypes = propTypes;
SignInHeroImage.defaultProps = defaultProps;

export default withWindowDimensions(SignInHeroImage);
