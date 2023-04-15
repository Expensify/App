import React from 'react';
import {Image} from 'react-native';
import ButtonBase from './ButtonBase';

const GoogleLogoIcon = () => <Image source={require('../../../assets/images/signIn/googleLogo.png')} height={40} width={40} style={{height: 40, width: 40}} />;

const GoogleSignIn = () => <ButtonBase onPress={() => {}} icon={<GoogleLogoIcon />} />;

export default GoogleSignIn;
