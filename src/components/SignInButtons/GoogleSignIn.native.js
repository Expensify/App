import React from 'react';
import {Image} from 'react-native';
import ButtonBase from './ButtonBase';

const GoogleLogoIcon = () => <Image source={require('../../../assets/images/signIn/googleLogo.png')} height={50} width={50} style={{height: 50, width: 50}} />;

const GoogleSignIn = () => <ButtonBase onPress={() => {}} icon={<GoogleLogoIcon />} />;

GoogleSignIn.displayName = 'GoogleSignIn';

export default GoogleSignIn;
