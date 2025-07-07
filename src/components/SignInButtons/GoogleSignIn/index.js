"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Session = require("@userActions/Session");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
/** Div IDs for styling the two different Google Sign-In buttons. */
var mainId = 'google-sign-in-main';
var desktopId = 'google-sign-in-desktop';
var signIn = function (response) {
    Session.beginGoogleSignIn(response.credential);
};
/**
 * Google Sign In button for Web.
 * We have to load the gis script and then determine if the page is focused before rendering the button.
 * @returns {React.Component}
 */
function GoogleSignIn(_a) {
    var _b = _a.isDesktopFlow, isDesktopFlow = _b === void 0 ? false : _b, onPointerDown = _a.onPointerDown;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var loadScript = (0, react_1.useCallback)(function () {
        var google = window.google;
        if (google) {
            google.accounts.id.initialize({
                // eslint-disable-next-line @typescript-eslint/naming-convention
                client_id: CONFIG_1.default.GOOGLE_SIGN_IN.WEB_CLIENT_ID,
                callback: signIn,
            });
            // Apply styles for each button
            google.accounts.id.renderButton(document.getElementById(mainId), {
                theme: 'outline',
                size: 'large',
                type: 'icon',
                shape: 'circle',
            });
            google.accounts.id.renderButton(document.getElementById(desktopId), {
                theme: 'outline',
                size: 'large',
                type: 'standard',
                shape: 'pill',
                width: '300px',
            });
        }
    }, []);
    react_1.default.useEffect(function () {
        var script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.addEventListener('load', loadScript);
        script.async = true;
        document.body.appendChild(script);
        return function () {
            script.removeEventListener('load', loadScript);
            document.body.removeChild(script);
        };
    }, [loadScript]);
    // willChangeTransform is used to prevent the icon cut in safari when the overflow hidden and width given to the parent
    // ref: https://stackoverflow.com/questions/75306089/safari-when-using-border-radius-and-overflow-hidden-to-parent-and-the-child-th
    return isDesktopFlow ? (<react_native_1.View style={styles.googlePillButtonContainer}>
            <div id={desktopId} role={CONST_1.default.ROLE.BUTTON} aria-label={translate('common.signInWithGoogle')} onPointerDown={onPointerDown}/>
        </react_native_1.View>) : (<react_native_1.View style={[styles.googleButtonContainer, styles.willChangeTransform]}>
            <div id={mainId} role={CONST_1.default.ROLE.BUTTON} aria-label={translate('common.signInWithGoogle')} onPointerDown={onPointerDown}/>
        </react_native_1.View>);
}
GoogleSignIn.displayName = 'GoogleSignIn';
exports.default = GoogleSignIn;
