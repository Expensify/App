import React, {useLayoutEffect, useState, useEffect} from 'react';
import {View} from 'react-native';

const config = {
    clientId: 'com.infinitered.expensify.test',
    scope: 'name email',
    redirectURI: 'https://exptest.ngrok.io/appleauth',
    state: '',
    nonce: '',
    usePopup: true,
};

const cachedScripts = [];
const useScript = (src) => {
    // Keeping track of script loaded and error state
    const [state, setState] = useState({
        loaded: false,
        error: false,
    });

    useLayoutEffect(() => {
    // If cachedScripts array already includes src that means another instance ...
    // ... of this hook already loaded this script, so no need to load again.
        if (cachedScripts.includes(src)) {
            setState({
                loaded: true,
                error: false,
            });
            return () => { };
        }
        cachedScripts.push(src);

        // Create script
        const script = document.createElement('script');
        script.src = src;
        script.type = 'text/javascript';

        // Script event listener callbacks for load and error
        const onScriptLoad = () => {
            console.log("SCRIPT LOADED");
    window.AppleID.auth.init(config);
            setState({
                loaded: true,
                error: false,
            });
            window.AppleID.auth.renderButton();
        };

        const onScriptError = () => {
        // Remove from cachedScripts we can try loading again
        console.log("SCRIPT ERRORED")
            const index = cachedScripts.indexOf(src);
            if (index >= 0) { cachedScripts.splice(index, 1); }
            script.remove();

            setState({
                loaded: false,
                error: true,
            });
        };

        script.addEventListener('load', onScriptLoad);
        script.addEventListener('error', onScriptError);

        // Add script to document body
        document.body.appendChild(script);

        // Remove event listeners on cleanup
        return () => {
            script.removeEventListener('load', onScriptLoad);
            script.removeEventListener('error', onScriptError);
        };
    }, [src]); // Only re-run effect if script src changes

    return [state.loaded, state.error];
};

function DivOnly() {
 return <div id="appleid-signin" data-color="black" data-border="true" data-type="sign in"></div>;
}

function ScriptOnly() {
    const [loaded] = useScript(
        `https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/${'en_US'}/appleid.auth.js`,
    );

}

function AppleSignInScript({style = {}}) {
    return <><ScriptOnly/><DivOnly /></>;
}

export default AppleSignInScript;
