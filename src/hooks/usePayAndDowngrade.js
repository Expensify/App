"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Modal_1 = require("@libs/actions/Modal");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var useOnyx_1 = require("./useOnyx");
function usePayAndDowngrade(setIsDeleteModalOpen) {
    var isLoadingBill = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_BILL_WHEN_DOWNGRADE, { canBeMissing: true })[0];
    var shouldBillWhenDowngrading = (0, useOnyx_1.default)(ONYXKEYS_1.default.SHOULD_BILL_WHEN_DOWNGRADING, { canBeMissing: true })[0];
    var isDeletingPaidWorkspaceRef = (0, react_1.useRef)(false);
    var setIsDeletingPaidWorkspace = function (value) {
        isDeletingPaidWorkspaceRef.current = value;
    };
    (0, react_1.useEffect)(function () {
        if (!isDeletingPaidWorkspaceRef.current || isLoadingBill) {
            return;
        }
        if (!shouldBillWhenDowngrading) {
            (0, Modal_1.close)(function () { return setIsDeleteModalOpen(true); });
        }
        else {
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_PAY_AND_DOWNGRADE.getRoute(Navigation_1.default.getActiveRoute()));
        }
        isDeletingPaidWorkspaceRef.current = false;
    }, [isLoadingBill, shouldBillWhenDowngrading, setIsDeleteModalOpen]);
    return { setIsDeletingPaidWorkspace: setIsDeletingPaidWorkspace, isLoadingBill: isLoadingBill };
}
exports.default = usePayAndDowngrade;
