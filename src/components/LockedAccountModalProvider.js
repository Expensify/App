"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LockedAccountContext = void 0;
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ConfirmModal_1 = require("./ConfirmModal");
var LockedAccountContext = (0, react_1.createContext)({
    showLockedAccountModal: function () { },
    isAccountLocked: false,
});
exports.LockedAccountContext = LockedAccountContext;
function LockedAccountModalProvider(_a) {
    var _b;
    var children = _a.children;
    var translate = (0, useLocalize_1.default)().translate;
    var lockAccountDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PRIVATE_LOCK_ACCOUNT_DETAILS, { canBeMissing: true })[0];
    var isAccountLocked = (_b = lockAccountDetails === null || lockAccountDetails === void 0 ? void 0 : lockAccountDetails.isLocked) !== null && _b !== void 0 ? _b : false;
    var _c = (0, react_1.useState)(false), isModalOpen = _c[0], setIsModalOpen = _c[1];
    var contextValue = (0, react_1.useMemo)(function () { return ({
        isAccountLocked: isAccountLocked,
        showLockedAccountModal: function () { return setIsModalOpen(true); },
    }); }, [isAccountLocked]);
    return (<LockedAccountContext.Provider value={contextValue}>
            {children}
            <ConfirmModal_1.default isVisible={isModalOpen} onConfirm={function () { return setIsModalOpen(false); }} onCancel={function () { return setIsModalOpen(false); }} title={translate('lockedAccount.title')} prompt={translate('lockedAccount.description')} confirmText={translate('common.buttonConfirm')} shouldShowCancelButton={false}/>
        </LockedAccountContext.Provider>);
}
LockedAccountModalProvider.displayName = 'LockedAccountModal';
exports.default = LockedAccountModalProvider;
