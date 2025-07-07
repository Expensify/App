"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
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
var updateMultilineInputRange_1 = require("@libs/updateMultilineInputRange");
var variables_1 = require("@styles/variables");
var Task_1 = require("@userActions/Task");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var NewTaskForm_1 = require("@src/types/form/NewTaskForm");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
function NewTaskDescriptionPage(_a) {
    var _b;
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _c = (0, useOnyx_1.default)(ONYXKEYS_1.default.TASK), task = _c[0], taskMetadata = _c[1];
    var _d = (0, useAutoFocusInput_1.default)(), inputCallbackRef = _d.inputCallbackRef, inputRef = _d.inputRef;
    var goBack = function () { var _a; return Navigation_1.default.goBack(ROUTES_1.default.NEW_TASK.getRoute((_a = route.params) === null || _a === void 0 ? void 0 : _a.backTo)); };
    var onSubmit = function (values) {
        (0, Task_1.setDescriptionValue)(values.taskDescription);
        goBack();
    };
    var validate = function (values) {
        var errors = {};
        var taskDescriptionLength = (0, ReportUtils_1.getCommentLength)(values.taskDescription);
        if (taskDescriptionLength > CONST_1.default.DESCRIPTION_LIMIT) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'taskDescription', translate('common.error.characterLimitExceedCounter', { length: taskDescriptionLength, limit: CONST_1.default.DESCRIPTION_LIMIT }));
        }
        return errors;
    };
    if ((0, isLoadingOnyxValue_1.default)(taskMetadata)) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom shouldEnableMaxHeight testID={NewTaskDescriptionPage.displayName}>
            <>
                <HeaderWithBackButton_1.default title={translate('task.description')} onBackButtonPress={goBack}/>
                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.NEW_TASK_FORM} submitButtonText={translate('common.next')} style={[styles.mh5, styles.flexGrow1]} validate={validate} onSubmit={onSubmit} enabledWhenOffline shouldHideFixErrorsAlert>
                    <react_native_1.View style={styles.mb5}>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} defaultValue={Parser_1.default.htmlToMarkdown(Parser_1.default.replace((_b = task === null || task === void 0 ? void 0 : task.description) !== null && _b !== void 0 ? _b : ''))} inputID={NewTaskForm_1.default.TASK_DESCRIPTION} label={translate('newTaskPage.descriptionOptional')} accessibilityLabel={translate('newTaskPage.descriptionOptional')} role={CONST_1.default.ROLE.PRESENTATION} ref={function (el) {
            if (!inputRef.current) {
                (0, updateMultilineInputRange_1.default)(el);
            }
            inputCallbackRef(el);
        }} autoGrowHeight maxAutoGrowHeight={variables_1.default.textInputAutoGrowMaxHeight} shouldSubmitForm type="markdown"/>
                    </react_native_1.View>
                </FormProvider_1.default>
            </>
        </ScreenWrapper_1.default>);
}
NewTaskDescriptionPage.displayName = 'NewTaskDescriptionPage';
exports.default = NewTaskDescriptionPage;
