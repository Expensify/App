import React from 'react';
import {View} from 'react-native';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import ButtonBase from './ButtonBase';
import AppleLogoIcon from '../../../assets/images/signIn/apple-logo.svg';

const propTypes = {...withLocalizePropTypes};

const $appleButtonContainerStyle = {
    width: 40,
    height: 40,
    marginRight: 20,
};

const AppleSignIn = (props) => (
    <View
        style={$appleButtonContainerStyle}
        accessibilityRole="button"
        accessibilityLabel={props.translate('common.signInWithApple')}
    >
        <ButtonBase
            onPress={() => {
                window.open('http://localhost:8080/signinwithapple');
            }}
            icon={<AppleLogoIcon />}
        />
    </View>
);

AppleSignIn.displayName = 'AppleSignIn';
AppleSignIn.propTypes = propTypes;

export default withLocalize(AppleSignIn);
