"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var ConfirmModal_1 = require("./ConfirmModal");
function SupportalActionRestrictedModal(_a) {
    var isModalOpen = _a.isModalOpen, hideSupportalModal = _a.hideSupportalModal;
    var translate = (0, useLocalize_1.default)().translate;
    return (<ConfirmModal_1.default title={translate('supportalNoAccess.title')} isVisible={isModalOpen} onConfirm={hideSupportalModal} prompt={translate('supportalNoAccess.description')} confirmText={translate('common.buttonConfirm')} shouldShowCancelButton={false}/>);
}
SupportalActionRestrictedModal.displayName = 'SupportalActionRestrictedModal';
exports.default = SupportalActionRestrictedModal;
