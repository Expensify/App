/* eslint-disable rulesdir/prefer-early-return */
import React from 'react';
import {View} from 'react-native';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import getUserLanguage from './getUserLanguage';
import { beginGoogleSignIn } from '../../libs/actions/Session';

const propTypes = {
    ...withLocalizePropTypes,
};

const $googleContaierStyle = {
    height: 40, width: 40, alignItems: 'center',
};

const clientIdForiOS = '921154746561-s3uqn2oe4m85tufi6mqflbfbuajrm2i3.apps.googleusercontent.com';
// from original PR: https://github.com/Expensify/App/pull/7372/files#diff-2d91a06700b1598fbf079188d1349fe3028caa7f9ce54324b2d9a656ffde402cR33
const clientIdForWeb = '921154746561-gpsoaqgqfuqrfsjdf8l7vohfkfj7b9up.apps.googleusercontent.com'

/// example response:
/// { clientId:
/// "921154746561-gpsoaqgqfuqrfsjdf8l7vohfkfj7b9up.apps.googleusercontent.com",
/// client_id:
/// "921154746561-gpsoaqgqfuqrfsjdf8l7vohfkfj7b9up.apps.googleusercontent.com",
/// credential:
/// "...",
/// select_by: "btn_confirm" }

const GoogleSignIn = ({id, translate}) => {
    const handleCredentialResponse = (response) => { // handle the response
      beginGoogleSignIn({token: response.credential});
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
                    client_id: clientIdForWeb,
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
