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
 * user with their Google account;
 *
 * @returns {{
 *   googleAuthLoaded: boolean,
 *   signIn: function(): void,
 *   isSigningIn: boolean,
 *   res: ({ token: string, email: string, name: string } | null),
 *   err: *
 * }}
 */
const useGoogleLogin = () => {
    const [googleAuthLoaded, setGoogleAuthLoaded] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [res, setRes] = useState(null);
    const [err, setErr] = useState(null);

    function signIn() {
        // Prevent signIn if Google Auth is not ready, if there's previous signIn function running or if there was an
        // already successful response.
        if (!googleAuthLoaded || isSigningIn || res) {
            return;
        }

        setIsSigningIn(true);
        const GoogleAuth = getGoogleApi().auth2.getAuthInstance();
        GoogleAuth.signIn().then(
            (signInRes) => {
                const basicProfile = signInRes.getBasicProfile();
                const authResponse = signInRes.getAuthResponse(true);
                setRes({
                    token: authResponse.id_token,
                    email: basicProfile.getEmail(),
                    name: basicProfile.getName(),
                });
                setIsSigningIn(false);
            },
            (signInErr) => {
                setErr(signInErr);
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
                        googleAuthError => setErr(googleAuthError),
                    );
                });
            },
            loadScriptErr => setErr(loadScriptErr),
        );
        return () => removeScript(document, 'google-login');
    }, []);

    return {
        googleAuthLoaded, signIn, isSigningIn, res, err,
    };
};

export default useGoogleLogin;
