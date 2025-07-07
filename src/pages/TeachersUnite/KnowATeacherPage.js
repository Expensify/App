"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useEnvironment_1 = require("@hooks/useEnvironment");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var LoginUtils_1 = require("@libs/LoginUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var TeachersUnite_1 = require("@userActions/TeachersUnite");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var IKnowTeacherForm_1 = require("@src/types/form/IKnowTeacherForm");
function KnowATeacherPage() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isProduction = (0, useEnvironment_1.default)().isProduction;
    var loginList = (0, useOnyx_1.default)(ONYXKEYS_1.default.LOGIN_LIST)[0];
    /**
     * Submit form to pass firstName, partnerUserID and lastName
     */
    var onSubmit = function (values) {
        var phoneLogin = (0, LoginUtils_1.getPhoneLogin)(values.partnerUserID);
        var validateIfNumber = (0, LoginUtils_1.validateNumber)(phoneLogin);
        var contactMethod = (validateIfNumber || values.partnerUserID).trim().toLowerCase();
        var firstName = values.firstName.trim();
        var lastName = values.lastName.trim();
        var policyID = isProduction ? CONST_1.default.TEACHERS_UNITE.PROD_POLICY_ID : CONST_1.default.TEACHERS_UNITE.TEST_POLICY_ID;
        var publicRoomReportID = isProduction ? CONST_1.default.TEACHERS_UNITE.PROD_PUBLIC_ROOM_ID : CONST_1.default.TEACHERS_UNITE.TEST_PUBLIC_ROOM_ID;
        TeachersUnite_1.default.referTeachersUniteVolunteer(contactMethod, firstName, lastName, policyID, publicRoomReportID);
    };
    /**
     * @returns - An object containing the errors for each inputID
     */
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        var phoneLogin = (0, LoginUtils_1.getPhoneLogin)(values.partnerUserID);
        var validateIfNumber = (0, LoginUtils_1.validateNumber)(phoneLogin);
        if (!values.firstName || !(0, ValidationUtils_1.isValidDisplayName)(values.firstName)) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'firstName', translate('personalDetails.error.hasInvalidCharacter'));
        }
        else if (values.firstName.length > CONST_1.default.DISPLAY_NAME.MAX_LENGTH) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'firstName', translate('common.error.characterLimitExceedCounter', {
                length: values.firstName.length,
                limit: CONST_1.default.DISPLAY_NAME.MAX_LENGTH,
            }));
        }
        if (!values.lastName || !(0, ValidationUtils_1.isValidDisplayName)(values.lastName)) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'lastName', translate('personalDetails.error.hasInvalidCharacter'));
        }
        else if (values.lastName.length > CONST_1.default.DISPLAY_NAME.MAX_LENGTH) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'lastName', translate('common.error.characterLimitExceedCounter', {
                length: values.lastName.length,
                limit: CONST_1.default.DISPLAY_NAME.MAX_LENGTH,
            }));
        }
        if (!values.partnerUserID) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'partnerUserID', translate('teachersUnitePage.error.enterPhoneEmail'));
        }
        if (values.partnerUserID && (loginList === null || loginList === void 0 ? void 0 : loginList[validateIfNumber || values.partnerUserID.toLowerCase()])) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'partnerUserID', translate('teachersUnitePage.error.tryDifferentEmail'));
        }
        if (values.partnerUserID && !(validateIfNumber || expensify_common_1.Str.isValidEmail(values.partnerUserID))) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'partnerUserID', translate('contacts.genericFailureMessages.invalidContactMethod'));
        }
        return errors;
    }, [loginList, translate]);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom testID={KnowATeacherPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('teachersUnitePage.iKnowATeacher')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
            <FormProvider_1.default enabledWhenOffline style={[styles.flexGrow1, styles.ph5]} formID={ONYXKEYS_1.default.FORMS.I_KNOW_A_TEACHER_FORM} validate={validate} onSubmit={onSubmit} submitButtonText={translate('common.letsDoThis')}>
                <Text_1.default style={[styles.mb6]}>{translate('teachersUnitePage.getInTouch')}</Text_1.default>
                <react_native_1.View>
                    <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={IKnowTeacherForm_1.default.FIRST_NAME} name="fname" label={translate('common.firstName')} accessibilityLabel={translate('common.firstName')} role={CONST_1.default.ROLE.PRESENTATION} autoCapitalize="words"/>
                </react_native_1.View>
                <react_native_1.View style={styles.mv4}>
                    <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={IKnowTeacherForm_1.default.LAST_NAME} name="lname" label={translate('common.lastName')} accessibilityLabel={translate('common.lastName')} role={CONST_1.default.ROLE.PRESENTATION} autoCapitalize="words"/>
                </react_native_1.View>
                <react_native_1.View>
                    <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={IKnowTeacherForm_1.default.PARTNER_USER_ID} name="partnerUserID" label={"".concat(translate('common.email'), "/").concat(translate('common.phoneNumber'))} accessibilityLabel={"".concat(translate('common.email'), "/").concat(translate('common.phoneNumber'))} role={CONST_1.default.ROLE.PRESENTATION} inputMode={CONST_1.default.INPUT_MODE.EMAIL} autoCapitalize="none"/>
                </react_native_1.View>
            </FormProvider_1.default>
        </ScreenWrapper_1.default>);
}
KnowATeacherPage.displayName = 'KnowATeacherPage';
exports.default = KnowATeacherPage;
