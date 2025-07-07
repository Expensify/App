"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var DelegateNoAccessWrapper_1 = require("@components/DelegateNoAccessWrapper");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var TextInput_1 = require("@components/TextInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var PersonalDetails_1 = require("@userActions/PersonalDetails");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var LegalNameForm_1 = require("@src/types/form/LegalNameForm");
var updateLegalName = function (values) {
    var _a, _b, _c, _d;
    (0, PersonalDetails_1.updateLegalName)((_b = (_a = values.legalFirstName) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : '', (_d = (_c = values.legalLastName) === null || _c === void 0 ? void 0 : _c.trim()) !== null && _d !== void 0 ? _d : '');
};
function LegalNamePage() {
    var _a, _b;
    var privatePersonalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS, { canBeMissing: true })[0];
    var isLoadingApp = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_APP, { initialValue: true, canBeMissing: true })[0];
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var legalFirstName = (_a = privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.legalFirstName) !== null && _a !== void 0 ? _a : '';
    var legalLastName = (_b = privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.legalLastName) !== null && _b !== void 0 ? _b : '';
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        if (typeof values.legalFirstName === 'string') {
            if (!values.legalFirstName) {
                errors.legalFirstName = translate('common.error.fieldRequired');
            }
            else if (values.legalFirstName.length > CONST_1.default.LEGAL_NAME.MAX_LENGTH) {
                (0, ErrorUtils_1.addErrorMessage)(errors, 'legalFirstName', translate('common.error.characterLimitExceedCounter', { length: values.legalFirstName.length, limit: CONST_1.default.LEGAL_NAME.MAX_LENGTH }));
            }
            if ((0, ValidationUtils_1.doesContainReservedWord)(values.legalFirstName, CONST_1.default.DISPLAY_NAME.RESERVED_NAMES)) {
                (0, ErrorUtils_1.addErrorMessage)(errors, 'legalFirstName', translate('personalDetails.error.containsReservedWord'));
            }
        }
        if (typeof values.legalLastName === 'string') {
            if (!values.legalLastName) {
                errors.legalLastName = translate('common.error.fieldRequired');
            }
            else if (values.legalLastName.length > CONST_1.default.LEGAL_NAME.MAX_LENGTH) {
                (0, ErrorUtils_1.addErrorMessage)(errors, 'legalLastName', translate('common.error.characterLimitExceedCounter', { length: values.legalLastName.length, limit: CONST_1.default.LEGAL_NAME.MAX_LENGTH }));
            }
            if ((0, ValidationUtils_1.doesContainReservedWord)(values.legalLastName, CONST_1.default.DISPLAY_NAME.RESERVED_NAMES)) {
                (0, ErrorUtils_1.addErrorMessage)(errors, 'legalLastName', translate('personalDetails.error.containsReservedWord'));
            }
        }
        return errors;
    }, [translate]);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom shouldEnableMaxHeight testID={LegalNamePage.displayName}>
            <DelegateNoAccessWrapper_1.default accessDeniedVariants={[CONST_1.default.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton_1.default title={translate('privatePersonalDetails.legalName')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
                {isLoadingApp ? (<FullscreenLoadingIndicator_1.default style={[styles.flex1, styles.pRelative]}/>) : (<FormProvider_1.default style={[styles.flexGrow1, styles.ph5]} formID={ONYXKEYS_1.default.FORMS.LEGAL_NAME_FORM} validate={validate} onSubmit={updateLegalName} submitButtonText={translate('common.save')} enabledWhenOffline>
                        <react_native_1.View style={[styles.mb4]}>
                            <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={LegalNameForm_1.default.LEGAL_FIRST_NAME} name="legalFirstName" label={translate('privatePersonalDetails.legalFirstName')} aria-label={translate('privatePersonalDetails.legalFirstName')} role={CONST_1.default.ROLE.PRESENTATION} defaultValue={legalFirstName} spellCheck={false} autoCapitalize="words"/>
                        </react_native_1.View>
                        <react_native_1.View>
                            <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={LegalNameForm_1.default.LEGAL_LAST_NAME} name="legalLastName" label={translate('privatePersonalDetails.legalLastName')} aria-label={translate('privatePersonalDetails.legalLastName')} role={CONST_1.default.ROLE.PRESENTATION} defaultValue={legalLastName} spellCheck={false} autoCapitalize="words"/>
                        </react_native_1.View>
                    </FormProvider_1.default>)}
            </DelegateNoAccessWrapper_1.default>
        </ScreenWrapper_1.default>);
}
LegalNamePage.displayName = 'LegalNamePage';
exports.default = LegalNamePage;
