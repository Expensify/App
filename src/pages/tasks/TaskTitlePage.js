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
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var TextInput_1 = require("@components/TextInput");
var withCurrentUserPersonalDetails_1 = require("@components/withCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Parser_1 = require("@libs/Parser");
var ReportUtils_1 = require("@libs/ReportUtils");
var updateMultilineInputRange_1 = require("@libs/updateMultilineInputRange");
var withReportOrNotFound_1 = require("@pages/home/report/withReportOrNotFound");
var variables_1 = require("@styles/variables");
var Task_1 = require("@userActions/Task");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EditTaskForm_1 = require("@src/types/form/EditTaskForm");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function TaskTitlePage(_a) {
    var report = _a.report, currentUserPersonalDetails = _a.currentUserPersonalDetails;
    var route = (0, native_1.useRoute)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var validate = (0, react_1.useCallback)(function (_a) {
        var title = _a.title;
        var errors = {};
        var parsedTitle = (0, ReportUtils_1.getParsedComment)(title, undefined, undefined, __spreadArray([], CONST_1.default.TASK_TITLE_DISABLED_RULES, true));
        var parsedTitleLength = (0, ReportUtils_1.getCommentLength)(parsedTitle);
        if (!parsedTitle) {
            (0, ErrorUtils_1.addErrorMessage)(errors, EditTaskForm_1.default.TITLE, translate('newTaskPage.pleaseEnterTaskName'));
        }
        else if (parsedTitleLength > CONST_1.default.TASK_TITLE_CHARACTER_LIMIT) {
            (0, ErrorUtils_1.addErrorMessage)(errors, EditTaskForm_1.default.TITLE, translate('common.error.characterLimitExceedCounter', { length: parsedTitleLength, limit: CONST_1.default.TASK_TITLE_CHARACTER_LIMIT }));
        }
        return errors;
    }, [translate]);
    var submit = (0, react_1.useCallback)(function (values) {
        var _a;
        if (values.title !== Parser_1.default.htmlToMarkdown((_a = report === null || report === void 0 ? void 0 : report.reportName) !== null && _a !== void 0 ? _a : '') && !(0, EmptyObject_1.isEmptyObject)(report)) {
            // Set the title of the report in the store and then call EditTask API
            // to update the title of the report on the server
            (0, Task_1.editTask)(report, { title: values.title });
        }
        Navigation_1.default.dismissModalWithReport({ reportID: report === null || report === void 0 ? void 0 : report.reportID });
    }, [report]);
    if (!(0, ReportUtils_1.isTaskReport)(report)) {
        Navigation_1.default.isNavigationReady().then(function () {
            Navigation_1.default.dismissModalWithReport({ reportID: report === null || report === void 0 ? void 0 : report.reportID });
        });
    }
    var inputRef = (0, react_1.useRef)(null);
    var isOpen = (0, ReportUtils_1.isOpenTaskReport)(report);
    var isParentReportArchived = (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.parentReportID);
    var isTaskModifiable = (0, Task_1.canModifyTask)(report, currentUserPersonalDetails.accountID, isParentReportArchived);
    var isTaskNonEditable = (0, ReportUtils_1.isTaskReport)(report) && (!isTaskModifiable || !isOpen);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom onEntryTransitionEnd={function () {
            var _a;
            (_a = inputRef === null || inputRef === void 0 ? void 0 : inputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }} shouldEnableMaxHeight testID={TaskTitlePage.displayName}>
            {function (_a) {
            var _b;
            var didScreenTransitionEnd = _a.didScreenTransitionEnd;
            return (<FullPageNotFoundView_1.default shouldShow={isTaskNonEditable}>
                    <HeaderWithBackButton_1.default title={translate('task.task')} onBackButtonPress={function () { return Navigation_1.default.goBack(route.params.backTo); }}/>
                    <FormProvider_1.default style={[styles.flexGrow1, styles.ph5]} formID={ONYXKEYS_1.default.FORMS.EDIT_TASK_FORM} validate={validate} onSubmit={submit} submitButtonText={translate('common.save')} enabledWhenOffline shouldHideFixErrorsAlert>
                        <react_native_1.View style={[styles.mb4]}>
                            <InputWrapper_1.default InputComponent={TextInput_1.default} role={CONST_1.default.ROLE.PRESENTATION} inputID={EditTaskForm_1.default.TITLE} name={EditTaskForm_1.default.TITLE} label={translate('task.title')} accessibilityLabel={translate('task.title')} defaultValue={Parser_1.default.htmlToMarkdown((_b = report === null || report === void 0 ? void 0 : report.reportName) !== null && _b !== void 0 ? _b : '', {})} ref={function (element) {
                    if (!element) {
                        return;
                    }
                    if (!inputRef.current && didScreenTransitionEnd) {
                        (0, updateMultilineInputRange_1.default)(inputRef.current);
                    }
                    inputRef.current = element;
                }} autoGrowHeight maxAutoGrowHeight={variables_1.default.textInputAutoGrowMaxHeight} shouldSubmitForm={false} type="markdown"/>
                        </react_native_1.View>
                    </FormProvider_1.default>
                </FullPageNotFoundView_1.default>);
        }}
        </ScreenWrapper_1.default>);
}
TaskTitlePage.displayName = 'TaskTitlePage';
var ComponentWithCurrentUserPersonalDetails = (0, withCurrentUserPersonalDetails_1.default)(TaskTitlePage);
exports.default = (0, withReportOrNotFound_1.default)()(ComponentWithCurrentUserPersonalDetails);
