"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var InteractiveStepWrapper_1 = require("@components/InteractiveStepWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useSubStep_1 = require("@hooks/useSubStep");
var PhoneNumber_1 = require("@libs/PhoneNumber");
var IdologyQuestions_1 = require("@pages/EnablePayments/IdologyQuestions");
var getInitialSubstepForPersonalInfo_1 = require("@pages/EnablePayments/utils/getInitialSubstepForPersonalInfo");
var getSubstepValues_1 = require("@pages/EnablePayments/utils/getSubstepValues");
var Wallet = require("@userActions/Wallet");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var WalletAdditionalDetailsForm_1 = require("@src/types/form/WalletAdditionalDetailsForm");
var AddressStep_1 = require("./substeps/AddressStep");
var ConfirmationStep_1 = require("./substeps/ConfirmationStep");
var DateOfBirthStep_1 = require("./substeps/DateOfBirthStep");
var LegalNameStep_1 = require("./substeps/LegalNameStep");
var PhoneNumberStep_1 = require("./substeps/PhoneNumberStep");
var SocialSecurityNumberStep_1 = require("./substeps/SocialSecurityNumberStep");
var PERSONAL_INFO_STEP_KEYS = WalletAdditionalDetailsForm_1.default.PERSONAL_INFO_STEP;
var bodyContent = [LegalNameStep_1.default, DateOfBirthStep_1.default, AddressStep_1.default, PhoneNumberStep_1.default, SocialSecurityNumberStep_1.default, ConfirmationStep_1.default];
function PersonalInfoPage() {
    var _a, _b;
    var translate = (0, useLocalize_1.default)().translate;
    var walletAdditionalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.WALLET_ADDITIONAL_DETAILS)[0];
    var walletAdditionalDetailsDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.WALLET_ADDITIONAL_DETAILS_DRAFT)[0];
    var showIdologyQuestions = (walletAdditionalDetails === null || walletAdditionalDetails === void 0 ? void 0 : walletAdditionalDetails.questions) && (walletAdditionalDetails === null || walletAdditionalDetails === void 0 ? void 0 : walletAdditionalDetails.questions.length) > 0;
    var values = (0, react_1.useMemo)(function () { return (0, getSubstepValues_1.default)(PERSONAL_INFO_STEP_KEYS, walletAdditionalDetailsDraft, walletAdditionalDetails); }, [walletAdditionalDetails, walletAdditionalDetailsDraft]);
    var submit = function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        var personalDetails = {
            phoneNumber: (_b = (values.phoneNumber && ((_a = (0, PhoneNumber_1.parsePhoneNumber)(values.phoneNumber, { regionCode: CONST_1.default.COUNTRY.US }).number) === null || _a === void 0 ? void 0 : _a.significant))) !== null && _b !== void 0 ? _b : '',
            legalFirstName: (_c = values === null || values === void 0 ? void 0 : values[PERSONAL_INFO_STEP_KEYS.FIRST_NAME]) !== null && _c !== void 0 ? _c : '',
            legalLastName: (_d = values === null || values === void 0 ? void 0 : values[PERSONAL_INFO_STEP_KEYS.LAST_NAME]) !== null && _d !== void 0 ? _d : '',
            addressStreet: (_e = values === null || values === void 0 ? void 0 : values[PERSONAL_INFO_STEP_KEYS.STREET]) !== null && _e !== void 0 ? _e : '',
            addressCity: (_f = values === null || values === void 0 ? void 0 : values[PERSONAL_INFO_STEP_KEYS.CITY]) !== null && _f !== void 0 ? _f : '',
            addressState: (_g = values === null || values === void 0 ? void 0 : values[PERSONAL_INFO_STEP_KEYS.STATE]) !== null && _g !== void 0 ? _g : '',
            addressZip: (_h = values === null || values === void 0 ? void 0 : values[PERSONAL_INFO_STEP_KEYS.ZIP_CODE]) !== null && _h !== void 0 ? _h : '',
            dob: (_j = values === null || values === void 0 ? void 0 : values[PERSONAL_INFO_STEP_KEYS.DOB]) !== null && _j !== void 0 ? _j : '',
            ssn: (_k = values === null || values === void 0 ? void 0 : values[PERSONAL_INFO_STEP_KEYS.SSN_LAST_4]) !== null && _k !== void 0 ? _k : '',
        };
        // Attempt to set the personal details
        Wallet.updatePersonalDetails(personalDetails);
    };
    var startFrom = (0, react_1.useMemo)(function () { return (0, getInitialSubstepForPersonalInfo_1.default)(values); }, [values]);
    var _c = (0, useSubStep_1.default)({
        bodyContent: bodyContent,
        startFrom: startFrom,
        onFinished: submit,
    }), SubStep = _c.componentToRender, isEditing = _c.isEditing, nextScreen = _c.nextScreen, prevScreen = _c.prevScreen, moveTo = _c.moveTo, screenIndex = _c.screenIndex, goToTheLastStep = _c.goToTheLastStep;
    var handleBackButtonPress = function () {
        if (isEditing) {
            goToTheLastStep();
            return;
        }
        if (screenIndex === 0) {
            Wallet.updateCurrentStep(CONST_1.default.WALLET.STEP.ADD_BANK_ACCOUNT);
            return;
        }
        if (showIdologyQuestions) {
            Wallet.setAdditionalDetailsQuestions(null, '');
            return;
        }
        prevScreen();
    };
    return (<InteractiveStepWrapper_1.default wrapperID={PersonalInfoPage.displayName} headerTitle={translate('personalInfoStep.personalInfo')} handleBackButtonPress={handleBackButtonPress} startStepIndex={1} stepNames={CONST_1.default.WALLET.STEP_NAMES}>
            {showIdologyQuestions ? (<IdologyQuestions_1.default questions={(_a = walletAdditionalDetails === null || walletAdditionalDetails === void 0 ? void 0 : walletAdditionalDetails.questions) !== null && _a !== void 0 ? _a : []} idNumber={(_b = walletAdditionalDetails === null || walletAdditionalDetails === void 0 ? void 0 : walletAdditionalDetails.idNumber) !== null && _b !== void 0 ? _b : ''}/>) : (<SubStep isEditing={isEditing} onNext={nextScreen} onMove={moveTo}/>)}
        </InteractiveStepWrapper_1.default>);
}
PersonalInfoPage.displayName = 'PersonalInfoPage';
exports.default = PersonalInfoPage;
