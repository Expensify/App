"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var AttachmentCarouselPagerContext_1 = require("@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext");
var PDFView_1 = require("@components/PDFView");
function BaseAttachmentViewPdf(_a) {
    var file = _a.file, encryptedSourceUrl = _a.encryptedSourceUrl, isFocused = _a.isFocused, onPressProp = _a.onPress, onScaleChangedProp = _a.onScaleChanged, onToggleKeyboard = _a.onToggleKeyboard, onLoadComplete = _a.onLoadComplete, style = _a.style, isUsedAsChatAttachment = _a.isUsedAsChatAttachment, onLoadError = _a.onLoadError;
    var attachmentCarouselPagerContext = (0, react_1.useContext)(AttachmentCarouselPagerContext_1.default);
    var isScrollEnabled = attachmentCarouselPagerContext === null ? undefined : attachmentCarouselPagerContext.isScrollEnabled;
    (0, react_1.useEffect)(function () {
        var _a;
        if (!attachmentCarouselPagerContext) {
            return;
        }
        (_a = attachmentCarouselPagerContext.onScaleChanged) === null || _a === void 0 ? void 0 : _a.call(attachmentCarouselPagerContext, 1);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we just want to call this function when component is mounted
    }, []);
    /**
     * When the PDF's onScaleChanged event is triggered, we must call the context's onScaleChanged callback,
     * because we want to disable the pager scroll when the pdf is zoomed in,
     * as well as call the onScaleChanged prop of the AttachmentViewPdf component if defined.
     */
    var onScaleChanged = (0, react_1.useCallback)(function (newScale) {
        var _a;
        if (onScaleChangedProp !== undefined) {
            onScaleChangedProp(newScale);
        }
        // When a pdf is shown in a carousel, we want to disable the pager scroll when the pdf is zoomed in
        if (attachmentCarouselPagerContext === null || attachmentCarouselPagerContext === void 0 ? void 0 : attachmentCarouselPagerContext.pagerRef) {
            (_a = attachmentCarouselPagerContext.onScaleChanged) === null || _a === void 0 ? void 0 : _a.call(attachmentCarouselPagerContext, newScale);
        }
    }, [attachmentCarouselPagerContext, onScaleChangedProp]);
    /**
     * This callback is used to pass-through the onPress event from the AttachmentViewPdf's props
     * as well trigger the onTap event from the context.
     * The onTap event should only be triggered, if the pager is currently scrollable.
     * Otherwise it means that the PDF is currently zoomed in, therefore the onTap callback should be ignored
     */
    var onPress = (0, react_1.useCallback)(function (event) {
        var _a;
        if (onPressProp !== undefined) {
            onPressProp(event);
        }
        if (attachmentCarouselPagerContext !== null && (isScrollEnabled === null || isScrollEnabled === void 0 ? void 0 : isScrollEnabled.get())) {
            (_a = attachmentCarouselPagerContext.onTap) === null || _a === void 0 ? void 0 : _a.call(attachmentCarouselPagerContext);
        }
    }, [attachmentCarouselPagerContext, isScrollEnabled, onPressProp]);
    return (<PDFView_1.default onPress={onPress} isFocused={isFocused} sourceURL={encryptedSourceUrl} fileName={file === null || file === void 0 ? void 0 : file.name} style={style} onToggleKeyboard={onToggleKeyboard} onScaleChanged={onScaleChanged} onLoadComplete={onLoadComplete} isUsedAsChatAttachment={isUsedAsChatAttachment} onLoadError={onLoadError}/>);
}
BaseAttachmentViewPdf.displayName = 'BaseAttachmentViewPdf';
exports.default = (0, react_1.memo)(BaseAttachmentViewPdf);
