"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var RenderHTML_1 = require("@components/RenderHTML");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Parser_1 = require("@libs/Parser");
var ReportUtils_1 = require("@libs/ReportUtils");
var updateMultilineInputRange_1 = require("@libs/updateMultilineInputRange");
var variables_1 = require("@styles/variables");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var ReportDescriptionForm_1 = require("@src/types/form/ReportDescriptionForm");
function RoomDescriptionPage(_a) {
    var report = _a.report, policy = _a.policy;
    var route = (0, native_1.useRoute)();
    var backTo = route.params.backTo;
    var styles = (0, useThemeStyles_1.default)();
    var _b = (0, react_1.useState)(function () { return Parser_1.default.htmlToMarkdown((0, ReportUtils_1.getReportDescription)(report)); }), description = _b[0], setDescription = _b[1];
    var reportDescriptionInputRef = (0, react_1.useRef)(null);
    var focusTimeoutRef = (0, react_1.useRef)(null);
    var translate = (0, useLocalize_1.default)().translate;
    var reportIsArchived = (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID);
    var handleReportDescriptionChange = (0, react_1.useCallback)(function (value) {
        setDescription(value);
    }, []);
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.setNavigationActionToMicrotaskQueue(function () { return Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : ROUTES_1.default.REPORT_WITH_ID_DETAILS.getRoute(report.reportID)); });
    }, [report.reportID, backTo]);
    var submitForm = (0, react_1.useCallback)(function () {
        var _a;
        var previousValue = (_a = report === null || report === void 0 ? void 0 : report.description) !== null && _a !== void 0 ? _a : '';
        var newValue = description.trim();
        (0, Report_1.updateDescription)(report.reportID, previousValue, newValue);
        goBack();
    }, [report.reportID, report.description, description, goBack]);
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        var descriptionLength = values[ReportDescriptionForm_1.default.REPORT_DESCRIPTION].trim().length;
        if (descriptionLength > CONST_1.default.REPORT_DESCRIPTION.MAX_LENGTH) {
            errors.reportDescription = translate('common.error.characterLimitExceedCounter', {
                length: descriptionLength,
                limit: CONST_1.default.REPORT_DESCRIPTION.MAX_LENGTH,
            });
        }
        return errors;
    }, [translate]);
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        focusTimeoutRef.current = setTimeout(function () {
            var _a;
            (_a = reportDescriptionInputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
            return function () {
                if (!focusTimeoutRef.current) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
        }, CONST_1.default.ANIMATED_TRANSITION);
    }, []));
    var canEdit = (0, ReportUtils_1.canEditReportDescription)(report, policy, reportIsArchived);
    return (<ScreenWrapper_1.default shouldEnableMaxHeight includeSafeAreaPaddingBottom testID={RoomDescriptionPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('reportDescriptionPage.roomDescription')} onBackButtonPress={goBack}/>
            {canEdit && (<FormProvider_1.default style={[styles.flexGrow1, styles.ph5]} formID={ONYXKEYS_1.default.FORMS.REPORT_DESCRIPTION_FORM} onSubmit={submitForm} validate={validate} submitButtonText={translate('common.save')} enabledWhenOffline shouldHideFixErrorsAlert>
                    <Text_1.default style={[styles.mb5]}>{translate('reportDescriptionPage.explainerText')}</Text_1.default>
                    <react_native_1.View style={[styles.mb6]}>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={ReportDescriptionForm_1.default.REPORT_DESCRIPTION} label={translate('reportDescriptionPage.roomDescription')} accessibilityLabel={translate('reportDescriptionPage.roomDescription')} role={CONST_1.default.ROLE.PRESENTATION} autoGrowHeight maxAutoGrowHeight={variables_1.default.textInputAutoGrowMaxHeight} ref={function (el) {
                if (!el) {
                    return;
                }
                if (!reportDescriptionInputRef.current) {
                    (0, updateMultilineInputRange_1.default)(el, false);
                }
                reportDescriptionInputRef.current = el;
            }} value={description} onChangeText={handleReportDescriptionChange} autoCapitalize="none" type="markdown"/>
                    </react_native_1.View>
                </FormProvider_1.default>)}
            {!canEdit && (<ScrollView_1.default style={[styles.flexGrow1, styles.ph5, styles.mb5]}>
                    <RenderHTML_1.default html={Parser_1.default.replace(description)}/>
                </ScrollView_1.default>)}
        </ScreenWrapper_1.default>);
}
RoomDescriptionPage.displayName = 'RoomDescriptionPage';
exports.default = RoomDescriptionPage;
