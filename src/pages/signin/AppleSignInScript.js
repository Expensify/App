import React from 'react';

class AppleSignInScript extends React.Component {
    componentDidMount() {
        const clientId = 'com.expensify.expensifylite.AppleSignIn';
        const redirectURI = 'https://www.expensify.com/partners/apple/loginCallback';
        const scope = 'name email';
        const state = '';
        const script = document.createElement('script');
        script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
        script.async = true;
        script.onload = () => {
            window.AppleID.auth.init({
                clientId,
                scope,
                redirectURI,
                state,
                usePopup: false,
            });
        };

        document.body.appendChild(script);

        this.cleanupScript = () => {
            // Remove the script from the DOM when the component unmounts
            document.body.removeChild(script);
        };
    }

    componentWillUnmount() {
        this.cleanupScript();
    }

    render() {
        return null;
    }
}

export default AppleSignInScript;
