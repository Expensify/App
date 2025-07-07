"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Parser_1 = require("@libs/Parser");
var ReportUtils_1 = require("@libs/ReportUtils");
var variables_1 = require("@styles/variables");
var Task_1 = require("@userActions/Task");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var NewTaskForm_1 = require("@src/types/form/NewTaskForm");
function NewTaskDetailsPage(_a) {
    var _b, _c, _d;
    var route = _a.route;
    var task = (0, useOnyx_1.default)(ONYXKEYS_1.default.TASK, { canBeMissing: true })[0];
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _e = (0, react_1.useState)((_b = task === null || task === void 0 ? void 0 : task.title) !== null && _b !== void 0 ? _b : ''), taskTitle = _e[0], setTaskTitle = _e[1];
    var _f = (0, react_1.useState)((_c = task === null || task === void 0 ? void 0 : task.description) !== null && _c !== void 0 ? _c : ''), taskDescription = _f[0], setTaskDescription = _f[1];
    var titleDefaultValue = (0, react_1.useMemo)(function () { return Parser_1.default.htmlToMarkdown(Parser_1.default.replace(taskTitle)); }, [taskTitle]);
    var descriptionDefaultValue = (0, react_1.useMemo)(function () { return Parser_1.default.htmlToMarkdown(Parser_1.default.replace(taskDescription)); }, [taskDescription]);
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var backTo = (_d = route.params) === null || _d === void 0 ? void 0 : _d.backTo;
    var skipConfirmation = (task === null || task === void 0 ? void 0 : task.skipConfirmation) && (task === null || task === void 0 ? void 0 : task.assigneeAccountID) && (task === null || task === void 0 ? void 0 : task.parentReportID);
    var buttonText = skipConfirmation ? translate('newTaskPage.assignTask') : translate('common.next');
    (0, react_1.useEffect)(function () {
        var _a, _b;
        setTaskTitle(Parser_1.default.htmlToMarkdown(Parser_1.default.replace((_a = task === null || task === void 0 ? void 0 : task.title) !== null && _a !== void 0 ? _a : '')));
        setTaskDescription(Parser_1.default.htmlToMarkdown(Parser_1.default.replace((_b = task === null || task === void 0 ? void 0 : task.description) !== null && _b !== void 0 ? _b : '')));
    }, [task]);
    var validate = function (values) {
        var errors = {};
        if (!values.taskTitle) {
            // We error if the user doesn't enter a task name
            (0, ErrorUtils_1.addErrorMessage)(errors, 'taskTitle', translate('newTaskPage.pleaseEnterTaskName'));
        }
        else if (values.taskTitle.length > CONST_1.default.TASK_TITLE_CHARACTER_LIMIT) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'taskTitle', translate('common.error.characterLimitExceedCounter', { length: values.taskTitle.length, limit: CONST_1.default.TASK_TITLE_CHARACTER_LIMIT }));
        }
        var taskDescriptionLength = (0, ReportUtils_1.getCommentLength)(values.taskDescription);
        if (taskDescriptionLength > CONST_1.default.DESCRIPTION_LIMIT) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'taskDescription', translate('common.error.characterLimitExceedCounter', { length: taskDescriptionLength, limit: CONST_1.default.DESCRIPTION_LIMIT }));
        }
        return errors;
    };
    // On submit, we want to call the assignTask function and wait to validate
    // the response
    var onSubmit = function (values) {
        var _a, _b;
        (0, Task_1.setDetailsValue)(values.taskTitle, values.taskDescription);
        if (skipConfirmation) {
            (0, Task_1.setShareDestinationValue)(task === null || task === void 0 ? void 0 : task.parentReportID);
            (0, Task_1.createTaskAndNavigate)(task === null || task === void 0 ? void 0 : task.parentReportID, values.taskTitle, (_a = values.taskDescription) !== null && _a !== void 0 ? _a : '', (_b = task === null || task === void 0 ? void 0 : task.assignee) !== null && _b !== void 0 ? _b : '', task.assigneeAccountID, task.assigneeChatReport);
        }
        else {
            Navigation_1.default.navigate(ROUTES_1.default.NEW_TASK.getRoute(backTo));
        }
    };
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom shouldEnableMaxHeight testID={NewTaskDetailsPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('newTaskPage.assignTask')} shouldShowBackButton onBackButtonPress={function () { return (0, Task_1.dismissModalAndClearOutTaskInfo)(backTo); }}/>
            <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.NEW_TASK_FORM} submitButtonText={buttonText} style={[styles.mh5, styles.flexGrow1]} validate={validate} onSubmit={onSubmit} enabledWhenOffline>
                <react_native_1.View style={styles.mb5}>
                    <InputWrapper_1.default InputComponent={TextInput_1.default} ref={inputCallbackRef} valueType="string" role={CONST_1.default.ROLE.PRESENTATION} inputID={NewTaskForm_1.default.TASK_TITLE} label={translate('task.title')} accessibilityLabel={translate('task.title')} defaultValue={titleDefaultValue} value={taskTitle} onValueChange={setTaskTitle} autoCorrect={false} type="markdown" autoGrowHeight maxAutoGrowHeight={variables_1.default.textInputAutoGrowMaxHeight}/>
                </react_native_1.View>
                <react_native_1.View style={styles.mb5}>
                    <InputWrapper_1.default valueType="string" InputComponent={TextInput_1.default} role={CONST_1.default.ROLE.PRESENTATION} inputID={NewTaskForm_1.default.TASK_DESCRIPTION} label={translate('newTaskPage.descriptionOptional')} accessibilityLabel={translate('newTaskPage.descriptionOptional')} autoGrowHeight maxAutoGrowHeight={variables_1.default.textInputAutoGrowMaxHeight} shouldSubmitForm defaultValue={descriptionDefaultValue} value={taskDescription} onValueChange={setTaskDescription} type="markdown"/>
                </react_native_1.View>
            </FormProvider_1.default>
        </ScreenWrapper_1.default>);
}
NewTaskDetailsPage.displayName = 'NewTaskDetailsPage';
exports.default = NewTaskDetailsPage;
