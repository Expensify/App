"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ValidateCodeActionModal_1 = require("@components/ValidateCodeActionModal");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var FormActions_1 = require("@libs/actions/FormActions");
var PersonalDetails_1 = require("@libs/actions/PersonalDetails");
var User_1 = require("@libs/actions/User");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function MissingPersonalDetailsMagicCodeModal(_a) {
    var _b, _c, _d;
    var onClose = _a.onClose, isValidateCodeActionModalVisible = _a.isValidateCodeActionModalVisible, handleSubmitForm = _a.handleSubmitForm;
    var translate = (0, useLocalize_1.default)().translate;
    var privatePersonalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS, { canBeMissing: true })[0];
    var cardList = (0, useOnyx_1.default)(ONYXKEYS_1.default.CARD_LIST, { canBeMissing: true })[0];
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var validateCodeAction = (0, useOnyx_1.default)(ONYXKEYS_1.default.VALIDATE_ACTION_CODE, { canBeMissing: true })[0];
    var privateDetailsErrors = (_b = privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.errors) !== null && _b !== void 0 ? _b : undefined;
    var validateLoginError = (0, ErrorUtils_1.getLatestError)(privateDetailsErrors);
    var primaryLogin = (_c = account === null || account === void 0 ? void 0 : account.primaryLogin) !== null && _c !== void 0 ? _c : '';
    var areAllCardsShipped = (_d = Object.values(cardList !== null && cardList !== void 0 ? cardList : {})) === null || _d === void 0 ? void 0 : _d.every(function (card) { return (card === null || card === void 0 ? void 0 : card.state) !== CONST_1.default.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED; });
    var missingDetails = !(privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.legalFirstName) ||
        !(privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.legalLastName) ||
        !(privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.dob) ||
        !(privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.phoneNumber) ||
        (0, EmptyObject_1.isEmptyObject)(privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.addresses) ||
        privatePersonalDetails.addresses.length === 0;
    (0, react_1.useEffect)(function () {
        if (missingDetails || !!privateDetailsErrors || !areAllCardsShipped) {
            return;
        }
        (0, FormActions_1.clearDraftValues)(ONYXKEYS_1.default.FORMS.PERSONAL_DETAILS_FORM);
        Navigation_1.default.goBack();
    }, [missingDetails, privateDetailsErrors, areAllCardsShipped]);
    var onBackButtonPress = function () {
        onClose === null || onClose === void 0 ? void 0 : onClose();
    };
    var clearError = function () {
        if ((0, EmptyObject_1.isEmptyObject)(validateLoginError) && (0, EmptyObject_1.isEmptyObject)(validateCodeAction === null || validateCodeAction === void 0 ? void 0 : validateCodeAction.errorFields)) {
            return;
        }
        (0, PersonalDetails_1.clearPersonalDetailsErrors)();
    };
    return (<ValidateCodeActionModal_1.default clearError={clearError} onClose={onBackButtonPress} validateCodeActionErrorField="personalDetails" validateError={validateLoginError} isVisible={isValidateCodeActionModalVisible} title={translate('cardPage.validateCardTitle')} descriptionPrimary={translate('cardPage.enterMagicCode', { contactMethod: primaryLogin })} sendValidateCode={function () { return (0, User_1.requestValidateCodeAction)(); }} handleSubmitForm={handleSubmitForm} isLoading={privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.isLoading}/>);
}
MissingPersonalDetailsMagicCodeModal.displayName = 'MissingPersonalDetailsMagicCodeModal';
exports.default = MissingPersonalDetailsMagicCodeModal;
