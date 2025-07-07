"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var InteractiveStepSubHeader_1 = require("@components/InteractiveStepSubHeader");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useSubStep_1 = require("@hooks/useSubStep");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var BankAccounts_1 = require("@libs/actions/BankAccounts");
var PaymentMethods_1 = require("@libs/actions/PaymentMethods");
var Wallet_1 = require("@libs/actions/Wallet");
var Navigation_1 = require("@navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SetupMethod_1 = require("./SetupMethod");
var ConfirmationStep_1 = require("./substeps/ConfirmationStep");
var PlaidStep_1 = require("./substeps/PlaidStep");
var plaidSubsteps = [PlaidStep_1.default, ConfirmationStep_1.default];
function AddBankAccount() {
    var plaidData = (0, useOnyx_1.default)(ONYXKEYS_1.default.PLAID_DATA)[0];
    var personalBankAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_BANK_ACCOUNT)[0];
    var personalBankAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT)[0];
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var submit = (0, react_1.useCallback)(function () {
        var _a;
        var bankAccounts = (_a = plaidData === null || plaidData === void 0 ? void 0 : plaidData.bankAccounts) !== null && _a !== void 0 ? _a : [];
        var selectedPlaidBankAccount = bankAccounts.find(function (bankAccount) { return bankAccount.plaidAccountID === (personalBankAccountDraft === null || personalBankAccountDraft === void 0 ? void 0 : personalBankAccountDraft.plaidAccountID); });
        if (selectedPlaidBankAccount) {
            (0, BankAccounts_1.addPersonalBankAccount)(selectedPlaidBankAccount);
        }
    }, [personalBankAccountDraft === null || personalBankAccountDraft === void 0 ? void 0 : personalBankAccountDraft.plaidAccountID, plaidData === null || plaidData === void 0 ? void 0 : plaidData.bankAccounts]);
    var isSetupTypeChosen = (personalBankAccountDraft === null || personalBankAccountDraft === void 0 ? void 0 : personalBankAccountDraft.setupType) === CONST_1.default.BANK_ACCOUNT.SETUP_TYPE.PLAID;
    var _a = (0, useSubStep_1.default)({ bodyContent: plaidSubsteps, startFrom: 0, onFinished: submit }), SubStep = _a.componentToRender, isEditing = _a.isEditing, screenIndex = _a.screenIndex, nextScreen = _a.nextScreen, prevScreen = _a.prevScreen, moveTo = _a.moveTo;
    var exitFlow = function (shouldContinue) {
        var _a;
        if (shouldContinue === void 0) { shouldContinue = false; }
        var exitReportID = personalBankAccount === null || personalBankAccount === void 0 ? void 0 : personalBankAccount.exitReportID;
        var onSuccessFallbackRoute = (_a = personalBankAccount === null || personalBankAccount === void 0 ? void 0 : personalBankAccount.onSuccessFallbackRoute) !== null && _a !== void 0 ? _a : '';
        if (exitReportID) {
            Navigation_1.default.dismissModalWithReport({ reportID: exitReportID });
            return;
        }
        if (shouldContinue && onSuccessFallbackRoute) {
            (0, PaymentMethods_1.continueSetup)(onSuccessFallbackRoute);
            return;
        }
        Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_WALLET);
    };
    var handleBackButtonPress = function () {
        if (!isSetupTypeChosen) {
            exitFlow();
            return;
        }
        if (screenIndex === 0) {
            (0, BankAccounts_1.clearPersonalBankAccount)();
            (0, Wallet_1.updateCurrentStep)(null);
            Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_WALLET);
            return;
        }
        prevScreen();
    };
    return (<ScreenWrapper_1.default testID={AddBankAccount.displayName} includeSafeAreaPaddingBottom={false} shouldEnablePickerAvoiding={false} shouldShowOfflineIndicator>
            <HeaderWithBackButton_1.default shouldShowBackButton onBackButtonPress={handleBackButtonPress} title={translate('bankAccount.addBankAccount')}/>
            <react_native_1.View style={styles.flex1}>
                {isSetupTypeChosen ? (<>
                        <react_native_1.View style={[styles.ph5, styles.mb5, styles.mt3, { height: CONST_1.default.BANK_ACCOUNT.STEPS_HEADER_HEIGHT }]}>
                            <InteractiveStepSubHeader_1.default startStepIndex={0} stepNames={CONST_1.default.WALLET.STEP_NAMES}/>
                        </react_native_1.View>
                        <SubStep isEditing={isEditing} onNext={nextScreen} onMove={moveTo}/>
                    </>) : (<SetupMethod_1.default />)}
            </react_native_1.View>
        </ScreenWrapper_1.default>);
}
AddBankAccount.displayName = 'AddBankAccountPage';
exports.default = AddBankAccount;
