import {Pressable} from 'react-native';
import React from 'react';
import _ from 'underscore';
import * as StyleUtils from '../../../styles/StyleUtils';
import * as Link from '../../../libs/actions/Link';
import SVGImage from '../../../components/SVGImage';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';

const backgroundStyle = StyleUtils.getLoginPagePromoStyle();

const propTypes = {
    ...windowDimensionsPropTypes,
};

const SignInPageGraphics = props => (
    <Pressable
        style={[
            StyleUtils.getHeight(props.windowHeight),
            StyleUtils.getBackgroundColorStyle(backgroundStyle.backgroundColor),
        ]}
        onPress={() => {
            Link.openExternalLink(backgroundStyle.redirectUri);
        }}
        disabled={_.isEmpty(backgroundStyle.redirectUri)}
    >
        <SVGImage
            width="100%"
            height="100%"
            src={backgroundStyle.backgroundImageUri}
            resizeMode="contain"
        />
    </Pressable>
);

SignInPageGraphics.displayName = 'SignInPageGraphics';
SignInPageGraphics.propTypes = propTypes;

export default withWindowDimensions(SignInPageGraphics);
