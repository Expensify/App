"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var InteractiveStepSubHeader_1 = require("@components/InteractiveStepSubHeader");
var useSubStep_1 = require("@hooks/useSubStep");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Connections = require("@libs/actions/connections/NetSuiteCommands");
var FormActions = require("@libs/actions/FormActions");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var NetSuiteCustomFieldForm_1 = require("@src/types/form/NetSuiteCustomFieldForm");
var customUtils_1 = require("./customUtils");
var ChooseSegmentTypeStep_1 = require("./substeps/ChooseSegmentTypeStep");
var ConfirmCustomSegmentList_1 = require("./substeps/ConfirmCustomSegmentList");
var CustomSegmentInternalIdStep_1 = require("./substeps/CustomSegmentInternalIdStep");
var CustomSegmentMappingStep_1 = require("./substeps/CustomSegmentMappingStep");
var CustomSegmentNameStep_1 = require("./substeps/CustomSegmentNameStep");
var CustomSegmentScriptIdStep_1 = require("./substeps/CustomSegmentScriptIdStep");
var formSteps = [ChooseSegmentTypeStep_1.default, CustomSegmentNameStep_1.default, CustomSegmentInternalIdStep_1.default, CustomSegmentScriptIdStep_1.default, CustomSegmentMappingStep_1.default, ConfirmCustomSegmentList_1.default];
function NetSuiteImportAddCustomSegmentContent(_a) {
    var _b, _c, _d, _e;
    var policy = _a.policy, draftValues = _a.draftValues;
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var styles = (0, useThemeStyles_1.default)();
    var ref = (0, react_1.useRef)(null);
    var formRef = (0, react_1.useRef)(null);
    var config = (_e = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.netsuite) === null || _d === void 0 ? void 0 : _d.options) === null || _e === void 0 ? void 0 : _e.config;
    var customSegments = (0, react_1.useMemo)(function () { var _a, _b; return (_b = (_a = config === null || config === void 0 ? void 0 : config.syncOptions) === null || _a === void 0 ? void 0 : _a.customSegments) !== null && _b !== void 0 ? _b : []; }, [config === null || config === void 0 ? void 0 : config.syncOptions]);
    var _f = (0, react_1.useState)(), customSegmentType = _f[0], setCustomSegmentType = _f[1];
    var values = (0, react_1.useMemo)(function () { return (0, customUtils_1.getSubstepValues)(draftValues); }, [draftValues]);
    var startFrom = (0, react_1.useMemo)(function () { return (0, customUtils_1.getCustomSegmentInitialSubstep)(values); }, [values]);
    var handleFinishStep = (0, react_1.useCallback)(function () {
        react_native_1.InteractionManager.runAfterInteractions(function () {
            var _a;
            var updatedCustomSegments = customSegments.concat([
                {
                    segmentName: values[NetSuiteCustomFieldForm_1.default.SEGMENT_NAME],
                    internalID: values[NetSuiteCustomFieldForm_1.default.INTERNAL_ID],
                    scriptID: values[NetSuiteCustomFieldForm_1.default.SCRIPT_ID],
                    mapping: (_a = values[NetSuiteCustomFieldForm_1.default.MAPPING]) !== null && _a !== void 0 ? _a : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG,
                },
            ]);
            Connections.updateNetSuiteCustomSegments(policyID, updatedCustomSegments, customSegments, "".concat(CONST_1.default.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_SEGMENTS, "_").concat(customSegments.length), CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD);
            FormActions.clearDraftValues(ONYXKEYS_1.default.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM);
            Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING.getRoute(policyID, CONST_1.default.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_SEGMENTS));
        });
    }, [values, customSegments, policyID]);
    var _g = (0, useSubStep_1.default)({ bodyContent: formSteps, startFrom: startFrom, onFinished: handleFinishStep }), SubStep = _g.componentToRender, isEditing = _g.isEditing, nextScreen = _g.nextScreen, prevScreen = _g.prevScreen, screenIndex = _g.screenIndex, moveTo = _g.moveTo, goToTheLastStep = _g.goToTheLastStep;
    var handleBackButtonPress = function () {
        var _a, _b;
        if (isEditing) {
            goToTheLastStep();
            return;
        }
        // Clicking back on the first screen should go back to listing
        if (screenIndex === CONST_1.default.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.SEGMENT_TYPE) {
            FormActions.clearDraftValues(ONYXKEYS_1.default.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM);
            Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING.getRoute(policyID, CONST_1.default.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_SEGMENTS));
            return;
        }
        (_a = ref.current) === null || _a === void 0 ? void 0 : _a.movePrevious();
        (_b = formRef.current) === null || _b === void 0 ? void 0 : _b.resetErrors();
        prevScreen();
    };
    var handleNextScreen = (0, react_1.useCallback)(function () {
        var _a;
        if (isEditing) {
            goToTheLastStep();
            return;
        }
        (_a = ref.current) === null || _a === void 0 ? void 0 : _a.moveNext();
        nextScreen();
    }, [goToTheLastStep, isEditing, nextScreen]);
    return (<ConnectionLayout_1.default displayName={NetSuiteImportAddCustomSegmentContent.displayName} headerTitle={"workspace.netsuite.import.importCustomFields.customSegments.".concat(customSegmentType ? "addForm.".concat(customSegmentType, "AddTitle") : 'addText')} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={[styles.flex1]} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE} onBackButtonPress={handleBackButtonPress} shouldUseScrollView={false}>
            <react_native_1.View style={[styles.ph5, styles.mb3, styles.mt3, { height: CONST_1.default.NETSUITE_FORM_STEPS_HEADER_HEIGHT }]}>
                <InteractiveStepSubHeader_1.default ref={ref} startStepIndex={startFrom} stepNames={CONST_1.default.NETSUITE_CONFIG.NETSUITE_ADD_CUSTOM_SEGMENT_STEP_NAMES}/>
            </react_native_1.View>
            <react_native_1.View style={[styles.flex1, styles.mt3]}>
                <SubStep isEditing={isEditing} onNext={handleNextScreen} onMove={moveTo} screenIndex={screenIndex} policyID={policyID} policy={policy} importCustomField={CONST_1.default.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_SEGMENTS} customSegmentType={customSegmentType} setCustomSegmentType={setCustomSegmentType} netSuiteCustomFieldFormValues={values} customSegments={customSegments}/>
            </react_native_1.View>
        </ConnectionLayout_1.default>);
}
NetSuiteImportAddCustomSegmentContent.displayName = 'NetSuiteImportAddCustomSegmentContent';
exports.default = NetSuiteImportAddCustomSegmentContent;
