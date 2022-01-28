import React from 'react';
import {View} from 'react-native';
import styles from '../styles/styles';
import Button from './Button';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import useGoogleLogin from '../libs/useGoogleLogin';

const propTypes = {
    ...withLocalizePropTypes,
};

const defaultProps = {
    anchorPosition: {},
    payPalMeUsername: '',
    shouldShowPaypal: true,
    betas: [],
};
const SignInOptions = (props) => {
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
    return (
        <>
            <View style={[styles.mt5]}>
                <Button
                    success
                    text={props.translate('signInPage.google')}
                    isLoading={isSigningIn}
                    isDisabled={!googleAuthLoaded}
                    onPress={signIn}
                />
            </View>
        </>
    );
};

SignInOptions.propTypes = propTypes;
SignInOptions.defaultProps = defaultProps;

export default withLocalize(SignInOptions);
