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
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var StringUtils_1 = require("@libs/StringUtils");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var NewChatNameForm_1 = require("@src/types/form/NewChatNameForm");
function TripChatNameEditPage(_a) {
    var report = _a.report;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var reportID = report === null || report === void 0 ? void 0 : report.reportID;
    var currentChatName = (0, ReportUtils_1.getReportName)(report);
    var validate = (0, react_1.useCallback)(function (values) {
        var _a, _b;
        var errors = {};
        var name = (_a = values[NewChatNameForm_1.default.NEW_CHAT_NAME]) !== null && _a !== void 0 ? _a : '';
        // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16 code units.
        var nameLength = __spreadArray([], name.trim(), true).length;
        if (nameLength > CONST_1.default.REPORT_NAME_LIMIT) {
            errors.newChatName = translate('common.error.characterLimitExceedCounter', { length: nameLength, limit: CONST_1.default.REPORT_NAME_LIMIT });
        }
        if (StringUtils_1.default.isEmptyString((_b = values[NewChatNameForm_1.default.NEW_CHAT_NAME]) !== null && _b !== void 0 ? _b : '')) {
            errors.newChatName = translate('common.error.fieldRequired');
        }
        return errors;
    }, [translate]);
    var editName = (0, react_1.useCallback)(function (values) {
        var _a;
        if (values[NewChatNameForm_1.default.NEW_CHAT_NAME] !== currentChatName) {
            (0, Report_1.updateChatName)(reportID, (_a = values[NewChatNameForm_1.default.NEW_CHAT_NAME]) !== null && _a !== void 0 ? _a : '', CONST_1.default.REPORT.CHAT_TYPE.TRIP_ROOM);
        }
        return Navigation_1.default.setNavigationActionToMicrotaskQueue(function () { return Navigation_1.default.goBack(ROUTES_1.default.REPORT_WITH_ID_DETAILS.getRoute(reportID)); });
    }, [reportID, currentChatName]);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom style={[styles.defaultModalContainer]} testID={TripChatNameEditPage.displayName} shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={translate('newRoomPage.roomName')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.REPORT_WITH_ID_DETAILS.getRoute(reportID)); }}/>
            <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.NEW_CHAT_NAME_FORM} onSubmit={editName} submitButtonText={translate('common.save')} validate={validate} style={[styles.mh5, styles.flex1]} enabledWhenOffline shouldHideFixErrorsAlert>
                <InputWrapper_1.default InputComponent={TextInput_1.default} defaultValue={currentChatName} label={translate('common.name')} accessibilityLabel={translate('common.name')} inputID={NewChatNameForm_1.default.NEW_CHAT_NAME} role={CONST_1.default.ROLE.PRESENTATION} ref={inputCallbackRef}/>
            </FormProvider_1.default>
        </ScreenWrapper_1.default>);
}
TripChatNameEditPage.displayName = 'TripChatNameEditPage';
exports.default = TripChatNameEditPage;
