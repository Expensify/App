"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useTransactionViolations_1 = require("@hooks/useTransactionViolations");
var DebugUtils_1 = require("@libs/DebugUtils");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var Navigation_1 = require("@libs/Navigation/Navigation");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var Debug_1 = require("@userActions/Debug");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var getInitialTransactionViolation = function () {
    return DebugUtils_1.default.stringifyJSON({
        type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
        name: CONST_1.default.VIOLATIONS.MISSING_CATEGORY,
        data: {
            rejectedBy: undefined,
            rejectReason: undefined,
            formattedLimit: undefined,
            surcharge: undefined,
            invoiceMarkup: undefined,
            maxAge: undefined,
            tagName: undefined,
            category: undefined,
            brokenBankConnection: undefined,
            isAdmin: undefined,
            email: undefined,
            isTransactionOlderThan7Days: false,
            member: undefined,
            taxName: undefined,
            tagListIndex: undefined,
            tagListName: undefined,
            errorIndexes: [],
            pendingPattern: undefined,
            type: undefined,
            displayPercentVariance: undefined,
            duplicates: [],
            rterType: undefined,
        },
    });
};
function DebugTransactionViolationCreatePage(_a) {
    var transactionID = _a.route.params.transactionID;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var transactionViolations = (0, useTransactionViolations_1.default)(transactionID);
    var _b = (0, react_1.useState)(function () { return getInitialTransactionViolation(); }), draftTransactionViolation = _b[0], setDraftTransactionViolation = _b[1];
    var _c = (0, react_1.useState)(), error = _c[0], setError = _c[1];
    var editJSON = (0, react_1.useCallback)(function (updatedJSON) {
        try {
            DebugUtils_1.default.validateTransactionViolationJSON(updatedJSON);
            setError('');
        }
        catch (e) {
            var _a = e, cause = _a.cause, message = _a.message;
            setError(cause ? translate(message, cause) : message);
        }
        finally {
            setDraftTransactionViolation(updatedJSON);
        }
    }, [translate]);
    var createTransactionViolation = (0, react_1.useCallback)(function () {
        var parsedTransactionViolation = DebugUtils_1.default.stringToOnyxData(draftTransactionViolation, 'object');
        Debug_1.default.setDebugData("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID), __spreadArray(__spreadArray([], (transactionViolations !== null && transactionViolations !== void 0 ? transactionViolations : []), true), [parsedTransactionViolation], false));
        Navigation_1.default.navigate(ROUTES_1.default.DEBUG_TRANSACTION_TAB_VIOLATIONS.getRoute(transactionID));
    }, [draftTransactionViolation, transactionID, transactionViolations]);
    if (!transactionID) {
        return <NotFoundPage_1.default />;
    }
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} shouldEnableKeyboardAvoidingView={false} shouldEnableMinHeight={(0, DeviceCapabilities_1.canUseTouchScreen)()} testID={DebugTransactionViolationCreatePage.displayName}>
            {function (_a) {
            var safeAreaPaddingBottomStyle = _a.safeAreaPaddingBottomStyle;
            return (<react_native_1.View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                    <HeaderWithBackButton_1.default title={"".concat(translate('debug.debug'), " - ").concat(translate('debug.createTransactionViolation'))} onBackButtonPress={Navigation_1.default.goBack}/>
                    <ScrollView_1.default contentContainerStyle={[styles.ph5, styles.pb5, styles.gap5]}>
                        <react_native_1.View>
                            <Text_1.default style={[styles.textLabelSupporting, styles.mb2]}>{translate('debug.editJson')}</Text_1.default>
                            <TextInput_1.default errorText={error} accessibilityLabel={translate('debug.editJson')} forceActiveLabel numberOfLines={18} multiline value={draftTransactionViolation} onChangeText={editJSON} 
            // We need to explicitly add styles.pt5 and styles.pb5 to override the default top and bottom padding of the text input
            textInputContainerStyles={[styles.border, styles.borderBottom, styles.ph5, styles.pt5, styles.pb5]}/>
                        </react_native_1.View>
                        <Text_1.default style={[styles.headerText, styles.textAlignCenter]}>{translate('debug.hint')}</Text_1.default>
                        <Button_1.default success text={translate('common.save')} isDisabled={!draftTransactionViolation || !!error} onPress={createTransactionViolation}/>
                    </ScrollView_1.default>
                </react_native_1.View>);
        }}
        </ScreenWrapper_1.default>);
}
DebugTransactionViolationCreatePage.displayName = 'DebugTransactionViolationCreatePage';
exports.default = DebugTransactionViolationCreatePage;
