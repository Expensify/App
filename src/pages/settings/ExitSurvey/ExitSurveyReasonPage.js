"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var RadioButtons_1 = require("@components/RadioButtons");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@navigation/Navigation");
var ExitSurvey_1 = require("@userActions/ExitSurvey");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var ExitSurveyReasonForm_1 = require("@src/types/form/ExitSurveyReasonForm");
var ExitSurveyOffline_1 = require("./ExitSurveyOffline");
function ExitSurveyReasonPage() {
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var draftReason = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.EXIT_SURVEY_REASON_FORM_DRAFT, {
        selector: function (value) { var _a; return (_a = value === null || value === void 0 ? void 0 : value[ExitSurveyReasonForm_1.default.REASON]) !== null && _a !== void 0 ? _a : null; },
        canBeMissing: true,
    })[0];
    var _a = (0, react_1.useState)(draftReason !== null && draftReason !== void 0 ? draftReason : null), reason = _a[0], setReason = _a[1];
    (0, react_1.useEffect)(function () {
        // disabling lint because || is fine to use as a logical operator (as opposed to being used to define a default value)
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (reason || !draftReason) {
            return;
        }
        setReason(draftReason);
    }, [reason, draftReason]);
    var reasons = (0, react_1.useMemo)(function () {
        return Object.values(CONST_1.default.EXIT_SURVEY.REASONS).map(function (value) { return ({
            value: value,
            label: translate("exitSurvey.reasons.".concat(value)),
            style: styles.mt6,
        }); });
    }, [styles, translate]);
    return (<ScreenWrapper_1.default testID={ExitSurveyReasonPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('exitSurvey.header')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
            <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.EXIT_SURVEY_REASON_FORM} style={[styles.flex1, styles.mt3, styles.mh5]} validate={function () {
            var errors = {};
            if (!reason) {
                errors[ExitSurveyReasonForm_1.default.REASON] = translate('common.error.fieldRequired');
            }
            return errors;
        }} onSubmit={function () {
            if (!reason) {
                return;
            }
            (0, ExitSurvey_1.saveExitReason)(reason);
            Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_EXIT_SURVEY_RESPONSE.getRoute(reason, ROUTES_1.default.SETTINGS_EXIT_SURVEY_REASON.route));
        }} submitButtonText={translate('common.next')} shouldValidateOnBlur shouldValidateOnChange shouldHideFixErrorsAlert>
                {isOffline && <ExitSurveyOffline_1.default />}
                {!isOffline && (<>
                        <Text_1.default style={styles.headerAnonymousFooter}>{translate('exitSurvey.reasonPage.title')}</Text_1.default>
                        <Text_1.default style={styles.mt2}>{translate('exitSurvey.reasonPage.subtitle')}</Text_1.default>
                        <InputWrapper_1.default InputComponent={RadioButtons_1.default} inputID={ExitSurveyReasonForm_1.default.REASON} value={reason} items={reasons} onPress={setReason} shouldSaveDraft/>
                    </>)}
            </FormProvider_1.default>
        </ScreenWrapper_1.default>);
}
ExitSurveyReasonPage.displayName = 'ExitSurveyReasonPage';
exports.default = ExitSurveyReasonPage;
