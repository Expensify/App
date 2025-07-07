"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_onyx_1 = require("react-native-onyx");
var Button_1 = require("@components/Button");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var WorkspaceSettingsUtils = require("@libs/WorkspacesSettingsUtils");
var Navigation_1 = require("@navigation/Navigation");
var MemberActions = require("@userActions/Policy/Member");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function WorkspaceOwnerChangeCheck(_a) {
    var _b;
    var personalDetails = _a.personalDetails, policy = _a.policy, accountID = _a.accountID, error = _a.error;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _c = (0, react_1.useState)({
        title: '',
        text: '',
        buttonText: '',
    }), displayTexts = _c[0], setDisplayTexts = _c[1];
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var updateDisplayTexts = (0, react_1.useCallback)(function () {
        var _a, _b, _c;
        var changeOwnerErrors = Object.keys((_b = (_a = policy === null || policy === void 0 ? void 0 : policy.errorFields) === null || _a === void 0 ? void 0 : _a.changeOwner) !== null && _b !== void 0 ? _b : {});
        if (error !== changeOwnerErrors.at(0)) {
            return;
        }
        var texts = WorkspaceSettingsUtils.getOwnershipChecksDisplayText(error, translate, policy, (_c = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID]) === null || _c === void 0 ? void 0 : _c.login);
        setDisplayTexts(texts);
    }, [accountID, error, personalDetails, policy, translate]);
    (0, react_1.useEffect)(function () {
        updateDisplayTexts();
    }, [updateDisplayTexts]);
    var confirm = (0, react_1.useCallback)(function () {
        if (error === CONST_1.default.POLICY.OWNERSHIP_ERRORS.HAS_FAILED_SETTLEMENTS || error === CONST_1.default.POLICY.OWNERSHIP_ERRORS.FAILED_TO_CLEAR_BALANCE) {
            // cannot transfer ownership if there are failed settlements, or we cannot clear the balance
            MemberActions.clearWorkspaceOwnerChangeFlow(policyID);
            Navigation_1.default.goBack();
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
            return;
        }
        MemberActions.requestWorkspaceOwnerChange(policyID);
    }, [accountID, error, policyID]);
    return (<>
            <Text_1.default style={[styles.textHeadline, styles.mt3, styles.mb2]}>{displayTexts.title}</Text_1.default>
            <Text_1.default style={styles.flex1}>{displayTexts.text}</Text_1.default>
            <react_native_1.View style={styles.pb5}>
                <Button_1.default success large onPress={confirm} text={displayTexts.buttonText}/>
            </react_native_1.View>
        </>);
}
WorkspaceOwnerChangeCheck.displayName = 'WorkspaceOwnerChangeCheckPage';
exports.default = (0, react_native_onyx_1.withOnyx)({
    personalDetails: {
        key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
    },
})(WorkspaceOwnerChangeCheck);
