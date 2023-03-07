
import {View} from 'react-native';
import React from 'react';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import * as Illustrations from '../../components/Icon/Illustrations';
import Icon from '../../components/Icon';

const propTypes = {
    ...windowDimensionsPropTypes,
};

const SignInHeroImage = props => (
    <View style={[{backgroundColor: 'blue'}]}>
        <Icon
            width={props.isMediumScreenWidth ? 360 : 470}
            height={props.isMediumScreenWidth ? 360 : 470}
            src={props.isSmallScreenWidth ? Illustrations.HandsMobile : Illustrations.HandsDesktop}
        />
    </View>
);

SignInHeroImage.displayName = 'SignInHeroImage';
SignInHeroImage.propTypes = propTypes;

export default withWindowDimensions(SignInHeroImage);
