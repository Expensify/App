"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var BaseOnfidoWeb_1 = require("./BaseOnfidoWeb");
function Onfido(_a) {
    var sdkToken = _a.sdkToken, onSuccess = _a.onSuccess, onError = _a.onError, onUserExit = _a.onUserExit;
    var baseOnfidoRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        var _a;
        var onfidoOut = (_a = baseOnfidoRef.current) === null || _a === void 0 ? void 0 : _a.onfidoOut;
        var observer = new MutationObserver(function () {
            var fidoRef = baseOnfidoRef.current;
            /** This condition is needed because we are using external embedded content and they are
             * causing two scrollbars to be displayed which make it difficult to accept the consent for
             * the processing of biometric data and sensitive data we are resizing the first iframe so
             * that this problem no longer occurs.
             */
            if (fidoRef) {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                var onfidoSdk = fidoRef.querySelector('#onfido-sdk > iframe');
                if (onfidoSdk) {
                    var viewportHeight = window.innerHeight; // Get the viewport height
                    var desiredHeight = viewportHeight * 0.8;
                    onfidoSdk.style.height = "".concat(desiredHeight, "px");
                }
            }
        });
        if (baseOnfidoRef.current) {
            observer.observe(baseOnfidoRef.current, { attributes: false, childList: true, subtree: true });
        }
        if (!onfidoOut) {
            return;
        }
        onfidoOut.tearDown();
        // Clean up function to remove the observer when component unmounts
        return function () {
            observer.disconnect();
        };
    }, []);
    (0, react_1.useEffect)(function () { }, []);
    return (<BaseOnfidoWeb_1.default ref={baseOnfidoRef} sdkToken={sdkToken} onSuccess={onSuccess} onError={onError} onUserExit={onUserExit}/>);
}
Onfido.displayName = 'Onfido';
exports.default = Onfido;
