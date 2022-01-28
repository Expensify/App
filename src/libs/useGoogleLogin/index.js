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

const useGoogleLogin = ({
    clientId,
    onSuccess,
    onFailure,
    jsSrc = 'https://apis.google.com/js/api.js',
    prompt,
}) => {
    const [googleAuthLoaded, setGoogleAuthLoaded] = useState(false);

    function signIn(e) {
        if (e) {
            e.preventDefault(); // to prevent submit if used within form
        }

        if (!googleAuthLoaded) {
            return;
        }

        const GoogleAuth = window.gapi.auth2.getAuthInstance();
        const options = {
            prompt,
        };
        GoogleAuth.signIn(options).then(
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
            jsSrc,
            () => {
                const params = {
                    client_id: clientId,
                };
                const gapi = window.gapi;
                gapi.load('auth2', () => {
                    gapi.auth2.init(params).then(
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
