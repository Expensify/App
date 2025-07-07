"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Switch_1 = require("@components/Switch");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Policy_1 = require("@libs/actions/Policy/Policy");
var Tag_1 = require("@libs/actions/Policy/Tag");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
/**
 * The pending state might be set by either setPolicyBillableMode or disableWorkspaceBillableExpenses.
 * setPolicyBillableMode changes disabledFields and defaultBillable and is called when disabledFields.defaultBillable is set.
 * Otherwise, disableWorkspaceBillableExpenses is used and it changes only disabledFields
 * */
function billableExpensesPending(policy) {
    var _a, _b, _c, _d, _e;
    if ((_a = policy === null || policy === void 0 ? void 0 : policy.disabledFields) === null || _a === void 0 ? void 0 : _a.defaultBillable) {
        return (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _b === void 0 ? void 0 : _b.disabledFields) !== null && _c !== void 0 ? _c : (_d = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _d === void 0 ? void 0 : _d.defaultBillable;
    }
    return (_e = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _e === void 0 ? void 0 : _e.disabledFields;
}
function toggleBillableExpenses(policy) {
    var _a;
    if ((_a = policy === null || policy === void 0 ? void 0 : policy.disabledFields) === null || _a === void 0 ? void 0 : _a.defaultBillable) {
        (0, Policy_1.setPolicyBillableMode)(policy.id, false);
    }
    else if (policy) {
        (0, Policy_1.disableWorkspaceBillableExpenses)(policy.id);
    }
}
function WorkspaceTagsSettingsPage(_a) {
    var _b;
    var route = _a.route;
    var policyID = route.params.policyID;
    var backTo = route.params.backTo;
    var policyTags = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID), { canBeMissing: true })[0];
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _c = (0, react_1.useMemo)(function () { return [(0, PolicyUtils_1.getTagLists)(policyTags), (0, PolicyUtils_1.isMultiLevelTags)(policyTags)]; }, [policyTags]), policyTagLists = _c[0], isMultiLevelTags = _c[1];
    var isLoading = !((_b = (0, PolicyUtils_1.getTagLists)(policyTags)) === null || _b === void 0 ? void 0 : _b.at(0)) || Object.keys(policyTags !== null && policyTags !== void 0 ? policyTags : {}).at(0) === 'undefined';
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var hasEnabledOptions = (0, OptionsListUtils_1.hasEnabledOptions)(Object.values(policyTags !== null && policyTags !== void 0 ? policyTags : {}).flatMap(function (_a) {
        var tags = _a.tags;
        return Object.values(tags);
    }));
    var updateWorkspaceRequiresTag = (0, react_1.useCallback)(function (value) {
        (0, Tag_1.setPolicyRequiresTag)(policyID, value);
    }, [policyID]);
    var isQuickSettingsFlow = route.name === SCREENS_1.default.SETTINGS_TAGS.SETTINGS_TAGS_SETTINGS;
    var getTagsSettings = function (policy) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        return (<react_native_1.View style={styles.flexGrow1}>
            {!isMultiLevelTags && (<OfflineWithFeedback_1.default errors={(_c = policyTags === null || policyTags === void 0 ? void 0 : policyTags[(_b = (_a = policyTagLists.at(0)) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '']) === null || _c === void 0 ? void 0 : _c.errors} onClose={function () { var _a, _b; return (0, Tag_1.clearPolicyTagListErrors)(policyID, (_b = (_a = policyTagLists.at(0)) === null || _a === void 0 ? void 0 : _a.orderWeight) !== null && _b !== void 0 ? _b : 0); }} pendingAction={(_f = policyTags === null || policyTags === void 0 ? void 0 : policyTags[(_e = (_d = policyTagLists.at(0)) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : '']) === null || _f === void 0 ? void 0 : _f.pendingAction} errorRowStyles={styles.mh5}>
                    <MenuItemWithTopDescription_1.default title={(_h = (_g = policyTagLists.at(0)) === null || _g === void 0 ? void 0 : _g.name) !== null && _h !== void 0 ? _h : ''} description={translate("workspace.tags.customTagName")} onPress={function () {
                    var _a, _b, _c, _d;
                    Navigation_1.default.navigate(isQuickSettingsFlow
                        ? ROUTES_1.default.SETTINGS_TAGS_EDIT.getRoute(policyID, (_b = (_a = policyTagLists.at(0)) === null || _a === void 0 ? void 0 : _a.orderWeight) !== null && _b !== void 0 ? _b : 0, backTo)
                        : ROUTES_1.default.WORKSPACE_EDIT_TAGS.getRoute(policyID, (_d = (_c = policyTagLists.at(0)) === null || _c === void 0 ? void 0 : _c.orderWeight) !== null && _d !== void 0 ? _d : 0));
                }} shouldShowRightIcon/>
                </OfflineWithFeedback_1.default>)}
            <OfflineWithFeedback_1.default errors={(_j = policy === null || policy === void 0 ? void 0 : policy.errorFields) === null || _j === void 0 ? void 0 : _j.requiresTag} pendingAction={(_k = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _k === void 0 ? void 0 : _k.requiresTag} errorRowStyles={styles.mh5}>
                <react_native_1.View style={[styles.flexRow, styles.mh5, styles.mv4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                    <Text_1.default style={[styles.textNormal]}>{translate('workspace.tags.requiresTag')}</Text_1.default>
                    <Switch_1.default isOn={(_l = policy === null || policy === void 0 ? void 0 : policy.requiresTag) !== null && _l !== void 0 ? _l : false} accessibilityLabel={translate('workspace.tags.requiresTag')} onToggle={updateWorkspaceRequiresTag} disabled={!(policy === null || policy === void 0 ? void 0 : policy.areTagsEnabled) || !hasEnabledOptions}/>
                </react_native_1.View>
            </OfflineWithFeedback_1.default>
            <OfflineWithFeedback_1.default pendingAction={billableExpensesPending(policy)}>
                <react_native_1.View style={[styles.flexRow, styles.mh5, styles.mv4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                    <Text_1.default style={[styles.textNormal]}>{translate('workspace.tags.trackBillable')}</Text_1.default>
                    <Switch_1.default isOn={!((_o = (_m = policy === null || policy === void 0 ? void 0 : policy.disabledFields) === null || _m === void 0 ? void 0 : _m.defaultBillable) !== null && _o !== void 0 ? _o : false)} accessibilityLabel={translate('workspace.tags.trackBillable')} onToggle={function () { return toggleBillableExpenses(policy); }} disabled={!(policy === null || policy === void 0 ? void 0 : policy.areTagsEnabled)}/>
                </react_native_1.View>
            </OfflineWithFeedback_1.default>
        </react_native_1.View>);
    };
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}>
            {function (_a) {
            var policy = _a.policy;
            return (<ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={WorkspaceTagsSettingsPage.displayName}>
                    <HeaderWithBackButton_1.default title={translate('common.settings')} onBackButtonPress={function () { return Navigation_1.default.goBack(isQuickSettingsFlow ? ROUTES_1.default.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo) : undefined); }}/>
                    {isOffline && isLoading ? <FullPageOfflineBlockingView_1.default addBottomSafeAreaPadding>{getTagsSettings(policy)}</FullPageOfflineBlockingView_1.default> : getTagsSettings(policy)}
                </ScreenWrapper_1.default>);
        }}
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceTagsSettingsPage.displayName = 'WorkspaceTagsSettingsPage';
exports.default = WorkspaceTagsSettingsPage;
