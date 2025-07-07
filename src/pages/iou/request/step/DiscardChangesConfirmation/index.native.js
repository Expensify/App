"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConfirmModal_1 = require("@components/ConfirmModal");
var useBeforeRemove_1 = require("@hooks/useBeforeRemove");
var useLocalize_1 = require("@hooks/useLocalize");
var navigationRef_1 = require("@libs/Navigation/navigationRef");
function DiscardChangesConfirmation(_a) {
    var getHasUnsavedChanges = _a.getHasUnsavedChanges;
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, react_1.useState)(false), isVisible = _b[0], setIsVisible = _b[1];
    var blockedNavigationAction = (0, react_1.useRef)(undefined);
    (0, useBeforeRemove_1.default)((0, react_1.useCallback)(function (e) {
        if (!getHasUnsavedChanges()) {
            return;
        }
        e.preventDefault();
        blockedNavigationAction.current = e.data.action;
        setIsVisible(true);
    }, [getHasUnsavedChanges]));
    return (<ConfirmModal_1.default isVisible={isVisible} title={translate('discardChangesConfirmation.title')} prompt={translate('discardChangesConfirmation.body')} danger confirmText={translate('discardChangesConfirmation.confirmText')} cancelText={translate('common.cancel')} onConfirm={function () {
            var _a;
            setIsVisible(false);
            if (blockedNavigationAction.current) {
                (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.dispatch(blockedNavigationAction.current);
            }
        }} onCancel={function () { return setIsVisible(false); }} shouldHandleNavigationBack/>);
}
exports.default = (0, react_1.memo)(DiscardChangesConfirmation);
