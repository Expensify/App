"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
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
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var PerDiem_1 = require("@userActions/Policy/PerDiem");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var WorkspacePerDiemForm_1 = require("@src/types/form/WorkspacePerDiemForm");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function EditPerDiemDestinationPage(_a) {
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
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        var destinationTrimmed = values.destination.trim();
        if (!destinationTrimmed) {
            errors.destination = translate('common.error.fieldRequired');
        }
        else if (destinationTrimmed.length > CONST_1.default.MAX_LENGTH_256) {
            errors.destination = translate('common.error.characterLimitExceedCounter', { length: destinationTrimmed.length, limit: CONST_1.default.MAX_LENGTH_256 });
        }
        return errors;
    }, [translate]);
    var editDestination = (0, react_1.useCallback)(function (values) {
        var newDestination = values.destination.trim();
        if (newDestination !== (selectedRate === null || selectedRate === void 0 ? void 0 : selectedRate.name)) {
            (0, PerDiem_1.editPerDiemRateDestination)(policyID, rateID, customUnit, newDestination);
        }
        Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_PER_DIEM_DETAILS.getRoute(policyID, rateID, subRateID));
    }, [selectedRate === null || selectedRate === void 0 ? void 0 : selectedRate.name, policyID, rateID, subRateID, customUnit]);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED} shouldBeBlocked={!policyID || !rateID || (0, EmptyObject_1.isEmptyObject)(selectedRate)}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={EditPerDiemDestinationPage.displayName} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('common.destination')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_PER_DIEM_DETAILS.getRoute(policyID, rateID, subRateID)); }}/>
                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.WORKSPACE_PER_DIEM_FORM} validate={validate} onSubmit={editDestination} submitButtonText={translate('common.save')} style={[styles.mh5, styles.flex1]} enabledWhenOffline shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <react_native_1.View style={styles.pb4}>
                        <Text_1.default style={[styles.sidebarLinkText, styles.optionAlternateText]}>
                            {translate('workspace.perDiem.editDestinationSubtitle', { destination: (_c = selectedRate === null || selectedRate === void 0 ? void 0 : selectedRate.name) !== null && _c !== void 0 ? _c : '' })}
                        </Text_1.default>
                    </react_native_1.View>
                    <InputWrapper_1.default ref={inputCallbackRef} InputComponent={TextInput_1.default} defaultValue={selectedRate === null || selectedRate === void 0 ? void 0 : selectedRate.name} label={translate('common.destination')} accessibilityLabel={translate('common.destination')} inputID={WorkspacePerDiemForm_1.default.DESTINATION} role={CONST_1.default.ROLE.PRESENTATION}/>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
EditPerDiemDestinationPage.displayName = 'EditPerDiemDestinationPage';
exports.default = EditPerDiemDestinationPage;
