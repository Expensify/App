"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var DatePicker_1 = require("@components/DatePicker");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DateUtils_1 = require("@libs/DateUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var User_1 = require("@userActions/User");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SettingsStatusClearDateForm_1 = require("@src/types/form/SettingsStatusClearDateForm");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
function SetDatePage() {
    var _a;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.CUSTOM_STATUS_DRAFT), customStatus = _b[0], customStatusMetadata = _b[1];
    var customClearAfter = (_a = customStatus === null || customStatus === void 0 ? void 0 : customStatus.clearAfter) !== null && _a !== void 0 ? _a : '';
    var onSubmit = function (value) {
        (0, User_1.updateDraftCustomStatus)({ clearAfter: DateUtils_1.default.combineDateAndTime(customClearAfter, value.dateTime) });
        Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_STATUS_CLEAR_AFTER);
    };
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, [SettingsStatusClearDateForm_1.default.DATE_TIME]);
        var dateError = (0, ValidationUtils_1.getDatePassedError)(values.dateTime);
        if (values.dateTime && dateError) {
            errors.dateTime = dateError;
        }
        return errors;
    }, []);
    if ((0, isLoadingOnyxValue_1.default)(customStatusMetadata)) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom testID={SetDatePage.displayName}>
            <HeaderWithBackButton_1.default title={translate('statusPage.date')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_STATUS_CLEAR_AFTER); }}/>
            <FormProvider_1.default style={[styles.flexGrow1, styles.ph5]} formID={ONYXKEYS_1.default.FORMS.SETTINGS_STATUS_CLEAR_DATE_FORM} onSubmit={onSubmit} submitButtonText={translate('common.save')} validate={validate} enabledWhenOffline shouldHideFixErrorsAlert>
                <InputWrapper_1.default InputComponent={DatePicker_1.default} inputID={SettingsStatusClearDateForm_1.default.DATE_TIME} label={translate('statusPage.date')} defaultValue={DateUtils_1.default.extractDate(customClearAfter)} minDate={new Date()} shouldUseDefaultValue autoFocus/>
            </FormProvider_1.default>
        </ScreenWrapper_1.default>);
}
SetDatePage.displayName = 'SetDatePage';
exports.default = SetDatePage;
