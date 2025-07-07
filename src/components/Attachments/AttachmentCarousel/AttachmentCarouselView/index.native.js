"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var CarouselButtons_1 = require("@components/Attachments/AttachmentCarousel/CarouselButtons");
var Pager_1 = require("@components/Attachments/AttachmentCarousel/Pager");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var Illustrations = require("@components/Icon/Illustrations");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var variables_1 = require("@styles/variables");
function AttachmentCarouselView(_a) {
    var page = _a.page, attachments = _a.attachments, shouldShowArrows = _a.shouldShowArrows, source = _a.source, report = _a.report, autoHideArrows = _a.autoHideArrows, cancelAutoHideArrow = _a.cancelAutoHideArrow, setShouldShowArrows = _a.setShouldShowArrows, onAttachmentError = _a.onAttachmentError, onNavigate = _a.onNavigate, onClose = _a.onClose, setPage = _a.setPage, attachmentID = _a.attachmentID;
    var translate = (0, useLocalize_1.default)().translate;
    var canUseTouchScreen = (0, DeviceCapabilities_1.canUseTouchScreen)();
    var styles = (0, useThemeStyles_1.default)();
    var _b = (0, react_1.useState)(attachmentID !== null && attachmentID !== void 0 ? attachmentID : source), activeAttachmentID = _b[0], setActiveAttachmentID = _b[1];
    var pagerRef = (0, react_1.useRef)(null);
    /** Updates the page state when the user navigates between attachments */
    var updatePage = (0, react_1.useCallback)(function (newPageIndex) {
        var _a;
        react_native_1.Keyboard.dismiss();
        setShouldShowArrows(true);
        var item = attachments.at(newPageIndex);
        setPage(newPageIndex);
        if (newPageIndex >= 0 && item) {
            setActiveAttachmentID((_a = item.attachmentID) !== null && _a !== void 0 ? _a : item.source);
            if (onNavigate) {
                onNavigate(item);
            }
            onNavigate === null || onNavigate === void 0 ? void 0 : onNavigate(item);
        }
    }, [setShouldShowArrows, attachments, setPage, onNavigate]);
    /**
     * Increments or decrements the index to get another selected item
     * @param {Number} deltaSlide
     */
    var cycleThroughAttachments = (0, react_1.useCallback)(function (deltaSlide) {
        var _a;
        if (page === undefined) {
            return;
        }
        var nextPageIndex = page + deltaSlide;
        updatePage(nextPageIndex);
        (_a = pagerRef.current) === null || _a === void 0 ? void 0 : _a.setPage(nextPageIndex);
        autoHideArrows();
    }, [autoHideArrows, page, updatePage]);
    return (<react_native_1.View style={[styles.flex1, styles.attachmentCarouselContainer]} onMouseEnter={function () { return !canUseTouchScreen && setShouldShowArrows(true); }} onMouseLeave={function () { return !canUseTouchScreen && setShouldShowArrows(false); }}>
            {page === -1 ? (<BlockingView_1.default icon={Illustrations.ToddBehindCloud} iconWidth={variables_1.default.modalTopIconWidth} iconHeight={variables_1.default.modalTopIconHeight} title={translate('notFound.notHere')}/>) : (<>
                    <CarouselButtons_1.default page={page} attachments={attachments} shouldShowArrows={shouldShowArrows} onBack={function () { return cycleThroughAttachments(-1); }} onForward={function () { return cycleThroughAttachments(1); }} autoHideArrow={autoHideArrows} cancelAutoHideArrow={cancelAutoHideArrow}/>
                    <Pager_1.default items={attachments} initialPage={page} onAttachmentError={onAttachmentError} activeAttachmentID={activeAttachmentID} setShouldShowArrows={setShouldShowArrows} onPageSelected={function (_a) {
            var newPage = _a.nativeEvent.position;
            return updatePage(newPage);
        }} onClose={onClose} ref={pagerRef} reportID={report === null || report === void 0 ? void 0 : report.reportID}/>
                </>)}
        </react_native_1.View>);
}
AttachmentCarouselView.displayName = 'AttachmentCarouselView';
exports.default = AttachmentCarouselView;
