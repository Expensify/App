import React from 'react';
import {useGoogleLogin} from '@react-oauth/google';
import PropTypes from 'prop-types';
import Log from '../../libs/Log';
import withLocalize from '../withLocalize';
import Button from '../Button';

const propTypes = {
    apiCallback: PropTypes.func.optional,
};

const defaultProps = {
    apiCallback: () => {},
};

const GoogleSignInButton = (props) => {
    const login = useGoogleLogin({
        onSuccess: (response) => {
            props
                .apiCallback({token: response.idToken, email: response.user.email})
                .then((apiResponse => Log.error('API response: ', apiResponse)).catch(apiError => Log.error('API Callback error: ', apiError)));
        },
    });

    return <Button success onPress={login} text="Sign In With Google" />;
};

GoogleSignInButton.displayName = 'GoogleSignInButton';
GoogleSignInButton.propTypes = propTypes;
GoogleSignInButton.defaultProps = defaultProps;
export default withLocalize(GoogleSignInButton);
