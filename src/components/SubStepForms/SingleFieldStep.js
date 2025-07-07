"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var HelpLinks_1 = require("@pages/ReimbursementAccount/USD/Requestor/PersonalInfo/HelpLinks");
var CONST_1 = require("@src/CONST");
function SingleFieldStep(_a) {
    var formID = _a.formID, formTitle = _a.formTitle, formDisclaimer = _a.formDisclaimer, validate = _a.validate, onSubmit = _a.onSubmit, inputId = _a.inputId, inputLabel = _a.inputLabel, inputMode = _a.inputMode, defaultValue = _a.defaultValue, isEditing = _a.isEditing, _b = _a.shouldShowHelpLinks, shouldShowHelpLinks = _b === void 0 ? true : _b, maxLength = _a.maxLength, enabledWhenOffline = _a.enabledWhenOffline, _c = _a.shouldUseDefaultValue, shouldUseDefaultValue = _c === void 0 ? true : _c, _d = _a.disabled, disabled = _d === void 0 ? false : _d, placeholder = _a.placeholder;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    return (<FormProvider_1.default formID={formID} submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')} validate={validate} onSubmit={onSubmit} style={[styles.mh5, styles.flexGrow1]} submitButtonStyles={[styles.mb0]} enabledWhenOffline={enabledWhenOffline} shouldHideFixErrorsAlert>
            <react_native_1.View>
                <Text_1.default style={[styles.textHeadlineLineHeightXXL]}>{formTitle}</Text_1.default>
                {!!formDisclaimer && <Text_1.default style={[styles.textSupporting, styles.mt3]}>{formDisclaimer}</Text_1.default>}
                <react_native_1.View style={[styles.flex1]}>
                    <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={inputId} label={inputLabel} aria-label={inputLabel} role={CONST_1.default.ROLE.PRESENTATION} containerStyles={[styles.mt6]} inputMode={inputMode} defaultValue={defaultValue} maxLength={maxLength} shouldSaveDraft={!isEditing} shouldUseDefaultValue={shouldUseDefaultValue} disabled={disabled} placeholder={placeholder} autoFocus/>
                </react_native_1.View>
                {shouldShowHelpLinks && <HelpLinks_1.default containerStyles={[styles.mt5]}/>}
            </react_native_1.View>
        </FormProvider_1.default>);
}
SingleFieldStep.displayName = 'SingleFieldStep';
exports.default = SingleFieldStep;
