/* eslint-disable no-use-before-define */
/* eslint-disable react/destructuring-assignment */
import React, {useEffect} from 'react';

const GoogleSignInButton = ({clientId, onCredentialResponse}) => {
    useEffect(() => {
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: handleCredentialResponse,
            });

            window.google.accounts.id.renderButton(document.getElementById('google-signin-button'), {
                theme: 'outline',
                size: 'large',
            });

            window.google.accounts.id.prompt(); // Will prompt only if the user has a single session.
        }
    }, []);

    const handleCredentialResponse = (response) => {
        onCredentialResponse(response);
    };

    return <div id="google-signin-button" />;
};

export default GoogleSignInButton;
