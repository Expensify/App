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
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var CompanyCards_1 = require("@userActions/CompanyCards");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EditExpensifyCardNameForm_1 = require("@src/types/form/EditExpensifyCardNameForm");
function CardNameStep(_a) {
    var policyID = _a.policyID;
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var styles = (0, useThemeStyles_1.default)();
    var assignCard = (0, useOnyx_1.default)(ONYXKEYS_1.default.ASSIGN_CARD)[0];
    var data = assignCard === null || assignCard === void 0 ? void 0 : assignCard.data;
    var submit = function (values) {
        (0, CompanyCards_1.setAssignCardStepAndData)({
            currentStep: CONST_1.default.COMPANY_CARD.STEP.CONFIRMATION,
            data: {
                cardName: values.name,
            },
            isEditing: false,
        });
    };
    var validate = function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, [EditExpensifyCardNameForm_1.default.NAME]);
        var length = values.name.length;
        if (length > CONST_1.default.STANDARD_LENGTH_LIMIT) {
            (0, ErrorUtils_1.addErrorMessage)(errors, EditExpensifyCardNameForm_1.default.NAME, translate('common.error.characterLimitExceedCounter', { length: length, limit: CONST_1.default.STANDARD_LENGTH_LIMIT }));
        }
        return errors;
    };
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}>
            <ScreenWrapper_1.default testID={CardNameStep.displayName} shouldEnablePickerAvoiding={false} enableEdgeToEdgeBottomSafeAreaPadding>
                <HeaderWithBackButton_1.default title={translate('workspace.moreFeatures.companyCards.cardName')} onBackButtonPress={function () { return (0, CompanyCards_1.setAssignCardStepAndData)({ currentStep: CONST_1.default.COMPANY_CARD.STEP.CONFIRMATION, isEditing: false }); }}/>
                <Text_1.default style={[styles.mh5, styles.mt3, styles.mb5]}>{translate('workspace.moreFeatures.companyCards.giveItNameInstruction')}</Text_1.default>
                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.EDIT_WORKSPACE_COMPANY_CARD_NAME_FORM} submitButtonText={translate('common.confirm')} onSubmit={submit} style={[styles.flex1, styles.mh5]} enabledWhenOffline validate={validate} shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={EditExpensifyCardNameForm_1.default.NAME} label={translate('workspace.moreFeatures.companyCards.cardName')} aria-label={translate('workspace.moreFeatures.companyCards.cardName')} role={CONST_1.default.ROLE.PRESENTATION} defaultValue={data === null || data === void 0 ? void 0 : data.cardName} ref={inputCallbackRef}/>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
CardNameStep.displayName = 'CardNameStep';
exports.default = CardNameStep;
