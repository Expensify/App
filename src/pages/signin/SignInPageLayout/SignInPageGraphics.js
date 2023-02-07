import {Pressable} from 'react-native';
import React from 'react';
import _ from 'underscore';
import styles from '../../../styles/styles';
import * as StyleUtils from '../../../styles/StyleUtils';
import * as Link from '../../../libs/actions/Link';
import SVGImage from '../../../components/SVGImage';

const backgroundStyle = StyleUtils.getLoginPagePromoStyle();

const SignInPageGraphics = () => (
    <>
        <Pressable
            style={[
                styles.flex1,
                {minHeight: '100%', minWidth: '100%'},
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
    </>
);

SignInPageGraphics.displayName = 'SignInPageGraphics';

export default SignInPageGraphics;
