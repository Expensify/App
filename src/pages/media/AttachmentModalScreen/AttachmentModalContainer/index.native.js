"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var AttachmentModalHandler_1 = require("@libs/AttachmentModalHandler");
var Navigation_1 = require("@libs/Navigation/Navigation");
var AttachmentModalBaseContent_1 = require("@pages/media/AttachmentModalScreen/AttachmentModalBaseContent");
var AttachmentModalContext_1 = require("@pages/media/AttachmentModalScreen/AttachmentModalContext");
function AttachmentModalContainer(_a) {
    var _b, _c;
    var contentProps = _a.contentProps, navigation = _a.navigation, onShow = _a.onShow, onClose = _a.onClose;
    var attachmentsContext = (0, react_1.useContext)(AttachmentModalContext_1.default);
    var testID = typeof contentProps.source === 'string' ? contentProps.source : ((_c = (_b = contentProps.source) === null || _b === void 0 ? void 0 : _b.toString()) !== null && _c !== void 0 ? _c : '');
    var closeScreen = (0, react_1.useCallback)(function (options) {
        attachmentsContext.setCurrentAttachment(undefined);
        var close = function () {
            var _a;
            onClose === null || onClose === void 0 ? void 0 : onClose();
            Navigation_1.default.goBack();
            (_a = options === null || options === void 0 ? void 0 : options.onAfterClose) === null || _a === void 0 ? void 0 : _a.call(options);
        };
        if (options === null || options === void 0 ? void 0 : options.shouldCallDirectly) {
            close();
        }
        else {
            AttachmentModalHandler_1.default.handleModalClose(close);
        }
    }, [attachmentsContext, onClose]);
    (0, react_1.useEffect)(function () {
        onShow === null || onShow === void 0 ? void 0 : onShow();
    }, [onShow]);
    return (<ScreenWrapper_1.default navigation={navigation} testID={"attachment-modal-".concat(testID)}>
            <AttachmentModalBaseContent_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...contentProps} onClose={closeScreen}/>
        </ScreenWrapper_1.default>);
}
AttachmentModalContainer.displayName = 'AttachmentModalContainer';
exports.default = (0, react_1.memo)(AttachmentModalContainer);
