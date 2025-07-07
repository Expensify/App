"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConfirmModal_1 = require("@components/ConfirmModal");
var useLocalize_1 = require("@hooks/useLocalize");
function BaseUpdateAppModal(_a) {
    var onSubmit = _a.onSubmit;
    var _b = (0, react_1.useState)(true), isModalOpen = _b[0], setIsModalOpen = _b[1];
    var translate = (0, useLocalize_1.default)().translate;
    /**
     * Execute the onSubmit callback and close the modal.
     */
    var submitAndClose = function () {
        onSubmit === null || onSubmit === void 0 ? void 0 : onSubmit();
        setIsModalOpen(false);
    };
    return (<ConfirmModal_1.default title={translate('baseUpdateAppModal.updateApp')} isVisible={isModalOpen} onConfirm={submitAndClose} onCancel={function () { return setIsModalOpen(false); }} prompt={translate('baseUpdateAppModal.updatePrompt')} confirmText={translate('baseUpdateAppModal.updateApp')} cancelText={translate('common.cancel')}/>);
}
BaseUpdateAppModal.displayName = 'BaseUpdateAppModal';
exports.default = react_1.default.memo(BaseUpdateAppModal);
