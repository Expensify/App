"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var InteractiveStepWrapper_1 = require("@components/InteractiveStepWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useSubStep_1 = require("@hooks/useSubStep");
var FormActions_1 = require("@userActions/FormActions");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var Confirmation_1 = require("./subSteps/Confirmation");
var bodyContent = [Confirmation_1.default];
function Country(_a) {
    var onBackButtonPress = _a.onBackButtonPress, onSubmit = _a.onSubmit, policyID = _a.policyID;
    var translate = (0, useLocalize_1.default)().translate;
    var submit = function () {
        onSubmit();
    };
    var _b = (0, useSubStep_1.default)({ bodyContent: bodyContent, startFrom: 0, onFinished: submit }), SubStep = _b.componentToRender, isEditing = _b.isEditing, screenIndex = _b.screenIndex, nextScreen = _b.nextScreen, prevScreen = _b.prevScreen, moveTo = _b.moveTo, goToTheLastStep = _b.goToTheLastStep;
    var handleBackButtonPress = function () {
        (0, FormActions_1.clearErrors)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
        if (isEditing) {
            goToTheLastStep();
            return;
        }
        if (screenIndex === 0) {
            onBackButtonPress();
        }
        else {
            prevScreen();
        }
    };
    return (<InteractiveStepWrapper_1.default wrapperID={Country.displayName} handleBackButtonPress={handleBackButtonPress} headerTitle={translate('countryStep.confirmCurrency')} stepNames={CONST_1.default.NON_USD_BANK_ACCOUNT.STEP_NAMES} startStepIndex={0}>
            <SubStep isEditing={isEditing} onNext={nextScreen} onMove={moveTo} policyID={policyID}/>
        </InteractiveStepWrapper_1.default>);
}
Country.displayName = 'Country';
exports.default = Country;
