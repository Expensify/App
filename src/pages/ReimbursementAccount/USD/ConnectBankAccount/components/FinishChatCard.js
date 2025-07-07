"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Expensicons_1 = require("@components/Icon/Expensicons");
var Illustrations_1 = require("@components/Icon/Illustrations");
var MenuItem_1 = require("@components/MenuItem");
var ScrollView_1 = require("@components/ScrollView");
var Section_1 = require("@components/Section");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var WorkspaceResetBankAccountModal_1 = require("@pages/workspace/WorkspaceResetBankAccountModal");
var BankAccounts_1 = require("@userActions/BankAccounts");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var Enable2FACard_1 = require("./Enable2FACard");
function FinishChatCard(_a) {
    var _b, _c;
    var requiresTwoFactorAuth = _a.requiresTwoFactorAuth, reimbursementAccount = _a.reimbursementAccount, setUSDBankAccountStep = _a.setUSDBankAccountStep;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var policyID = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.policyID;
    var shouldShowResetModal = (_c = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.shouldShowResetModal) !== null && _c !== void 0 ? _c : false;
    var handleNavigateToConciergeChat = function () { var _a; return (0, Report_1.navigateToConciergeChat)(true, undefined, undefined, (_a = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _a === void 0 ? void 0 : _a.ACHRequestReportActionID); };
    return (<ScrollView_1.default style={[styles.flex1]}>
            <Section_1.default title={translate('workspace.bankAccount.letsFinishInChat')} icon={Illustrations_1.ConciergeBubble} containerStyles={[styles.mb8, styles.mh5]} titleStyles={[styles.mb3]}>
                <Text_1.default style={styles.mb6}>{translate('connectBankAccountStep.letsChatText')}</Text_1.default>
                <MenuItem_1.default icon={Expensicons_1.ChatBubble} title={translate('workspace.bankAccount.finishInChat')} onPress={handleNavigateToConciergeChat} outerWrapperStyle={shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8} shouldShowRightIcon/>
                <MenuItem_1.default icon={Expensicons_1.Pencil} title={translate('workspace.bankAccount.updateDetails')} onPress={function () {
            (0, BankAccounts_1.setBankAccountSubStep)(CONST_1.default.BANK_ACCOUNT.SETUP_TYPE.MANUAL).then(function () {
                setUSDBankAccountStep(CONST_1.default.BANK_ACCOUNT.STEP.REQUESTOR);
                (0, BankAccounts_1.goToWithdrawalAccountSetupStep)(CONST_1.default.BANK_ACCOUNT.STEP.REQUESTOR);
            });
        }} outerWrapperStyle={shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8} shouldShowRightIcon/>
                <MenuItem_1.default icon={Expensicons_1.RotateLeft} title={translate('workspace.bankAccount.startOver')} onPress={BankAccounts_1.requestResetBankAccount} outerWrapperStyle={shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8} shouldShowRightIcon/>
            </Section_1.default>
            {!requiresTwoFactorAuth && <Enable2FACard_1.default policyID={policyID}/>}
            {shouldShowResetModal && (<WorkspaceResetBankAccountModal_1.default reimbursementAccount={reimbursementAccount} isNonUSDWorkspace={false} setUSDBankAccountStep={setUSDBankAccountStep}/>)}
        </ScrollView_1.default>);
}
FinishChatCard.displayName = 'FinishChatCard';
exports.default = FinishChatCard;
