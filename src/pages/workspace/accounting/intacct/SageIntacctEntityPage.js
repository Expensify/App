"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var SageIntacct_1 = require("@libs/actions/connections/SageIntacct");
var ErrorUtils = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var withPolicy_1 = require("@pages/workspace/withPolicy");
var CONST_1 = require("@src/CONST");
function SageIntacctEntityPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var config = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.intacct) === null || _c === void 0 ? void 0 : _c.config;
    var entityID = (_d = config === null || config === void 0 ? void 0 : config.entity) !== null && _d !== void 0 ? _d : '';
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = (_e = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _e !== void 0 ? _e : '-1';
    var sections = [
        {
            text: translate('workspace.common.topLevel'),
            value: translate('workspace.common.topLevel'),
            keyForList: '',
            isSelected: entityID === '',
        },
    ];
    (_h = (_g = (_f = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _f === void 0 ? void 0 : _f.intacct) === null || _g === void 0 ? void 0 : _g.data) === null || _h === void 0 ? void 0 : _h.entities.forEach(function (entity) {
        sections.push({
            text: entity.name,
            value: entity.name,
            keyForList: entity.id,
            isSelected: entity.id === entityID,
        });
    });
    var saveSelection = function (_a) {
        var keyForList = _a.keyForList;
        (0, SageIntacct_1.updateSageIntacctEntity)(policyID, keyForList !== null && keyForList !== void 0 ? keyForList : '', entityID);
        Navigation_1.default.goBack();
    };
    return (<SelectionScreen_1.default policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={SageIntacctEntityPage.displayName} sections={sections ? [{ data: sections }] : []} listItem={RadioListItem_1.default} onSelectRow={saveSelection} initiallyFocusedOptionKey={(_j = sections === null || sections === void 0 ? void 0 : sections.find(function (mode) { return mode.isSelected; })) === null || _j === void 0 ? void 0 : _j.keyForList} onBackButtonPress={function () { return Navigation_1.default.dismissModal(); }} title="workspace.intacct.entity" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.SAGE_INTACCT_CONFIG.ENTITY], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={ErrorUtils.getLatestErrorField(config, CONST_1.default.SAGE_INTACCT_CONFIG.ENTITY)} errorRowStyles={[styles.ph5, styles.mv2]} onClose={function () { return (0, SageIntacct_1.clearSageIntacctErrorField)(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.ENTITY); }}/>);
}
SageIntacctEntityPage.displayName = 'SageIntacctEntityPage';
exports.default = (0, withPolicy_1.default)(SageIntacctEntityPage);
