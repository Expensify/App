import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import getUserLanguage from '../GetUserLanguage';
import * as Session from '../../../libs/actions/Session';

const propTypes = {
    isDesktopFlow: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isDesktopFlow: false,
};

const $googleContainerStyle = {
    height: 40,
    width: 40,
    alignItems: 'center',
    marginLeft: 12,
};

const $continueWithGoogleContainerStyle = {
    height: 40,
    width: 219,
    // alignItems: 'center',
};

// const clientIdForiOS = '921154746561-s3uqn2oe4m85tufi6mqflbfbuajrm2i3.apps.googleusercontent.com';
// from original PR: https://github.com/Expensify/App/pull/7372/files#diff-2d91a06700b1598fbf079188d1349fe3028caa7f9ce54324b2d9a656ffde402cR33
const clientIdForWeb = '921154746561-gpsoaqgqfuqrfsjdf8l7vohfkfj7b9up.apps.googleusercontent.com';

const GoogleSignIn = ({id, translate, isDesktopFlow}) => {
    const handleCredentialResponse = (response) => {
        Session.beginGoogleSignIn(response.credential);
    };

    // TODO: simplify
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
    }, [id]);

    return<View style={$googleContainerStyle}>
    <div id={id} />
</View>;

    // isDesktopFlow ? (
    //     <View
    //         style={$continueWithGoogleContainerStyle}
    //     >
    //         <div id="g_id_onload"
    //             data-client_id={clientIdForWeb}
    //             accessibilityrole="button"
    //             accessibilitylabel={translate('common.signInWithGoogle')} />
            
    //         <div className="g_id_signin"
    //             data-type="standard"
    //             data-shape="pill"
    //             data-theme="outline"
    //             data-text="continue_with"
    //             data-size="large"
    //             data-logo_alignment="left" />
    //     </View>
    // ) :
};

GoogleSignIn.displayName = 'GoogleSignIn';
GoogleSignIn.propTypes = propTypes;
GoogleSignIn.defaultProps = defaultProps;

export default withLocalize(GoogleSignIn);
