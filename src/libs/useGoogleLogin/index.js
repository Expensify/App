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
    // onSuccess = () => {},
    onSuccess,
    onFailure,

    onScriptLoadFailure,
    clientId,

    jsSrc = 'https://apis.google.com/js/api.js',
    prompt,
}) => {
    const [googleAuthLoaded, setGoogleAuthLoaded] = useState(false);

    function handleSigninSuccess(res) {
        /*
        offer renamed response keys to names that match use
      */
        const basicProfile = res.getBasicProfile();
        const authResponse = res.getAuthResponse(true);
        res.googleId = basicProfile.getId();
        res.tokenObj = authResponse;
        res.tokenId = authResponse.id_token;
        res.accessToken = authResponse.access_token;
        res.profileObj = {
            googleId: basicProfile.getId(),
            imageUrl: basicProfile.getImageUrl(),
            email: basicProfile.getEmail(),
            name: basicProfile.getName(),
            givenName: basicProfile.getGivenName(),
            familyName: basicProfile.getFamilyName(),
        };
        onSuccess(res);
    }

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
            res => handleSigninSuccess(res),
            err => onFailure(err),
        );
    }

    useEffect(() => {
        const onLoadFailure = onScriptLoadFailure || onFailure;
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
                        (err) => {
                            onLoadFailure(err);
                        },
                    );
                });
            },
            (err) => {
                onLoadFailure(err);
            },
        );

        return () => {
            removeScript(document, 'google-login');
        };
    }, []);

    return {signIn, googleAuthLoaded};
};

export default useGoogleLogin;
