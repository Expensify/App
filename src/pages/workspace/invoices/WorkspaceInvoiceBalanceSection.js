"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var Section_1 = require("@components/Section");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CurrencyUtils = require("@libs/CurrencyUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function WorkspaceInvoiceBalanceSection(_a) {
    var _b, _c, _d;
    var policyID = _a.policyID;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID))[0];
    return (<Section_1.default title={translate('workspace.invoices.invoiceBalance')} subtitle={translate('workspace.invoices.invoiceBalanceSubtitle')} isCentralPane titleStyles={styles.accountSettingsSectionTitle} childrenStyles={styles.pt5} subtitleMuted>
            <MenuItemWithTopDescription_1.default description={translate('walletPage.balance')} title={CurrencyUtils.convertToDisplayString((_d = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.invoice) === null || _b === void 0 ? void 0 : _b.bankAccount) === null || _c === void 0 ? void 0 : _c.stripeConnectAccountBalance) !== null && _d !== void 0 ? _d : 0, policy === null || policy === void 0 ? void 0 : policy.outputCurrency)} titleStyle={styles.textHeadlineH2} interactive={false} wrapperStyle={styles.sectionMenuItemTopDescription}/>
        </Section_1.default>);
}
exports.default = WorkspaceInvoiceBalanceSection;
