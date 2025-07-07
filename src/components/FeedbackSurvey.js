"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var FormActions_1 = require("@libs/actions/FormActions");
var CONST_1 = require("@src/CONST");
var FeedbackSurveyForm_1 = require("@src/types/form/FeedbackSurveyForm");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var FixedFooter_1 = require("./FixedFooter");
var FormProvider_1 = require("./Form/FormProvider");
var InputWrapper_1 = require("./Form/InputWrapper");
var FormAlertWithSubmitButton_1 = require("./FormAlertWithSubmitButton");
var RadioButtons_1 = require("./RadioButtons");
var Text_1 = require("./Text");
var TextInput_1 = require("./TextInput");
function FeedbackSurvey(_a) {
    var title = _a.title, description = _a.description, onSubmit = _a.onSubmit, optionRowStyles = _a.optionRowStyles, footerText = _a.footerText, isNoteRequired = _a.isNoteRequired, isLoading = _a.isLoading, formID = _a.formID, _b = _a.enabledWhenOffline, enabledWhenOffline = _b === void 0 ? true : _b;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var _c = (0, useOnyx_1.default)("".concat(formID, "Draft"), { canBeMissing: true }), draft = _c[0], draftResults = _c[1];
    var _d = (0, react_1.useState)(draft === null || draft === void 0 ? void 0 : draft.reason), reason = _d[0], setReason = _d[1];
    var _e = (0, react_1.useState)(false), shouldShowReasonError = _e[0], setShouldShowReasonError = _e[1];
    var isLoadingDraft = (0, isLoadingOnyxValue_1.default)(draftResults);
    var options = (0, react_1.useMemo)(function () { return [
        { value: CONST_1.default.FEEDBACK_SURVEY_OPTIONS.TOO_LIMITED.ID, label: translate(CONST_1.default.FEEDBACK_SURVEY_OPTIONS.TOO_LIMITED.TRANSLATION_KEY) },
        { value: CONST_1.default.FEEDBACK_SURVEY_OPTIONS.TOO_EXPENSIVE.ID, label: translate(CONST_1.default.FEEDBACK_SURVEY_OPTIONS.TOO_EXPENSIVE.TRANSLATION_KEY) },
        { value: CONST_1.default.FEEDBACK_SURVEY_OPTIONS.INADEQUATE_SUPPORT.ID, label: translate(CONST_1.default.FEEDBACK_SURVEY_OPTIONS.INADEQUATE_SUPPORT.TRANSLATION_KEY) },
        { value: CONST_1.default.FEEDBACK_SURVEY_OPTIONS.BUSINESS_CLOSING.ID, label: translate(CONST_1.default.FEEDBACK_SURVEY_OPTIONS.BUSINESS_CLOSING.TRANSLATION_KEY) },
    ]; }, [translate]);
    (0, react_1.useEffect)(function () {
        if (!(draft === null || draft === void 0 ? void 0 : draft.reason) || isLoadingDraft) {
            return;
        }
        setReason(draft.reason);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- only sync with draft data when it is loaded
    }, [isLoadingDraft]);
    var handleOptionSelect = function (value) {
        setReason(value);
        setShouldShowReasonError(false);
    };
    var handleSubmit = function () {
        var _a, _b;
        if (!(draft === null || draft === void 0 ? void 0 : draft.reason) || (isNoteRequired && !((_a = draft.note) === null || _a === void 0 ? void 0 : _a.trim()))) {
            setShouldShowReasonError(true);
            return;
        }
        onSubmit(draft.reason, (_b = draft.note) === null || _b === void 0 ? void 0 : _b.trim());
        (0, FormActions_1.clearDraftValues)(formID);
    };
    var handleSetNote = function () {
        if (!isNoteRequired || !shouldShowReasonError) {
            return;
        }
        setShouldShowReasonError(false);
    };
    return (<FormProvider_1.default formID={formID} style={[styles.flexGrow1, styles.justifyContentBetween]} onSubmit={handleSubmit} submitButtonText={translate('common.submit')} isSubmitButtonVisible={false} enabledWhenOffline={enabledWhenOffline}>
            <react_native_1.View style={styles.mh5}>
                <Text_1.default style={styles.textHeadline}>{title}</Text_1.default>
                <Text_1.default style={[styles.mt1, styles.mb3, styles.textNormalThemeText]}>{description}</Text_1.default>
                <InputWrapper_1.default InputComponent={RadioButtons_1.default} inputID={FeedbackSurveyForm_1.default.REASON} items={options} radioButtonStyle={[styles.mb7, optionRowStyles]} onPress={handleOptionSelect} shouldSaveDraft/>
                {!!reason && (<>
                        <Text_1.default style={[styles.textNormalThemeText, styles.mb3]}>{translate('feedbackSurvey.additionalInfoTitle')}</Text_1.default>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={FeedbackSurveyForm_1.default.NOTE} label={translate('feedbackSurvey.additionalInfoInputLabel')} accessibilityLabel={translate('feedbackSurvey.additionalInfoInputLabel')} role={CONST_1.default.ROLE.PRESENTATION} onChangeText={handleSetNote} shouldSaveDraft/>
                    </>)}
            </react_native_1.View>
            <FixedFooter_1.default style={styles.pb0}>
                {!!footerText && footerText}
                <FormAlertWithSubmitButton_1.default isAlertVisible={shouldShowReasonError} onSubmit={handleSubmit} message={translate('common.error.pleaseCompleteForm')} buttonText={translate('common.submit')} enabledWhenOffline={enabledWhenOffline} containerStyles={styles.mt3} isLoading={isLoading}/>
            </FixedFooter_1.default>
        </FormProvider_1.default>);
}
FeedbackSurvey.displayName = 'FeedbackSurvey';
exports.default = FeedbackSurvey;
