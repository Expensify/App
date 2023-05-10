/* eslint-disable rulesdir/prefer-early-return */
import React from 'react';
import {View, Text} from 'react-native';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import ButtonBase from './ButtonBase';
import GoogleLogoIcon from '../../../assets/images/signIn/google-logo.svg';

const propTypes = {
    ...withLocalizePropTypes,
};

const $googleContainerStyle = {
    height: 40, width: 40, alignItems: 'center',
};

const GoogleSignIn = ({id, translate}) => (
    <View style={$googleContainerStyle}>
        <ButtonBase onPress={() => {window.open('http://localhost:8080/signinwithgoogle')}} icon={<GoogleLogoIcon />} />
    </View>
);

GoogleSignIn.displayName = 'GoogleSignIn';
GoogleSignIn.propTypes = propTypes;

export default withLocalize(GoogleSignIn);
