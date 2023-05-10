/* eslint-disable rulesdir/prefer-early-return */
import React from 'react';
import {View} from 'react-native';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import getUserLanguage from './getUserLanguage';

const propTypes = {
    ...withLocalizePropTypes,
};

const $googleContaierStyle = {
    height: 40, width: 40, alignItems: 'center',
};

const GoogleSignIn = ({id, translate}) => {
    const handleCredentialResponse = (response) => { // handle the response
    };

    React.useEffect(() => {
        const localeCode = getUserLanguage();
        const script = document.createElement('script');
        script.src = `https://accounts.google.com/gsi/client?h1${localeCode}`;
        script.async = true;
        function handleScriptLoad() {
            const google = window.google;
            if (google) {
                google.accounts.id.initialize({
                    client_id: '921154746561-gpsoaqgqfuqrfsjdf8l7vohfkfj7b9up.apps.googleusercontent.com',
                    callback: handleCredentialResponse,
                });
                google.accounts.id.renderButton(document.getElementById(id), {
                    theme: 'outline',
                    size: 'large',
                    type: 'icon',
                    shape: 'circle',
                });
            }
        }
        script.addEventListener('load', handleScriptLoad);
        document.body.appendChild(script);

        return () => {
            script.removeEventListener('load', handleScriptLoad);
            document.body.removeChild(script);
        };
    }, []);

    return (
        <View style={$googleContaierStyle}>
            <div
                accessibilityrole="button"
                accessibilitylabel={translate('common.signInWithGoogle')}
                id={id}
            />
        </View>
    );
};

GoogleSignIn.displayName = 'GoogleSignIn';
GoogleSignIn.propTypes = propTypes;

export default withLocalize(GoogleSignIn);
