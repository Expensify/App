"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var ConfirmContent_1 = require("./ConfirmContent");
var Modal_1 = require("./Modal");
function ConfirmModal(_a) {
    var _b = _a.confirmText, confirmText = _b === void 0 ? '' : _b, _c = _a.cancelText, cancelText = _c === void 0 ? '' : _c, _d = _a.prompt, prompt = _d === void 0 ? '' : _d, _e = _a.success, success = _e === void 0 ? true : _e, _f = _a.danger, danger = _f === void 0 ? false : _f, _g = _a.onCancel, onCancel = _g === void 0 ? function () { } : _g, onBackdropPress = _a.onBackdropPress, _h = _a.shouldDisableConfirmButtonWhenOffline, shouldDisableConfirmButtonWhenOffline = _h === void 0 ? false : _h, _j = _a.shouldShowCancelButton, shouldShowCancelButton = _j === void 0 ? true : _j, _k = _a.shouldSetModalVisibility, shouldSetModalVisibility = _k === void 0 ? true : _k, _l = _a.title, title = _l === void 0 ? '' : _l, iconSource = _a.iconSource, _m = _a.onModalHide, onModalHide = _m === void 0 ? function () { } : _m, titleStyles = _a.titleStyles, iconAdditionalStyles = _a.iconAdditionalStyles, promptStyles = _a.promptStyles, _o = _a.shouldCenterContent, shouldCenterContent = _o === void 0 ? false : _o, _p = _a.shouldStackButtons, shouldStackButtons = _p === void 0 ? true : _p, isVisible = _a.isVisible, onConfirm = _a.onConfirm, image = _a.image, imageStyles = _a.imageStyles, iconWidth = _a.iconWidth, iconHeight = _a.iconHeight, iconFill = _a.iconFill, shouldCenterIcon = _a.shouldCenterIcon, shouldShowDismissIcon = _a.shouldShowDismissIcon, titleContainerStyles = _a.titleContainerStyles, shouldReverseStackedButtons = _a.shouldReverseStackedButtons, shouldEnableNewFocusManagement = _a.shouldEnableNewFocusManagement, restoreFocusType = _a.restoreFocusType, isConfirmLoading = _a.isConfirmLoading, shouldHandleNavigationBack = _a.shouldHandleNavigationBack;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use the correct modal type
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    var styles = (0, useThemeStyles_1.default)();
    return (<Modal_1.default onClose={onCancel} onBackdropPress={onBackdropPress} isVisible={isVisible} shouldSetModalVisibility={shouldSetModalVisibility} onModalHide={onModalHide} type={isSmallScreenWidth ? CONST_1.default.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST_1.default.MODAL.MODAL_TYPE.CONFIRM} innerContainerStyle={styles.pv0} shouldEnableNewFocusManagement={shouldEnableNewFocusManagement} restoreFocusType={restoreFocusType} shouldHandleNavigationBack={shouldHandleNavigationBack}>
            <ConfirmContent_1.default title={title} 
    /* Disable onConfirm function if the modal is being dismissed, otherwise the confirmation
function can be triggered multiple times if the user clicks on the button multiple times. */
    onConfirm={function () { return (isVisible ? onConfirm() : null); }} onCancel={onCancel} confirmText={confirmText} cancelText={cancelText} prompt={prompt} success={success} danger={danger} isVisible={isVisible} shouldDisableConfirmButtonWhenOffline={shouldDisableConfirmButtonWhenOffline} shouldShowCancelButton={shouldShowCancelButton} shouldCenterContent={shouldCenterContent} iconSource={iconSource} contentStyles={isSmallScreenWidth && shouldShowDismissIcon ? styles.mt2 : undefined} iconFill={iconFill} iconHeight={iconHeight} iconWidth={iconWidth} shouldCenterIcon={shouldCenterIcon} shouldShowDismissIcon={shouldShowDismissIcon} titleContainerStyles={titleContainerStyles} iconAdditionalStyles={iconAdditionalStyles} titleStyles={titleStyles} promptStyles={promptStyles} shouldStackButtons={shouldStackButtons} shouldReverseStackedButtons={shouldReverseStackedButtons} image={image} imageStyles={imageStyles} isConfirmLoading={isConfirmLoading}/>
        </Modal_1.default>);
}
ConfirmModal.displayName = 'ConfirmModal';
exports.default = ConfirmModal;
