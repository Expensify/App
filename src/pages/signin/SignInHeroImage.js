
import {View} from 'react-native';
import React from 'react';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import * as Illustrations from '../../components/Icon/Illustrations';
import styles from '../../styles/styles';

// import Icon from '../../components/Icon';
// import variables from '../../styles/variables';
// import SVGImage from '../../components/SVGImage';

const propTypes = {
    ...windowDimensionsPropTypes,
};

const SignInHeroImage = () => (
    <View style={[{backgroundColor: 'blue'}, {flex: 1}, styles.alignSelfCenter]}>
        {/* <Icon
            width={props.isMediumScreenWidth ? variables.signInHeroImageDesktop : variables.signInHeroImageDesktopLarge}
            height={props.isMediumScreenWidth ? variables.signInHeroImageDesktop : variables.signInHeroImageDesktopLarge}
            src={props.isSmallScreenWidth ? Illustrations.HandsMobile : Illustrations.HandsDesktop}
            additionalStyles={[{width: '100%'}]}
        /> */}
        <Illustrations.HandsMobile
            width="100%"
            height="100%"
        />
    </View>
);

SignInHeroImage.displayName = 'SignInHeroImage';
SignInHeroImage.propTypes = propTypes;

export default withWindowDimensions(SignInHeroImage);
