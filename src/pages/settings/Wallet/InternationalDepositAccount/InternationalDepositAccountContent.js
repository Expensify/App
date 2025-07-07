"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useHandleBackButton_1 = require("@hooks/useHandleBackButton");
var useLocalize_1 = require("@hooks/useLocalize");
var useRootNavigationState_1 = require("@hooks/useRootNavigationState");
var useSubStep_1 = require("@hooks/useSubStep");
var FormActions_1 = require("@libs/actions/FormActions");
var isNavigatorName_1 = require("@libs/Navigation/helpers/isNavigatorName");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var AccountHolderInformation_1 = require("./substeps/AccountHolderInformation");
var AccountType_1 = require("./substeps/AccountType");
var BankAccountDetails_1 = require("./substeps/BankAccountDetails");
var BankInformation_1 = require("./substeps/BankInformation");
var Confirmation_1 = require("./substeps/Confirmation");
var CountrySelection_1 = require("./substeps/CountrySelection");
var Success_1 = require("./substeps/Success");
var utils_1 = require("./utils");
var formSteps = [CountrySelection_1.default, BankAccountDetails_1.default, AccountType_1.default, BankInformation_1.default, AccountHolderInformation_1.default, Confirmation_1.default, Success_1.default];
function getSkippedSteps(skipAccountTypeStep, skipAccountHolderInformationStep) {
    var skippedSteps = [];
    if (skipAccountTypeStep) {
        skippedSteps.push(CONST_1.default.CORPAY_FIELDS.INDEXES.MAPPING.ACCOUNT_TYPE);
    }
    if (skipAccountHolderInformationStep) {
        skippedSteps.push(CONST_1.default.CORPAY_FIELDS.INDEXES.MAPPING.ACCOUNT_HOLDER_INFORMATION);
    }
    return skippedSteps;
}
function InternationalDepositAccountContent(_a) {
    var privatePersonalDetails = _a.privatePersonalDetails, corpayFields = _a.corpayFields, bankAccountList = _a.bankAccountList, draftValues = _a.draftValues, country = _a.country, isAccountLoading = _a.isAccountLoading;
    var translate = (0, useLocalize_1.default)().translate;
    var fieldsMap = (0, react_1.useMemo)(function () { return (0, utils_1.getFieldsMap)(corpayFields); }, [corpayFields]);
    var values = (0, react_1.useMemo)(function () { return (0, utils_1.getSubstepValues)(privatePersonalDetails, corpayFields, bankAccountList, draftValues, country, fieldsMap); }, [privatePersonalDetails, corpayFields, bankAccountList, draftValues, country, fieldsMap]);
    var initialAccountHolderDetailsValues = (0, react_1.useMemo)(function () { return (0, utils_1.getInitialPersonalDetailsValues)(privatePersonalDetails); }, [privatePersonalDetails]);
    var startFrom = (0, react_1.useMemo)(function () { return (0, utils_1.getInitialSubstep)(values, fieldsMap); }, [fieldsMap, values]);
    var skipAccountTypeStep = (0, EmptyObject_1.isEmptyObject)(fieldsMap[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_TYPE]);
    var skipAccountHolderInformationStep = (0, utils_1.testValidation)(initialAccountHolderDetailsValues, fieldsMap[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION]);
    var skippedSteps = getSkippedSteps(skipAccountTypeStep, skipAccountHolderInformationStep);
    var topmostFullScreenRoute = (0, useRootNavigationState_1.default)(function (state) { return state.routes.findLast(function (route) { return (0, isNavigatorName_1.isFullScreenName)(route.name); }); });
    var goBack = (0, react_1.useCallback)(function () {
        switch (topmostFullScreenRoute === null || topmostFullScreenRoute === void 0 ? void 0 : topmostFullScreenRoute.name) {
            case NAVIGATORS_1.default.SETTINGS_SPLIT_NAVIGATOR:
                Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_WALLET);
                break;
            case NAVIGATORS_1.default.REPORTS_SPLIT_NAVIGATOR:
                Navigation_1.default.closeRHPFlow();
                break;
            default:
                Navigation_1.default.goBack();
                break;
        }
    }, [topmostFullScreenRoute === null || topmostFullScreenRoute === void 0 ? void 0 : topmostFullScreenRoute.name]);
    var handleFinishStep = (0, react_1.useCallback)(function () {
        (0, FormActions_1.clearDraftValues)(ONYXKEYS_1.default.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
        goBack();
    }, [goBack]);
    var _b = (0, useSubStep_1.default)({ bodyContent: formSteps, startFrom: startFrom, onFinished: handleFinishStep, skipSteps: skippedSteps }), SubStep = _b.componentToRender, isEditing = _b.isEditing, nextScreen = _b.nextScreen, prevScreen = _b.prevScreen, screenIndex = _b.screenIndex, moveTo = _b.moveTo, resetScreenIndex = _b.resetScreenIndex;
    var handleBackButtonPress = function () {
        if (isEditing) {
            resetScreenIndex(CONST_1.default.CORPAY_FIELDS.INDEXES.MAPPING.CONFIRMATION);
            return true;
        }
        // Clicking back on the first screen should dismiss the modal
        if (screenIndex === CONST_1.default.CORPAY_FIELDS.INDEXES.MAPPING.COUNTRY_SELECTOR) {
            (0, FormActions_1.clearDraftValues)(ONYXKEYS_1.default.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
            goBack();
            return true;
        }
        // Clicking back on the success screen should dismiss the modal
        if (screenIndex === CONST_1.default.CORPAY_FIELDS.INDEXES.MAPPING.SUCCESS) {
            (0, FormActions_1.clearDraftValues)(ONYXKEYS_1.default.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
            goBack();
            return true;
        }
        prevScreen();
        return true;
    };
    (0, useHandleBackButton_1.default)(handleBackButtonPress);
    var handleNextScreen = (0, react_1.useCallback)(function () {
        if (isEditing) {
            resetScreenIndex(CONST_1.default.CORPAY_FIELDS.INDEXES.MAPPING.CONFIRMATION);
            return;
        }
        nextScreen();
    }, [resetScreenIndex, isEditing, nextScreen]);
    if (isAccountLoading) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    return (<ScreenWrapper_1.default shouldEnableMaxHeight testID={InternationalDepositAccountContent.displayName}>
            <HeaderWithBackButton_1.default title={translate('bankAccount.addBankAccount')} onBackButtonPress={handleBackButtonPress}/>
            <SubStep isEditing={isEditing} onNext={handleNextScreen} onMove={moveTo} screenIndex={screenIndex} resetScreenIndex={resetScreenIndex} formValues={values} fieldsMap={fieldsMap}/>
        </ScreenWrapper_1.default>);
}
InternationalDepositAccountContent.displayName = 'InternationalDepositAccountContent';
exports.default = InternationalDepositAccountContent;
