import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import styles from '../styles/styles';
import Button from './Button';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import useGoogleLogin from '../libs/useGoogleLogin';

const propTypes = {
    /** Callback to trigger when the button "Email or Phone Number" is pressed */
    onEmailOrPhoneNumberPress: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
};

function SignInOptions(props) {
    const {
        googleAuthLoaded, signIn, isSigningIn, res, err,
    } = useGoogleLogin();
    if (res) {
        debugger;
        console.log(res);
    }
    if (err) {
        debugger;
        console.log(err);
    }
    if (props.asdfFunc) {
        props.asdfFunc();
    }
    return (
        <>
            <View style={[styles.mt5]}>
                <Button
                    success
                    text={props.translate('signInPage.emailOrPhoneNumber')}
                    onPress={props.onEmailOrPhoneNumberPress}
                />
            </View>
            <View style={[styles.mt3]}>
                <Button
                    success
                    text={props.translate('signInPage.googleButton', {name: lodashGet(res, '')})}
                    isLoading={isSigningIn}
                    isDisabled={!googleAuthLoaded}
                    onPress={signIn}
                />
            </View>
            <View style={[styles.mt3]}>
                <Button
                    success
                    text={props.translate('signInPage.appleButton')}
                />
            </View>
        </>
    );
}

SignInOptions.propTypes = propTypes;

export default withLocalize(SignInOptions);
