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
 * Effect hook that loads Google script into the DOM, initialize the Google API and returns a function to signIn the
 * user with their Google account
 *
 * @param {Object} params
 * @param {function({ token: string, email: string }) : void} params.onSuccess
 * @param {function(*) : void} [params.onFailure]
 * @returns {{
 *   googleAuthLoaded: boolean,
 *   signIn: function(): void,
 *   isSigningIn: boolean,
 *   name: string
 * }}
 */
const useGoogleLogin = ({
    onSuccess,
    onFailure = () => {},
}) => {
    const [googleAuthLoaded, setGoogleAuthLoaded] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [name, setName] = useState('');

    function signIn() {
        // Prevent signIn if Google Auth is not ready or if there's previous signIn function running
        if (!googleAuthLoaded || isSigningIn) {
            return;
        }

        setIsSigningIn(true);
        const GoogleAuth = getGoogleApi().auth2.getAuthInstance();
        GoogleAuth.signIn().then(
            (signInRes) => {
                const basicProfile = signInRes.getBasicProfile();
                const authResponse = signInRes.getAuthResponse(true);
                setName(basicProfile.getName());
                onSuccess({
                    token: authResponse.id_token,
                    email: basicProfile.getEmail(),
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

    return {
        googleAuthLoaded, signIn, isSigningIn, name,
    };
};

export default useGoogleLogin;
