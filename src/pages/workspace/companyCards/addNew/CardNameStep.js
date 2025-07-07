"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var CompanyCards_1 = require("@userActions/CompanyCards");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var AddNewCardFeedForm_1 = require("@src/types/form/AddNewCardFeedForm");
function CardNameStep() {
    var _a;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var addNewCard = (0, useOnyx_1.default)(ONYXKEYS_1.default.ADD_NEW_COMPANY_CARD, { canBeMissing: true })[0];
    var validate = function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, [AddNewCardFeedForm_1.default.CARD_TITLE]);
        var length = values.cardTitle.length;
        if (length > CONST_1.default.STANDARD_LENGTH_LIMIT) {
            (0, ErrorUtils_1.addErrorMessage)(errors, AddNewCardFeedForm_1.default.CARD_TITLE, translate('common.error.characterLimitExceedCounter', { length: length, limit: CONST_1.default.STANDARD_LENGTH_LIMIT }));
        }
        return errors;
    };
    var submit = function (values) {
        (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({
            step: CONST_1.default.COMPANY_CARDS.STEP.CARD_DETAILS,
            data: {
                bankName: values.cardTitle,
            },
            isEditing: false,
        });
    };
    var handleBackButtonPress = function () {
        (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({ step: CONST_1.default.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS });
    };
    return (<ScreenWrapper_1.default testID={CardNameStep.displayName} enableEdgeToEdgeBottomSafeAreaPadding shouldEnablePickerAvoiding={false} shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={translate('workspace.companyCards.addCards')} onBackButtonPress={handleBackButtonPress}/>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.addNewCard.whatBankIssuesCard')}</Text_1.default>
            <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.ADD_NEW_CARD_FEED_FORM} submitButtonText={translate('common.next')} onSubmit={submit} validate={validate} style={[styles.mh5, styles.flexGrow1]} enabledWhenOffline shouldHideFixErrorsAlert addBottomSafeAreaPadding shouldPreventDefaultFocusOnPressSubmit>
                <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={AddNewCardFeedForm_1.default.CARD_TITLE} label={translate('workspace.companyCards.addNewCard.enterNameOfBank')} role={CONST_1.default.ROLE.PRESENTATION} defaultValue={(_a = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _a === void 0 ? void 0 : _a.bankName} containerStyles={[styles.mb6]} ref={inputCallbackRef}/>
            </FormProvider_1.default>
        </ScreenWrapper_1.default>);
}
CardNameStep.displayName = 'CardNameStep';
exports.default = CardNameStep;
