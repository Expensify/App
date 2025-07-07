"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var Illustrations = require("@components/Icon/Illustrations");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var NetSuiteCommands_1 = require("@libs/actions/connections/NetSuiteCommands");
var ErrorUtils = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var variables_1 = require("@styles/variables");
var Policy = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
function NetSuiteSubsidiarySelector(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var subsidiaryList = (_f = (_e = (_d = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.netsuite) === null || _c === void 0 ? void 0 : _c.options) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.subsidiaryList) !== null && _f !== void 0 ? _f : [];
    var netsuiteConfig = (_j = (_h = (_g = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _g === void 0 ? void 0 : _g.netsuite) === null || _h === void 0 ? void 0 : _h.options) === null || _j === void 0 ? void 0 : _j.config;
    var currentSubsidiaryName = (_k = netsuiteConfig === null || netsuiteConfig === void 0 ? void 0 : netsuiteConfig.subsidiary) !== null && _k !== void 0 ? _k : '';
    var currentSubsidiaryID = (_l = netsuiteConfig === null || netsuiteConfig === void 0 ? void 0 : netsuiteConfig.subsidiaryID) !== null && _l !== void 0 ? _l : '';
    var policyID = (_m = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _m !== void 0 ? _m : '-1';
    var subsidiaryListSections = (_o = subsidiaryList.map(function (subsidiary) { return ({
        text: subsidiary.name,
        keyForList: subsidiary.internalID,
        isSelected: subsidiary.name === currentSubsidiaryName,
        value: subsidiary.name,
    }); })) !== null && _o !== void 0 ? _o : [];
    var updateSubsidiary = function (_a) {
        var keyForList = _a.keyForList, value = _a.value;
        if (!keyForList || keyForList === currentSubsidiaryID) {
            return;
        }
        (0, NetSuiteCommands_1.updateNetSuiteSubsidiary)(policyID, {
            subsidiary: value,
            subsidiaryID: keyForList,
        }, {
            subsidiary: currentSubsidiaryName,
            subsidiaryID: currentSubsidiaryID,
        });
        Navigation_1.default.goBack();
    };
    var listEmptyContent = (0, react_1.useMemo)(function () { return (<BlockingView_1.default icon={Illustrations.TeleScope} iconWidth={variables_1.default.emptyListIconWidth} iconHeight={variables_1.default.emptyListIconHeight} title={translate('workspace.netsuite.noSubsidiariesFound')} subtitle={translate('workspace.netsuite.noSubsidiariesFoundDescription')} containerStyle={styles.pb10}/>); }, [translate, styles.pb10]);
    var listHeaderComponent = (0, react_1.useMemo)(function () { return (<react_native_1.View style={[styles.pb2, styles.ph5]}>
                <Text_1.default style={[styles.pb2, styles.textNormal]}>{translate('workspace.netsuite.subsidiarySelectDescription')}</Text_1.default>
            </react_native_1.View>); }, [styles.pb2, styles.ph5, styles.textNormal, translate]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={NetSuiteSubsidiarySelector.displayName} sections={subsidiaryListSections.length > 0 ? [{ data: subsidiaryListSections }] : []} listItem={RadioListItem_1.default} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE} onSelectRow={updateSubsidiary} initiallyFocusedOptionKey={(_p = netsuiteConfig === null || netsuiteConfig === void 0 ? void 0 : netsuiteConfig.subsidiaryID) !== null && _p !== void 0 ? _p : (_q = subsidiaryListSections === null || subsidiaryListSections === void 0 ? void 0 : subsidiaryListSections.at(0)) === null || _q === void 0 ? void 0 : _q.keyForList} headerContent={listHeaderComponent} onBackButtonPress={function () { return Navigation_1.default.goBack(); }} title="workspace.netsuite.subsidiary" listEmptyContent={listEmptyContent} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.NETSUITE_CONFIG.SUBSIDIARY], netsuiteConfig === null || netsuiteConfig === void 0 ? void 0 : netsuiteConfig.pendingFields)} errors={ErrorUtils.getLatestErrorField(netsuiteConfig !== null && netsuiteConfig !== void 0 ? netsuiteConfig : {}, CONST_1.default.NETSUITE_CONFIG.SUBSIDIARY)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return Policy.clearNetSuiteErrorField(policyID, CONST_1.default.NETSUITE_CONFIG.SUBSIDIARY); }}/>);
}
NetSuiteSubsidiarySelector.displayName = 'NetSuiteSubsidiarySelector';
exports.default = (0, withPolicyConnections_1.default)(NetSuiteSubsidiarySelector);
