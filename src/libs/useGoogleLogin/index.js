import {useEffect, useState} from 'react';
import Config from 'react-native-config';
import lodashGet from 'lodash/get';

function loadScript(d, s, id, jsSrc, cb, onError) {
    const element = d.getElementsByTagName(s)[0];
    const fjs = element;
    let js = element;
    js = d.createElement(s);
    js.id = id;
    js.src = jsSrc;
    if (fjs && fjs.parentNode) {
        fjs.parentNode.insertBefore(js, fjs);
    } else {
        d.head.appendChild(js);
    }
    js.onerror = onError;
    js.onload = cb;
}

function removeScript(d, id) {
    const element = d.getElementById(id);
    if (element) {
        element.parentNode.removeChild(element);
    }
}

function getGoogleApi() {
    return window.gapi;
}

/**
*
* @param {{
*   onSuccess: function({ token: string, email: string, name: string }): void,
*   onFailure: function(*): void
* }} params
* @returns {{googleAuthLoaded: boolean, signIn: function, isSigningIn: boolean}}
*/
const useGoogleLogin = ({
    onSuccess,
    onFailure,
}) => {
    const [googleAuthLoaded, setGoogleAuthLoaded] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState(false);

    function signIn(e) {
        // Prevent submit if used within form
        if (e) {
            e.preventDefault();
        }

        // Prevent signIn if Google Auth is not ready
        if (!googleAuthLoaded) {
            return;
        }

        setIsSigningIn(true);
        const GoogleAuth = getGoogleApi().auth2.getAuthInstance();
        GoogleAuth.signIn().then(
            (res) => {
                const basicProfile = res.getBasicProfile();
                const authResponse = res.getAuthResponse(true);
                onSuccess({
                    token: authResponse.id_token,
                    email: basicProfile.getEmail(),
                    name: basicProfile.getName(),
                });
                setIsSigningIn(false);
            },
            (err) => {
                onFailure(err);
                setIsSigningIn(false);
            },
        );
    }

    useEffect(() => {
        loadScript(
            document,
            'script',
            'google-login',
            'https://apis.google.com/js/api.js',
            () => {
                // Load Google Auth
                getGoogleApi().load('auth2', () => {
                    getGoogleApi().auth2.init({
                        clientId: lodashGet(Config, 'GOOGLE_CLIENT_ID', ''),
                    }).then(
                        () => setGoogleAuthLoaded(true),
                        err => onFailure(err),
                    );
                });
            },
            err => onFailure(err),
        );
        return () => removeScript(document, 'google-login');
    }, []);

    return {googleAuthLoaded, signIn, isSigningIn};
};

export default useGoogleLogin;
