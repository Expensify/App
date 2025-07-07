"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var FormAlertWithSubmitButton_1 = require("@components/FormAlertWithSubmitButton");
var Text_1 = require("@components/Text");
var useKeyboardState_1 = require("@hooks/useKeyboardState");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Session_1 = require("@userActions/Session");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ChangeExpensifyLoginLink_1 = require("./ChangeExpensifyLoginLink");
var Terms_1 = require("./Terms");
function SMSDeliveryFailurePage() {
    var _a, _b, _c;
    var styles = (0, useThemeStyles_1.default)();
    var isKeyboardShown = (0, useKeyboardState_1.default)().isKeyboardShown;
    var translate = (0, useLocalize_1.default)().translate;
    var credentials = (0, useOnyx_1.default)(ONYXKEYS_1.default.CREDENTIALS, { canBeMissing: true })[0];
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var login = (0, react_1.useMemo)(function () {
        if (!(credentials === null || credentials === void 0 ? void 0 : credentials.login)) {
            return '';
        }
        return expensify_common_1.Str.isSMSLogin(credentials.login) ? expensify_common_1.Str.removeSMSDomain(credentials.login) : credentials.login;
    }, [credentials === null || credentials === void 0 ? void 0 : credentials.login]);
    var SMSDeliveryFailureMessage = (_a = account === null || account === void 0 ? void 0 : account.smsDeliveryFailureStatus) === null || _a === void 0 ? void 0 : _a.message;
    var isResettingSMSDeliveryFailureStatus = (_b = account === null || account === void 0 ? void 0 : account.smsDeliveryFailureStatus) === null || _b === void 0 ? void 0 : _b.isLoading;
    var timeData = (0, react_1.useMemo)(function () {
        if (!SMSDeliveryFailureMessage) {
            return null;
        }
        var parsedData = JSON.parse(SMSDeliveryFailureMessage);
        if (Array.isArray(parsedData) && !parsedData.length) {
            return null;
        }
        return parsedData;
    }, [SMSDeliveryFailureMessage]);
    var hasSMSDeliveryFailure = (_c = account === null || account === void 0 ? void 0 : account.smsDeliveryFailureStatus) === null || _c === void 0 ? void 0 : _c.hasSMSDeliveryFailure;
    // We need to show two different messages after clicking validate button, based on API response for hasSMSDeliveryFailure.
    var _d = (0, react_1.useState)(false), hasClickedValidate = _d[0], setHasClickedValidate = _d[1];
    var errorText = (0, react_1.useMemo)(function () { return (account ? (0, ErrorUtils_1.getLatestErrorMessage)(account) : ''); }, [account]);
    var shouldShowError = !!errorText;
    (0, react_1.useEffect)(function () {
        if (!isKeyboardShown) {
            return;
        }
        react_native_1.Keyboard.dismiss();
    }, [isKeyboardShown]);
    if (hasSMSDeliveryFailure && hasClickedValidate && !isResettingSMSDeliveryFailureStatus) {
        return (<>
                <react_native_1.View style={[styles.mv3, styles.flexRow]}>
                    <react_native_1.View style={[styles.flex1]}>
                        <Text_1.default>{translate('smsDeliveryFailurePage.validationFailed', { timeData: timeData })}</Text_1.default>
                    </react_native_1.View>
                </react_native_1.View>
                <react_native_1.View style={[styles.mv4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsEnd]}>
                    <Button_1.default success large text={translate('common.buttonConfirm')} onPress={function () { return (0, Session_1.clearSignInData)(); }} pressOnEnter style={styles.w100}/>
                </react_native_1.View>
                <react_native_1.View style={[styles.mt3, styles.mb2]}>
                    <ChangeExpensifyLoginLink_1.default onPress={function () { return (0, Session_1.clearSignInData)(); }}/>
                </react_native_1.View>
                <react_native_1.View style={[styles.mt4, styles.signInPageWelcomeTextContainer]}>
                    <Terms_1.default />
                </react_native_1.View>
            </>);
    }
    if (!hasSMSDeliveryFailure && hasClickedValidate) {
        return (<>
                <react_native_1.View style={[styles.mv3, styles.flexRow]}>
                    <react_native_1.View style={[styles.flex1]}>
                        <Text_1.default>{translate('smsDeliveryFailurePage.validationSuccess')}</Text_1.default>
                    </react_native_1.View>
                </react_native_1.View>
                <react_native_1.View style={[styles.mv4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsEnd]}>
                    <FormAlertWithSubmitButton_1.default buttonText={translate('common.send')} isLoading={account === null || account === void 0 ? void 0 : account.isLoading} onSubmit={function () { return (0, Session_1.beginSignIn)(login); }} message={errorText} isAlertVisible={shouldShowError} containerStyles={[styles.w100, styles.mh0]}/>
                </react_native_1.View>
                <react_native_1.View style={[styles.mt3, styles.mb2]}>
                    <ChangeExpensifyLoginLink_1.default onPress={function () { return (0, Session_1.clearSignInData)(); }}/>
                </react_native_1.View>
                <react_native_1.View style={[styles.mt4, styles.signInPageWelcomeTextContainer]}>
                    <Terms_1.default />
                </react_native_1.View>
            </>);
    }
    return (<>
            <react_native_1.View style={[styles.mv3, styles.flexRow]}>
                <react_native_1.View style={[styles.flex1]}>
                    <Text_1.default>{translate('smsDeliveryFailurePage.smsDeliveryFailureMessage', { login: login })}</Text_1.default>
                </react_native_1.View>
            </react_native_1.View>
            <react_native_1.View style={[styles.mv4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsEnd]}>
                <FormAlertWithSubmitButton_1.default buttonText={translate('common.validate')} isLoading={isResettingSMSDeliveryFailureStatus} onSubmit={function () {
            (0, Session_1.resetSMSDeliveryFailureStatus)(login);
            setHasClickedValidate(true);
        }} message={errorText} isAlertVisible={shouldShowError} containerStyles={[styles.w100, styles.mh0]}/>
            </react_native_1.View>
            <react_native_1.View style={[styles.mt3, styles.mb2]}>
                <ChangeExpensifyLoginLink_1.default onPress={function () { return (0, Session_1.clearSignInData)(); }}/>
            </react_native_1.View>
            <react_native_1.View style={[styles.mt4, styles.signInPageWelcomeTextContainer]}>
                <Terms_1.default />
            </react_native_1.View>
        </>);
}
SMSDeliveryFailurePage.displayName = 'SMSDeliveryFailurePage';
exports.default = SMSDeliveryFailurePage;
