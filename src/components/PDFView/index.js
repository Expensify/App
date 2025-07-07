"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("core-js/features/array/at");
var react_1 = require("react");
var react_fast_pdf_1 = require("react-fast-pdf");
var react_native_1 = require("react-native");
var react_native_onyx_1 = require("react-native-onyx");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var useLocalize_1 = require("@hooks/useLocalize");
var usePrevious_1 = require("@hooks/usePrevious");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var variables_1 = require("@styles/variables");
var CanvasSize = require("@userActions/CanvasSize");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var PDFPasswordForm_1 = require("./PDFPasswordForm");
var LOADING_THUMBNAIL_HEIGHT = 250;
var LOADING_THUMBNAIL_WIDTH = 250;
function PDFView(_a) {
    var onToggleKeyboard = _a.onToggleKeyboard, fileName = _a.fileName, onPress = _a.onPress, isFocused = _a.isFocused, sourceURL = _a.sourceURL, maxCanvasArea = _a.maxCanvasArea, maxCanvasHeight = _a.maxCanvasHeight, maxCanvasWidth = _a.maxCanvasWidth, style = _a.style, isUsedAsChatAttachment = _a.isUsedAsChatAttachment, onLoadError = _a.onLoadError;
    var _b = (0, react_1.useState)(false), isKeyboardOpen = _b[0], setIsKeyboardOpen = _b[1];
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var windowHeight = (0, useWindowDimensions_1.default)().windowHeight;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var prevWindowHeight = (0, usePrevious_1.default)(windowHeight);
    var translate = (0, useLocalize_1.default)().translate;
    /**
     * On small screens notify parent that the keyboard has opened or closed.
     *
     * @param isKBOpen True if keyboard is open
     */
    var toggleKeyboardOnSmallScreens = (0, react_1.useCallback)(function (isKBOpen) {
        if (!shouldUseNarrowLayout) {
            return;
        }
        setIsKeyboardOpen(isKBOpen);
        onToggleKeyboard === null || onToggleKeyboard === void 0 ? void 0 : onToggleKeyboard(isKBOpen);
    }, [shouldUseNarrowLayout, onToggleKeyboard]);
    /**
     * Verify that the canvas limits have been calculated already, if not calculate them and put them in Onyx
     */
    var retrieveCanvasLimits = function () {
        if (!maxCanvasArea) {
            CanvasSize.retrieveMaxCanvasArea();
        }
        if (!maxCanvasHeight) {
            CanvasSize.retrieveMaxCanvasHeight();
        }
        if (!maxCanvasWidth) {
            CanvasSize.retrieveMaxCanvasWidth();
        }
    };
    (0, react_1.useEffect)(function () {
        retrieveCanvasLimits();
        // This rule needs to be applied so that this effect is executed only when the component is mounted
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    (0, react_1.useEffect)(function () {
        // Use window height changes to toggle the keyboard. To maintain keyboard state
        // on all platforms we also use focus/blur events. So we need to make sure here
        // that we avoid redundant keyboard toggling.
        // Minus 100px is needed to make sure that when the internet connection is
        // disabled in android chrome and a small 'No internet connection' text box appears,
        // we do not take it as a sign to open the keyboard
        if (!isKeyboardOpen && windowHeight < prevWindowHeight - 100) {
            toggleKeyboardOnSmallScreens(true);
        }
        else if (isKeyboardOpen && windowHeight > prevWindowHeight) {
            toggleKeyboardOnSmallScreens(false);
        }
    }, [isKeyboardOpen, prevWindowHeight, toggleKeyboardOnSmallScreens, windowHeight]);
    var renderPDFView = function () {
        var outerContainerStyle = [styles.w100, styles.h100, styles.justifyContentCenter, styles.alignItemsCenter];
        return (<react_native_1.View style={outerContainerStyle} tabIndex={0}>
                <react_fast_pdf_1.PDFPreviewer contentContainerStyle={style} file={sourceURL} pageMaxWidth={variables_1.default.pdfPageMaxWidth} isSmallScreen={shouldUseNarrowLayout} maxCanvasWidth={maxCanvasWidth} maxCanvasHeight={maxCanvasHeight} maxCanvasArea={maxCanvasArea} LoadingComponent={<FullscreenLoadingIndicator_1.default style={isUsedAsChatAttachment && [
                    styles.chatItemPDFAttachmentLoading,
                    StyleUtils.getWidthAndHeightStyle(LOADING_THUMBNAIL_WIDTH, LOADING_THUMBNAIL_HEIGHT),
                    styles.pRelative,
                ]}/>} shouldShowErrorComponent={false} onLoadError={onLoadError} renderPasswordForm={function (_a) {
                var isPasswordInvalid = _a.isPasswordInvalid, onSubmit = _a.onSubmit, onPasswordChange = _a.onPasswordChange;
                return (<PDFPasswordForm_1.default isFocused={!!isFocused} isPasswordInvalid={isPasswordInvalid} onSubmit={onSubmit} onPasswordUpdated={onPasswordChange}/>);
            }}/>
            </react_native_1.View>);
    };
    return onPress ? (<PressableWithoutFeedback_1.default onPress={onPress} style={[styles.flex1, styles.flexRow, styles.alignSelfStretch]} accessibilityRole={CONST_1.default.ROLE.BUTTON} 
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    accessibilityLabel={fileName || translate('attachmentView.unknownFilename')}>
            {renderPDFView()}
        </PressableWithoutFeedback_1.default>) : (renderPDFView());
}
exports.default = (0, react_native_onyx_1.withOnyx)({
    maxCanvasArea: {
        key: ONYXKEYS_1.default.MAX_CANVAS_AREA,
    },
    maxCanvasHeight: {
        key: ONYXKEYS_1.default.MAX_CANVAS_HEIGHT,
    },
    maxCanvasWidth: {
        key: ONYXKEYS_1.default.MAX_CANVAS_WIDTH,
    },
})((0, react_1.memo)(PDFView));
