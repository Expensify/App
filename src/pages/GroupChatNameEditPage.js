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
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var NewChatNameForm_1 = require("@src/types/form/NewChatNameForm");
function GroupChatNameEditPage(_a) {
    var report = _a.report;
    // If we have a report this means we are using this page to update an existing Group Chat name
    // In this case its better to use empty string as the reportID if there is no reportID
    var reportID = report === null || report === void 0 ? void 0 : report.reportID;
    var isUpdatingExistingReport = !!reportID;
    var groupChatDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.NEW_GROUP_CHAT_DRAFT, { initialValue: (0, ReportUtils_1.getGroupChatDraft)(), canBeMissing: true })[0];
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var existingReportName = (0, react_1.useMemo)(function () { return (report ? (0, ReportUtils_1.getGroupChatName)(undefined, false, report) : (0, ReportUtils_1.getGroupChatName)(groupChatDraft === null || groupChatDraft === void 0 ? void 0 : groupChatDraft.participants)); }, [groupChatDraft === null || groupChatDraft === void 0 ? void 0 : groupChatDraft.participants, report]);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var currentChatName = reportID ? existingReportName : (groupChatDraft === null || groupChatDraft === void 0 ? void 0 : groupChatDraft.reportName) || existingReportName;
    var validate = (0, react_1.useCallback)(function (values) {
        var _a;
        var errors = {};
        var name = (_a = values[NewChatNameForm_1.default.NEW_CHAT_NAME]) !== null && _a !== void 0 ? _a : '';
        // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16 code units.
        var nameLength = __spreadArray([], name.trim(), true).length;
        if (nameLength > CONST_1.default.REPORT_NAME_LIMIT) {
            errors.newChatName = translate('common.error.characterLimitExceedCounter', { length: nameLength, limit: CONST_1.default.REPORT_NAME_LIMIT });
        }
        return errors;
    }, [translate]);
    var editName = (0, react_1.useCallback)(function (values) {
        var _a;
        if (isUpdatingExistingReport) {
            if (values[NewChatNameForm_1.default.NEW_CHAT_NAME] !== currentChatName) {
                (0, Report_1.updateChatName)(reportID, (_a = values[NewChatNameForm_1.default.NEW_CHAT_NAME]) !== null && _a !== void 0 ? _a : '', CONST_1.default.REPORT.CHAT_TYPE.GROUP);
            }
            Navigation_1.default.setNavigationActionToMicrotaskQueue(function () { return Navigation_1.default.goBack(ROUTES_1.default.REPORT_WITH_ID_DETAILS.getRoute(reportID)); });
            return;
        }
        if (values[NewChatNameForm_1.default.NEW_CHAT_NAME] !== currentChatName) {
            (0, Report_1.setGroupDraft)({ reportName: values[NewChatNameForm_1.default.NEW_CHAT_NAME] });
        }
        Navigation_1.default.setNavigationActionToMicrotaskQueue(function () { return Navigation_1.default.goBack(ROUTES_1.default.NEW_CHAT_CONFIRM); });
    }, [isUpdatingExistingReport, reportID, currentChatName]);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom style={[styles.defaultModalContainer]} testID={GroupChatNameEditPage.displayName} shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={translate('newRoomPage.groupName')} onBackButtonPress={function () { return Navigation_1.default.goBack(isUpdatingExistingReport ? ROUTES_1.default.REPORT_WITH_ID_DETAILS.getRoute(reportID) : ROUTES_1.default.NEW_CHAT_CONFIRM); }}/>
            <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.NEW_CHAT_NAME_FORM} onSubmit={editName} submitButtonText={translate('common.save')} validate={validate} style={[styles.mh5, styles.flex1]} enabledWhenOffline shouldHideFixErrorsAlert>
                <InputWrapper_1.default InputComponent={TextInput_1.default} defaultValue={currentChatName} label={translate('common.name')} accessibilityLabel={translate('common.name')} inputID={NewChatNameForm_1.default.NEW_CHAT_NAME} role={CONST_1.default.ROLE.PRESENTATION} ref={inputCallbackRef}/>
            </FormProvider_1.default>
        </ScreenWrapper_1.default>);
}
GroupChatNameEditPage.displayName = 'GroupChatNameEditPage';
exports.default = GroupChatNameEditPage;
