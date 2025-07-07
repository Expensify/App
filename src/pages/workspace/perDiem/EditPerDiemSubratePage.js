"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var PerDiem_1 = require("@userActions/Policy/PerDiem");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var WorkspacePerDiemForm_1 = require("@src/types/form/WorkspacePerDiemForm");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function EditPerDiemSubratePage(_a) {
    var _b, _c;
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = route.params.policyID;
    var rateID = route.params.rateID;
    var subRateID = route.params.subRateID;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID))[0];
    var customUnit = (0, PolicyUtils_1.getPerDiemCustomUnit)(policy);
    var selectedRate = (_b = customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates) === null || _b === void 0 ? void 0 : _b[rateID];
    var selectedSubrate = (_c = selectedRate === null || selectedRate === void 0 ? void 0 : selectedRate.subRates) === null || _c === void 0 ? void 0 : _c.find(function (subRate) { return subRate.id === subRateID; });
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        var subrateTrimmed = values.subrate.trim();
        if (!subrateTrimmed) {
            errors.subrate = translate('common.error.fieldRequired');
        }
        else if (subrateTrimmed.length > CONST_1.default.MAX_LENGTH_256) {
            errors.subrate = translate('common.error.characterLimitExceedCounter', { length: subrateTrimmed.length, limit: CONST_1.default.MAX_LENGTH_256 });
        }
        return errors;
    }, [translate]);
    var editSubrate = (0, react_1.useCallback)(function (values) {
        var newSubrate = values.subrate.trim();
        if (newSubrate !== (selectedSubrate === null || selectedSubrate === void 0 ? void 0 : selectedSubrate.name)) {
            (0, PerDiem_1.editPerDiemRateSubrate)(policyID, rateID, subRateID, customUnit, newSubrate);
        }
        Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_PER_DIEM_DETAILS.getRoute(policyID, rateID, subRateID));
    }, [selectedSubrate === null || selectedSubrate === void 0 ? void 0 : selectedSubrate.name, policyID, rateID, subRateID, customUnit]);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED} shouldBeBlocked={!policyID || !rateID || (0, EmptyObject_1.isEmptyObject)(selectedRate) || (0, EmptyObject_1.isEmptyObject)(selectedSubrate)}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={EditPerDiemSubratePage.displayName} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('common.subrate')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_PER_DIEM_DETAILS.getRoute(policyID, rateID, subRateID)); }}/>
                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.WORKSPACE_PER_DIEM_FORM} validate={validate} onSubmit={editSubrate} submitButtonText={translate('common.save')} style={[styles.mh5, styles.flex1]} enabledWhenOffline shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <InputWrapper_1.default ref={inputCallbackRef} InputComponent={TextInput_1.default} defaultValue={selectedSubrate === null || selectedSubrate === void 0 ? void 0 : selectedSubrate.name} label={translate('common.subrate')} accessibilityLabel={translate('common.subrate')} inputID={WorkspacePerDiemForm_1.default.SUBRATE} role={CONST_1.default.ROLE.PRESENTATION}/>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
EditPerDiemSubratePage.displayName = 'EditPerDiemSubratePage';
exports.default = EditPerDiemSubratePage;
