"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var InteractiveStepSubHeader_1 = require("@components/InteractiveStepSubHeader");
var useSubStep_1 = require("@hooks/useSubStep");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var connections_1 = require("@libs/actions/connections");
var Navigation_1 = require("@libs/Navigation/Navigation");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var CONST_1 = require("@src/CONST");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var NetSuiteTokenInputForm_1 = require("./substeps/NetSuiteTokenInputForm");
var NetSuiteTokenSetupContent_1 = require("./substeps/NetSuiteTokenSetupContent");
var staticContentSteps = Array(4).fill(NetSuiteTokenSetupContent_1.default);
var tokenInputSteps = __spreadArray(__spreadArray([], staticContentSteps, true), [NetSuiteTokenInputForm_1.default], false);
function NetSuiteTokenInputPage(_a) {
    var _b, _c;
    var policy = _a.policy;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var styles = (0, useThemeStyles_1.default)();
    var ref = (0, react_1.useRef)(null);
    var submit = function () {
        Navigation_1.default.dismissModal();
    };
    var _d = (0, useSubStep_1.default)({ bodyContent: tokenInputSteps, startFrom: 0, onFinished: submit }), SubStep = _d.componentToRender, isEditing = _d.isEditing, nextScreen = _d.nextScreen, prevScreen = _d.prevScreen, screenIndex = _d.screenIndex, moveTo = _d.moveTo;
    var handleBackButtonPress = function () {
        var _a;
        if (screenIndex === 0) {
            Navigation_1.default.goBack();
            return;
        }
        (_a = ref.current) === null || _a === void 0 ? void 0 : _a.movePrevious();
        prevScreen();
    };
    var handleNextScreen = function () {
        var _a;
        (_a = ref.current) === null || _a === void 0 ? void 0 : _a.moveNext();
        nextScreen();
    };
    var shouldPageBeBlocked = !(0, EmptyObject_1.isEmptyObject)((_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b[CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE]) && !(0, connections_1.isAuthenticationError)(policy, CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE);
    return (<ConnectionLayout_1.default displayName={NetSuiteTokenInputPage.displayName} headerTitle="workspace.netsuite.tokenInput.title" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={[styles.flex1]} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE} onBackButtonPress={handleBackButtonPress} shouldLoadForEmptyConnection={(0, EmptyObject_1.isEmptyObject)((_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c[CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE])} shouldBeBlocked={shouldPageBeBlocked}>
            <react_native_1.View style={[styles.ph5, styles.mb3, styles.mt3, { height: CONST_1.default.BANK_ACCOUNT.STEPS_HEADER_HEIGHT }]}>
                <InteractiveStepSubHeader_1.default ref={ref} startStepIndex={0} stepNames={CONST_1.default.NETSUITE_CONFIG.TOKEN_INPUT_STEP_NAMES}/>
            </react_native_1.View>
            <react_native_1.View style={[styles.flexGrow1, styles.mt3]}>
                <SubStep isEditing={isEditing} onNext={handleNextScreen} onMove={moveTo} screenIndex={screenIndex} policyID={policyID}/>
            </react_native_1.View>
        </ConnectionLayout_1.default>);
}
NetSuiteTokenInputPage.displayName = 'NetSuiteTokenInputPage';
exports.default = (0, withPolicyConnections_1.default)(NetSuiteTokenInputPage);
