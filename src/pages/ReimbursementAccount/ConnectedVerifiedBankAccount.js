"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var BankIcons_1 = require("@components/Icon/BankIcons");
var Expensicons_1 = require("@components/Icon/Expensicons");
var Illustrations_1 = require("@components/Icon/Illustrations");
var MenuItem_1 = require("@components/MenuItem");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Section_1 = require("@components/Section");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var WorkspaceResetBankAccountModal_1 = require("@pages/workspace/WorkspaceResetBankAccountModal");
var ReimbursementAccount_1 = require("@userActions/ReimbursementAccount");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function ConnectedVerifiedBankAccount(_a) {
    var _b, _c, _d, _e, _f, _g;
    var reimbursementAccount = _a.reimbursementAccount, onBackButtonPress = _a.onBackButtonPress, setShouldShowConnectedVerifiedBankAccount = _a.setShouldShowConnectedVerifiedBankAccount, setUSDBankAccountStep = _a.setUSDBankAccountStep, setNonUSDBankAccountStep = _a.setNonUSDBankAccountStep, isNonUSDWorkspace = _a.isNonUSDWorkspace;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var _h = (0, BankIcons_1.default)({ bankName: (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.bankName, styles: styles }), icon = _h.icon, iconSize = _h.iconSize, iconStyles = _h.iconStyles;
    var formattedBankAccountNumber = ((_c = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _c === void 0 ? void 0 : _c.accountNumber)
        ? "".concat(translate('bankAccount.accountEnding'), " ").concat((_d = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _d === void 0 ? void 0 : _d.accountNumber.slice(-4))
        : '';
    var bankAccountOwnerName = (_e = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _e === void 0 ? void 0 : _e.addressName;
    var errors = (_f = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.errors) !== null && _f !== void 0 ? _f : {};
    var pendingAction = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.pendingAction;
    var shouldShowResetModal = (_g = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.shouldShowResetModal) !== null && _g !== void 0 ? _g : false;
    return (<ScreenWrapper_1.default testID={ConnectedVerifiedBankAccount.displayName} includeSafeAreaPaddingBottom={false} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight style={[styles.flex1, styles.justifyContentBetween, styles.mh2]}>
            <HeaderWithBackButton_1.default title={translate('workspace.common.connectBankAccount')} onBackButtonPress={onBackButtonPress}/>
            <ScrollView_1.default style={[styles.flex1]}>
                <Section_1.default title={translate('workspace.bankAccount.allSet')} icon={Illustrations_1.ThumbsUpStars}>
                    <OfflineWithFeedback_1.default pendingAction={pendingAction} errors={errors} shouldShowErrorMessages onClose={ReimbursementAccount_1.resetReimbursementAccount}>
                        <MenuItem_1.default title={bankAccountOwnerName} description={formattedBankAccountNumber} icon={icon} iconStyles={iconStyles} iconWidth={iconSize} iconHeight={iconSize} interactive={false} displayInDefaultIconColor wrapperStyle={[styles.ph0, styles.mv3, styles.h13]}/>
                        <Text_1.default style={[styles.mv3]}>{translate('workspace.bankAccount.accountDescriptionWithCards')}</Text_1.default>
                        <MenuItem_1.default title={translate('workspace.bankAccount.disconnectBankAccount')} icon={Expensicons_1.Close} onPress={ReimbursementAccount_1.requestResetBankAccount} outerWrapperStyle={shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8} disabled={!!pendingAction || !(0, EmptyObject_1.isEmptyObject)(errors)}/>
                    </OfflineWithFeedback_1.default>
                </Section_1.default>
            </ScrollView_1.default>
            {shouldShowResetModal && (<WorkspaceResetBankAccountModal_1.default reimbursementAccount={reimbursementAccount} isNonUSDWorkspace={isNonUSDWorkspace} setShouldShowConnectedVerifiedBankAccount={setShouldShowConnectedVerifiedBankAccount} setUSDBankAccountStep={setUSDBankAccountStep} setNonUSDBankAccountStep={setNonUSDBankAccountStep}/>)}
        </ScreenWrapper_1.default>);
}
ConnectedVerifiedBankAccount.displayName = 'ConnectedVerifiedBankAccount';
exports.default = ConnectedVerifiedBankAccount;
