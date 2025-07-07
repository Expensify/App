"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var OnyxProvider_1 = require("@components/OnyxProvider");
var Session_1 = require("@libs/actions/Session");
var AttachmentImageReauthenticator_1 = require("@libs/actions/Session/AttachmentImageReauthenticator");
var CONST_1 = require("@src/CONST");
var BaseImage_1 = require("./BaseImage");
var ImageBehaviorContextProvider_1 = require("./ImageBehaviorContextProvider");
function Image(_a) {
    var propsSource = _a.source, _b = _a.isAuthTokenRequired, isAuthTokenRequired = _b === void 0 ? false : _b, onLoad = _a.onLoad, _c = _a.objectPosition, objectPosition = _c === void 0 ? CONST_1.default.IMAGE_OBJECT_POSITION.INITIAL : _c, style = _a.style, loadingIconSize = _a.loadingIconSize, loadingIndicatorStyles = _a.loadingIndicatorStyles, forwardedProps = __rest(_a, ["source", "isAuthTokenRequired", "onLoad", "objectPosition", "style", "loadingIconSize", "loadingIndicatorStyles"]);
    var _d = (0, react_1.useState)(null), aspectRatio = _d[0], setAspectRatio = _d[1];
    var isObjectPositionTop = objectPosition === CONST_1.default.IMAGE_OBJECT_POSITION.TOP;
    var session = (0, OnyxProvider_1.useSession)();
    var shouldSetAspectRatioInStyle = (0, react_1.useContext)(ImageBehaviorContextProvider_1.ImageBehaviorContext).shouldSetAspectRatioInStyle;
    var updateAspectRatio = (0, react_1.useCallback)(function (width, height) {
        if (!isObjectPositionTop) {
            return;
        }
        if (width > height) {
            setAspectRatio(1);
            return;
        }
        setAspectRatio(height ? width / height : 'auto');
    }, [isObjectPositionTop]);
    var handleLoad = (0, react_1.useCallback)(function (event) {
        var _a = event.nativeEvent, width = _a.width, height = _a.height;
        onLoad === null || onLoad === void 0 ? void 0 : onLoad(event);
        updateAspectRatio(width, height);
    }, [onLoad, updateAspectRatio]);
    // accepted sessions are sessions of a certain criteria that we think can necessitate a reload of the images
    // because images sources barely changes unless specific events occur like network issues (offline/online) per example.
    // Here we target new session received less than 60s after the previous session (that could be from fresh reauthentication, the previous session was not necessarily expired)
    // or new session after the previous session was expired (based on timestamp gap between the 2 creationDate and the freshness of the new session).
    var isAcceptedSession = (0, react_1.useCallback)(function (sessionCreationDateDiff, sessionCreationDate) {
        return sessionCreationDateDiff < 60000 || (sessionCreationDateDiff >= CONST_1.default.SESSION_EXPIRATION_TIME_MS && new Date().getTime() - sessionCreationDate < 60000);
    }, []);
    /**
     * trying to figure out if the current session is expired or fresh from a necessary reauthentication
     */
    var previousSessionAge = (0, react_1.useRef)(undefined);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    var validSessionAge = (0, react_1.useMemo)(function () {
        // Authentication is required only for certain types of images (attachments and receipts),
        // so we only calculate the session age for those
        if (!isAuthTokenRequired) {
            return undefined;
        }
        if (session === null || session === void 0 ? void 0 : session.creationDate) {
            if (previousSessionAge.current) {
                // Most likely a reauthentication happened, but unless the calculated source is different from the previous, the image won't reload
                if (isAcceptedSession(session.creationDate - previousSessionAge.current, session.creationDate)) {
                    return session.creationDate;
                }
                return previousSessionAge.current;
            }
            if ((0, Session_1.isExpiredSession)(session.creationDate)) {
                // reset the countdown to now so future sessions creationDate can be compared to that time
                return new Date().getTime();
            }
            return session.creationDate;
        }
        return undefined;
    }, [session, isAuthTokenRequired, isAcceptedSession]);
    (0, react_1.useEffect)(function () {
        if (!isAuthTokenRequired) {
            return;
        }
        previousSessionAge.current = validSessionAge;
    });
    /**
     * Check if the image source is a URL - if so the `encryptedAuthToken` is appended
     * to the source.
     */
    var source = (0, react_1.useMemo)(function () {
        var _a;
        var _b;
        if (typeof propsSource === 'object' && 'uri' in propsSource) {
            if (typeof propsSource.uri === 'number') {
                return propsSource.uri;
            }
            var authToken = (_b = session === null || session === void 0 ? void 0 : session.encryptedAuthToken) !== null && _b !== void 0 ? _b : null;
            if (isAuthTokenRequired && authToken) {
                if (!!(session === null || session === void 0 ? void 0 : session.creationDate) && !(0, Session_1.isExpiredSession)(session.creationDate)) {
                    return __assign(__assign({}, propsSource), { headers: (_a = {},
                            _a[CONST_1.default.CHAT_ATTACHMENT_TOKEN_KEY] = authToken,
                            _a) });
                }
                if (session) {
                    (0, AttachmentImageReauthenticator_1.default)(session);
                }
                return undefined;
            }
        }
        return propsSource;
        // The session prop is not required, as it causes the image to reload whenever the session changes. For more information, please refer to issue #26034.
        // but we still need the image to reload sometimes (example : when the current session is expired)
        // by forcing a recalculation of the source (which value could indeed change) through the modification of the variable validSessionAge
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [propsSource, isAuthTokenRequired, validSessionAge]);
    (0, react_1.useEffect)(function () {
        var _a;
        if (!isAuthTokenRequired || source !== undefined) {
            return;
        }
        (_a = forwardedProps === null || forwardedProps === void 0 ? void 0 : forwardedProps.waitForSession) === null || _a === void 0 ? void 0 : _a.call(forwardedProps);
    }, [source, isAuthTokenRequired, forwardedProps]);
    /**
     * If the image fails to load and the object position is top, we should hide the image by setting the opacity to 0.
     */
    var shouldOpacityBeZero = isObjectPositionTop && !aspectRatio;
    if (source === undefined && !!(forwardedProps === null || forwardedProps === void 0 ? void 0 : forwardedProps.waitForSession)) {
        return undefined;
    }
    if (source === undefined) {
        return (<FullscreenLoadingIndicator_1.default iconSize={loadingIconSize} style={loadingIndicatorStyles}/>);
    }
    return (<BaseImage_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...forwardedProps} onLoad={handleLoad} style={[style, shouldSetAspectRatioInStyle && aspectRatio ? { aspectRatio: aspectRatio, height: 'auto' } : {}, shouldOpacityBeZero && { opacity: 0 }]} source={source}/>);
}
function imagePropsAreEqual(prevProps, nextProps) {
    return prevProps.source === nextProps.source;
}
var ImageWithOnyx = react_1.default.memo(Image, imagePropsAreEqual);
ImageWithOnyx.displayName = 'Image';
exports.default = ImageWithOnyx;
