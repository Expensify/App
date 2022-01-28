import {useEffect, useState} from 'react';

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

/**
*
* @param {{
*   onSuccess: function({ token: string, email: string, name: string }): void,
*   onFailure: function(*): void
* }} params
* @returns {{signIn: function, googleAuthLoaded: boolean}}
*/
const useGoogleLogin = ({
    onSuccess,
    onFailure,
}) => {
    const [googleAuthLoaded, setGoogleAuthLoaded] = useState(false);

    function signIn(e) {
        // Prevent submit if used within form
        if (e) {
            e.preventDefault();
        }

        // Prevent signIn if Google Auth is not ready
        if (!googleAuthLoaded) {
            return;
        }

        const GoogleAuth = window.gapi.auth2.getAuthInstance();
        GoogleAuth.signIn().then(
            (res) => {
                const basicProfile = res.getBasicProfile();
                const authResponse = res.getAuthResponse(true);
                onSuccess({
                    token: authResponse.id_token,
                    email: basicProfile.getEmail(),
                    name: basicProfile.getName(),
                });
            },
            err => onFailure(err),
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
                const gapi = window.gapi;
                gapi.load('auth2', () => {
                    gapi.auth2.init({
                        clientId: '1016036866283-rotn0elqu18bbju128nkf8ahcpaq8nb9.apps.googleusercontent.com',
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

    return {signIn, googleAuthLoaded};
};

export default useGoogleLogin;
