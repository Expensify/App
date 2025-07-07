"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Modal_1 = require("@components/Modal");
var Navigation_1 = require("@libs/Navigation/Navigation");
var AttachmentModalBaseContent_1 = require("@pages/media/AttachmentModalScreen/AttachmentModalBaseContent");
var AttachmentModalContext_1 = require("@pages/media/AttachmentModalScreen/AttachmentModalContext");
var CONST_1 = require("@src/CONST");
function AttachmentModalContainer(_a) {
    var contentProps = _a.contentProps, modalType = _a.modalType, onShow = _a.onShow, onClose = _a.onClose, shouldHandleNavigationBack = _a.shouldHandleNavigationBack;
    var _b = (0, react_1.useState)(true), isVisible = _b[0], setIsVisible = _b[1];
    var attachmentsContext = (0, react_1.useContext)(AttachmentModalContext_1.default);
    var _c = (0, react_1.useState)(false), shouldDisableAnimationAfterInitialMount = _c[0], setShouldDisableAnimationAfterInitialMount = _c[1];
    /**
     * Closes the modal.
     * @param {boolean} [shouldCallDirectly] If true, directly calls `onModalClose`.
     * This is useful when you plan to continue navigating to another page after closing the modal, to avoid freezing the app due to navigating to another page first and dismissing the modal later.
     * If `shouldCallDirectly` is false or undefined, it calls `attachmentModalHandler.handleModalClose` to close the modal.
     * This ensures smooth modal closing behavior without causing delays in closing.
     */
    var closeModal = (0, react_1.useCallback)(function (options) {
        attachmentsContext.setCurrentAttachment(undefined);
        setIsVisible(false);
        onClose === null || onClose === void 0 ? void 0 : onClose();
        Navigation_1.default.dismissModal();
        if (options === null || options === void 0 ? void 0 : options.onAfterClose) {
            options === null || options === void 0 ? void 0 : options.onAfterClose();
        }
    }, [attachmentsContext, onClose]);
    // After the modal has initially been mounted and animated in,
    // we don't want to show another animation when the modal type changes or
    // when the browser switches to narrow layout.
    (0, react_1.useEffect)(function () {
        react_native_1.InteractionManager.runAfterInteractions(function () {
            setShouldDisableAnimationAfterInitialMount(true);
        });
    }, []);
    (0, react_1.useEffect)(function () {
        onShow === null || onShow === void 0 ? void 0 : onShow();
    }, [onShow]);
    return (<Modal_1.default disableAnimationIn={shouldDisableAnimationAfterInitialMount} isVisible={isVisible} type={modalType !== null && modalType !== void 0 ? modalType : CONST_1.default.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE} propagateSwipe initialFocus={function () {
            var _a;
            if (!((_a = contentProps.submitRef) === null || _a === void 0 ? void 0 : _a.current)) {
                return false;
            }
            return contentProps.submitRef.current;
        }} shouldHandleNavigationBack={shouldHandleNavigationBack}>
            <AttachmentModalBaseContent_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...contentProps} shouldDisplayHelpButton={false} onClose={closeModal}/>
        </Modal_1.default>);
}
AttachmentModalContainer.displayName = 'AttachmentModalContainer';
exports.default = AttachmentModalContainer;
