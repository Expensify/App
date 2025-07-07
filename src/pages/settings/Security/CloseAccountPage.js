"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var ConfirmModal_1 = require("@components/ConfirmModal");
var DelegateNoAccessWrapper_1 = require("@components/DelegateNoAccessWrapper");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Fullstory_1 = require("@libs/Fullstory");
var LoginUtils_1 = require("@libs/LoginUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var variables_1 = require("@styles/variables");
var CloseAccount_1 = require("@userActions/CloseAccount");
var User_1 = require("@userActions/User");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var CloseAccountForm_1 = require("@src/types/form/CloseAccountForm");
function CloseAccountPage() {
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, {
        canBeMissing: false,
    })[0];
    var styles = (0, useThemeStyles_1.default)();
    var _a = (0, useLocalize_1.default)(), translate = _a.translate, formatPhoneNumber = _a.formatPhoneNumber;
    var _b = (0, react_1.useState)(false), isConfirmModalVisible = _b[0], setConfirmModalVisibility = _b[1];
    var _c = (0, react_1.useState)(''), reasonForLeaving = _c[0], setReasonForLeaving = _c[1];
    // If you are new to hooks this might look weird but basically it is something that only runs when the component unmounts
    // nothing runs on mount and we pass empty dependencies to prevent this from running on every re-render.
    // TODO: We should refactor this so that the data in instead passed directly as a prop instead of "side loading" the data
    // here, we left this as is during refactor to limit the breaking changes.
    (0, react_1.useEffect)(function () { return function () { return (0, CloseAccount_1.clearError)(); }; }, []);
    /**
     * Extracts values from the non-scraped attribute WEB_PROP_ATTR at build time
     * to ensure necessary properties are available for further processing.
     * Reevaluates "fs-class" to dynamically apply styles or behavior based on
     * updated attribute values.
     */
    (0, react_1.useLayoutEffect)(Fullstory_1.parseFSAttributes, []);
    var hideConfirmModal = function () {
        setConfirmModalVisibility(false);
    };
    var onConfirm = function () {
        (0, User_1.closeAccount)(reasonForLeaving);
        hideConfirmModal();
    };
    var showConfirmModal = function (values) {
        setConfirmModalVisibility(true);
        setReasonForLeaving(values.reasonForLeaving);
    };
    var userEmailOrPhone = (session === null || session === void 0 ? void 0 : session.email) ? formatPhoneNumber(session.email) : null;
    /**
     * Removes spaces and transform the input string to lowercase.
     * @param phoneOrEmail - The input string to be sanitized.
     * @returns The sanitized string
     */
    var sanitizePhoneOrEmail = function (phoneOrEmail) { return phoneOrEmail.replace(/\s+/g, '').toLowerCase(); };
    var validate = function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, ['phoneOrEmail']);
        if (values.phoneOrEmail && userEmailOrPhone) {
            var isValid = false;
            if (expensify_common_1.Str.isValidEmail(userEmailOrPhone)) {
                // Email comparison - use existing sanitization
                isValid = sanitizePhoneOrEmail(userEmailOrPhone) === sanitizePhoneOrEmail(values.phoneOrEmail);
            }
            else {
                // Phone number comparison - normalize to E.164
                var storedE164Phone = (0, LoginUtils_1.formatE164PhoneNumber)((0, LoginUtils_1.getPhoneNumberWithoutSpecialChars)(userEmailOrPhone));
                var inputE164Phone = (0, LoginUtils_1.formatE164PhoneNumber)((0, LoginUtils_1.getPhoneNumberWithoutSpecialChars)(values.phoneOrEmail));
                // Only compare if both numbers could be formatted to E.164
                if (storedE164Phone && inputE164Phone) {
                    isValid = storedE164Phone === inputE164Phone;
                }
            }
            if (!isValid) {
                errors.phoneOrEmail = translate('closeAccountPage.enterYourDefaultContactMethod');
            }
        }
        return errors;
    };
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom testID={CloseAccountPage.displayName}>
            <DelegateNoAccessWrapper_1.default accessDeniedVariants={[CONST_1.default.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton_1.default title={translate('closeAccountPage.closeAccount')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.CLOSE_ACCOUNT_FORM} validate={validate} onSubmit={showConfirmModal} submitButtonText={translate('closeAccountPage.closeAccount')} style={[styles.flexGrow1, styles.mh5]} isSubmitActionDangerous>
                    <react_native_1.View fsClass={CONST_1.default.FULL_STORY.UNMASK} testID={CONST_1.default.FULL_STORY.UNMASK} style={[styles.flexGrow1]}>
                        <Text_1.default>{translate('closeAccountPage.reasonForLeavingPrompt')}</Text_1.default>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={CloseAccountForm_1.default.REASON_FOR_LEAVING} autoGrowHeight maxAutoGrowHeight={variables_1.default.textInputAutoGrowMaxHeight} label={translate('closeAccountPage.enterMessageHere')} aria-label={translate('closeAccountPage.enterMessageHere')} role={CONST_1.default.ROLE.PRESENTATION} containerStyles={[styles.mt5]} fsClass={CONST_1.default.FULL_STORY.UNMASK} testID={CONST_1.default.FULL_STORY.UNMASK}/>
                        <Text_1.default style={[styles.mt5]}>
                            {translate('closeAccountPage.enterDefaultContactToConfirm')} <Text_1.default style={[styles.textStrong]}>{userEmailOrPhone}</Text_1.default>
                        </Text_1.default>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={CloseAccountForm_1.default.PHONE_OR_EMAIL} autoCapitalize="none" label={translate('closeAccountPage.enterDefaultContact')} aria-label={translate('closeAccountPage.enterDefaultContact')} role={CONST_1.default.ROLE.PRESENTATION} containerStyles={[styles.mt5]} autoCorrect={false} inputMode={userEmailOrPhone && expensify_common_1.Str.isValidEmail(userEmailOrPhone) ? CONST_1.default.INPUT_MODE.EMAIL : CONST_1.default.INPUT_MODE.TEXT} fsClass={CONST_1.default.FULL_STORY.UNMASK} testID={CONST_1.default.FULL_STORY.UNMASK}/>
                        <ConfirmModal_1.default danger title={translate('closeAccountPage.closeAccountWarning')} onConfirm={onConfirm} onCancel={hideConfirmModal} isVisible={isConfirmModalVisible} prompt={translate('closeAccountPage.closeAccountPermanentlyDeleteData')} confirmText={translate('common.yesContinue')} cancelText={translate('common.cancel')} shouldDisableConfirmButtonWhenOffline shouldShowCancelButton/>
                    </react_native_1.View>
                </FormProvider_1.default>
            </DelegateNoAccessWrapper_1.default>
        </ScreenWrapper_1.default>);
}
CloseAccountPage.displayName = 'CloseAccountPage';
exports.default = CloseAccountPage;
