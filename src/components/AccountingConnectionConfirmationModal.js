"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var ConfirmModal_1 = require("./ConfirmModal");
function AccountingConnectionConfirmationModal(_a) {
    var integrationToConnect = _a.integrationToConnect, onCancel = _a.onCancel, onConfirm = _a.onConfirm;
    var translate = (0, useLocalize_1.default)().translate;
    return (<ConfirmModal_1.default title={translate('workspace.accounting.connectTitle', { connectionName: integrationToConnect })} isVisible onConfirm={onConfirm} onCancel={onCancel} prompt={translate('workspace.accounting.connectPrompt', { connectionName: integrationToConnect })} confirmText={translate('workspace.accounting.setup')} cancelText={translate('common.cancel')} success/>);
}
AccountingConnectionConfirmationModal.displayName = 'AccountingConnectionConfirmationModal';
exports.default = AccountingConnectionConfirmationModal;
