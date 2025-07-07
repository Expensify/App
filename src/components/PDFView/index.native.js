"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_pdf_1 = require("react-native-pdf");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var KeyboardAvoidingView_1 = require("@components/KeyboardAvoidingView");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var useKeyboardState_1 = require("@hooks/useKeyboardState");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var CONST_1 = require("@src/CONST");
var PDFPasswordForm_1 = require("./PDFPasswordForm");
/**
 * On the native layer, we use react-native-pdf/PDF to display PDFs. If a PDF is
 * password-protected we render a PDFPasswordForm to request a password
 * from the user.
 *
 * In order to render things nicely during a password challenge we need
 * to keep track of additional state. In particular, the
 * react-native-pdf/PDF component is both conditionally rendered and hidden
 * depending upon the situation. It needs to be rerendered on each password
 * submission because it doesn't dynamically handle updates to its
 * password property. And we need to hide it during password challenges
 * so that PDFPasswordForm doesn't bounce when react-native-pdf/PDF
 * is (temporarily) rendered.
 */
var LOADING_THUMBNAIL_HEIGHT = 250;
var LOADING_THUMBNAIL_WIDTH = 250;
function PDFView(_a) {
    var onToggleKeyboard = _a.onToggleKeyboard, onLoadComplete = _a.onLoadComplete, fileName = _a.fileName, onPress = _a.onPress, isFocused = _a.isFocused, onScaleChanged = _a.onScaleChanged, sourceURL = _a.sourceURL, onLoadError = _a.onLoadError, isUsedAsChatAttachment = _a.isUsedAsChatAttachment;
    var _b = (0, react_1.useState)(false), shouldRequestPassword = _b[0], setShouldRequestPassword = _b[1];
    var _c = (0, react_1.useState)(true), shouldAttemptPDFLoad = _c[0], setShouldAttemptPDFLoad = _c[1];
    var _d = (0, react_1.useState)(true), shouldShowLoadingIndicator = _d[0], setShouldShowLoadingIndicator = _d[1];
    var _e = (0, react_1.useState)(false), isPasswordInvalid = _e[0], setIsPasswordInvalid = _e[1];
    var _f = (0, react_1.useState)(false), failedToLoadPDF = _f[0], setFailedToLoadPDF = _f[1];
    var _g = (0, react_1.useState)(false), successToLoadPDF = _g[0], setSuccessToLoadPDF = _g[1];
    var _h = (0, react_1.useState)(''), password = _h[0], setPassword = _h[1];
    var _j = (0, useWindowDimensions_1.default)(), windowWidth = _j.windowWidth, windowHeight = _j.windowHeight;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var translate = (0, useLocalize_1.default)().translate;
    var themeStyles = (0, useThemeStyles_1.default)();
    var isKeyboardShown = (0, useKeyboardState_1.default)().isKeyboardShown;
    var StyleUtils = (0, useStyleUtils_1.default)();
    (0, react_1.useEffect)(function () {
        onToggleKeyboard === null || onToggleKeyboard === void 0 ? void 0 : onToggleKeyboard(isKeyboardShown);
    });
    /**
     * Initiate password challenge if message received from react-native-pdf/PDF
     * indicates that a password is required or invalid.
     *
     * For a password challenge the message is "Password required or incorrect password."
     * Note that the message doesn't specify whether the password is simply empty or
     * invalid.
     */
    var initiatePasswordChallenge = (0, react_1.useCallback)(function () {
        setShouldShowLoadingIndicator(false);
        // Render password form, and don't render PDF and loading indicator.
        setShouldRequestPassword(true);
        setShouldAttemptPDFLoad(false);
        // The message provided by react-native-pdf doesn't indicate whether this
        // is an initial password request or if the password is invalid. So we just assume
        // that if a password was already entered then it's an invalid password error.
        if (password) {
            setIsPasswordInvalid(true);
        }
    }, [password]);
    var handleFailureToLoadPDF = (function (error) {
        if (error.message.match(/password/i)) {
            initiatePasswordChallenge();
            return;
        }
        setFailedToLoadPDF(true);
        setShouldShowLoadingIndicator(false);
        setShouldRequestPassword(false);
        setShouldAttemptPDFLoad(false);
        onLoadError === null || onLoadError === void 0 ? void 0 : onLoadError();
        // eslint-disable-next-line @typescript-eslint/ban-types
    });
    /**
     * When the password is submitted via PDFPasswordForm, save the password
     * in state and attempt to load the PDF. Also show the loading indicator
     * since react-native-pdf/PDF will need to reload the PDF.
     *
     * @param pdfPassword Password submitted via PDFPasswordForm
     */
    var attemptPDFLoadWithPassword = function (pdfPassword) {
        // Render react-native-pdf/PDF so that it can validate the password.
        // Note that at this point in the password challenge, shouldRequestPassword is true.
        // Thus react-native-pdf/PDF will be rendered - but not visible.
        setPassword(pdfPassword);
        setShouldAttemptPDFLoad(true);
        setShouldShowLoadingIndicator(true);
    };
    /**
     * After the PDF is successfully loaded hide PDFPasswordForm and the loading
     * indicator.
     * @param numberOfPages
     * @param path - Path to cache location
     */
    var finishPDFLoad = function (numberOfPages, path) {
        setShouldRequestPassword(false);
        setShouldShowLoadingIndicator(false);
        setSuccessToLoadPDF(true);
        onLoadComplete(path);
    };
    function renderPDFView() {
        var pdfWidth = isUsedAsChatAttachment ? LOADING_THUMBNAIL_WIDTH : windowWidth;
        var pdfHeight = isUsedAsChatAttachment ? LOADING_THUMBNAIL_HEIGHT : windowHeight;
        var pdfStyles = [themeStyles.imageModalPDF, StyleUtils.getWidthAndHeightStyle(pdfWidth, pdfHeight)];
        // If we haven't yet successfully validated the password and loaded the PDF,
        // then we need to hide the react-native-pdf/PDF component so that PDFPasswordForm
        // is positioned nicely. We're specifically hiding it because we still need to render
        // the PDF component so that it can validate the password.
        if (shouldRequestPassword) {
            pdfStyles.push(themeStyles.invisible);
        }
        var containerStyles = 
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        isUsedAsChatAttachment || (shouldRequestPassword && shouldUseNarrowLayout) ? [themeStyles.w100, themeStyles.flex1] : [themeStyles.alignItemsCenter, themeStyles.flex1];
        var loadingIndicatorStyles = isUsedAsChatAttachment
            ? [themeStyles.chatItemPDFAttachmentLoading, StyleUtils.getWidthAndHeightStyle(LOADING_THUMBNAIL_WIDTH, LOADING_THUMBNAIL_HEIGHT)]
            : [];
        return (<react_native_1.View style={containerStyles}>
                {shouldAttemptPDFLoad && (<react_native_pdf_1.default fitPolicy={0} trustAllCerts={false} renderActivityIndicator={function () { return <FullscreenLoadingIndicator_1.default style={loadingIndicatorStyles}/>; }} source={{ uri: sourceURL, cache: true, expiration: 864000 }} style={pdfStyles} onError={handleFailureToLoadPDF} password={password} onLoadComplete={finishPDFLoad} onPageSingleTap={onPress} onScaleChanged={onScaleChanged}/>)}
                {shouldRequestPassword && (<KeyboardAvoidingView_1.default style={themeStyles.flex1}>
                        <PDFPasswordForm_1.default isFocused={!!isFocused} onSubmit={attemptPDFLoadWithPassword} onPasswordUpdated={function () { return setIsPasswordInvalid(false); }} isPasswordInvalid={isPasswordInvalid} shouldShowLoadingIndicator={shouldShowLoadingIndicator}/>
                    </KeyboardAvoidingView_1.default>)}
            </react_native_1.View>);
    }
    return onPress ? (<PressableWithoutFeedback_1.default onPress={onPress} fullDisabled={successToLoadPDF} style={[themeStyles.flex1, themeStyles.alignSelfStretch, !failedToLoadPDF && themeStyles.flexRow]} accessibilityRole={CONST_1.default.ROLE.BUTTON} 
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    accessibilityLabel={fileName || translate('attachmentView.unknownFilename')}>
            {renderPDFView()}
        </PressableWithoutFeedback_1.default>) : (renderPDFView());
}
PDFView.displayName = 'PDFView';
exports.default = PDFView;
