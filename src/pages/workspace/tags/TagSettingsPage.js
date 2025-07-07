"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var ConfirmModal_1 = require("@components/ConfirmModal");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Switch_1 = require("@components/Switch");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var Tag_1 = require("@userActions/Policy/Tag");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
function TagSettingsPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var route = _a.route, navigation = _a.navigation;
    var policyTags = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(route.params.policyID), { canBeMissing: true })[0];
    var _k = route.params, orderWeight = _k.orderWeight, policyID = _k.policyID, tagName = _k.tagName, backTo = _k.backTo, parentTagsFilter = _k.parentTagsFilter;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policyTag = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.getTagList)(policyTags, orderWeight); }, [policyTags, orderWeight]);
    var policy = (0, usePolicy_1.default)(policyID);
    var hasAccountingConnections = (0, PolicyUtils_1.hasAccountingConnections)(policy);
    var _l = react_1.default.useState(false), isDeleteTagModalOpen = _l[0], setIsDeleteTagModalOpen = _l[1];
    var _m = (0, react_1.useState)(false), isCannotDeleteOrDisableLastTagModalVisible = _m[0], setIsCannotDeleteOrDisableLastTagModalVisible = _m[1];
    var isQuickSettingsFlow = route.name === SCREENS_1.default.SETTINGS_TAGS.SETTINGS_TAG_SETTINGS;
    var tagApprover = (_d = (_c = (0, PolicyUtils_1.getTagApproverRule)(policyID, (_b = route.params) === null || _b === void 0 ? void 0 : _b.tagName)) === null || _c === void 0 ? void 0 : _c.approver) !== null && _d !== void 0 ? _d : '';
    var approver = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(tagApprover);
    var approverText = (_e = approver === null || approver === void 0 ? void 0 : approver.displayName) !== null && _e !== void 0 ? _e : tagApprover;
    var hasDependentTags = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.hasDependentTags)(policy, policyTags); }, [policy, policyTags]);
    var currentPolicyTag = (0, react_1.useMemo)(function () {
        var _a, _b, _c;
        if (hasDependentTags) {
            return Object.values((_a = policyTag.tags) !== null && _a !== void 0 ? _a : {}).find(function (tag) { var _a; return (tag === null || tag === void 0 ? void 0 : tag.name) === tagName && ((_a = tag.rules) === null || _a === void 0 ? void 0 : _a.parentTagsFilter) === parentTagsFilter; });
        }
        return (_b = policyTag.tags[tagName]) !== null && _b !== void 0 ? _b : Object.values((_c = policyTag.tags) !== null && _c !== void 0 ? _c : {}).find(function (tag) { return tag.previousTagName === tagName; });
    }, [policyTag, tagName, parentTagsFilter, hasDependentTags]);
    var shouldPreventDisableOrDelete = (0, OptionsListUtils_1.isDisablingOrDeletingLastEnabledTag)(policyTag, [currentPolicyTag]);
    (0, react_1.useEffect)(function () {
        if ((currentPolicyTag === null || currentPolicyTag === void 0 ? void 0 : currentPolicyTag.name) === tagName || !currentPolicyTag) {
            return;
        }
        navigation.setParams({ tagName: currentPolicyTag === null || currentPolicyTag === void 0 ? void 0 : currentPolicyTag.name });
    }, [tagName, currentPolicyTag, navigation]);
    if (!currentPolicyTag) {
        return <NotFoundPage_1.default />;
    }
    var deleteTagAndHideModal = function () {
        (0, Tag_1.deletePolicyTags)(policyID, [currentPolicyTag.name]);
        setIsDeleteTagModalOpen(false);
        Navigation_1.default.goBack(isQuickSettingsFlow ? ROUTES_1.default.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo) : undefined);
    };
    var updateWorkspaceTagEnabled = function (value) {
        var _a;
        if (shouldPreventDisableOrDelete) {
            setIsCannotDeleteOrDisableLastTagModalVisible(true);
            return;
        }
        (0, Tag_1.setWorkspaceTagEnabled)(policyID, (_a = {}, _a[currentPolicyTag.name] = { name: currentPolicyTag.name, enabled: value }, _a), policyTag.orderWeight);
    };
    var navigateToEditTag = function () {
        Navigation_1.default.navigate(isQuickSettingsFlow
            ? ROUTES_1.default.SETTINGS_TAG_EDIT.getRoute(policyID, orderWeight, currentPolicyTag.name, backTo)
            : ROUTES_1.default.WORKSPACE_TAG_EDIT.getRoute(policyID, orderWeight, currentPolicyTag.name));
    };
    var navigateToEditGlCode = function () {
        if (!(0, PolicyUtils_1.isControlPolicy)(policy)) {
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_UPGRADE.getRoute(policyID, CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.glCodes.alias, isQuickSettingsFlow
                ? ROUTES_1.default.SETTINGS_TAG_GL_CODE.getRoute(policyID, orderWeight, tagName, backTo)
                : ROUTES_1.default.WORKSPACE_TAG_GL_CODE.getRoute(policyID, orderWeight, tagName)));
            return;
        }
        Navigation_1.default.navigate(isQuickSettingsFlow
            ? ROUTES_1.default.SETTINGS_TAG_GL_CODE.getRoute(policyID, orderWeight, currentPolicyTag.name, backTo)
            : ROUTES_1.default.WORKSPACE_TAG_GL_CODE.getRoute(policyID, orderWeight, currentPolicyTag.name));
    };
    var navigateToEditTagApprover = function () {
        Navigation_1.default.navigate(isQuickSettingsFlow
            ? ROUTES_1.default.SETTINGS_TAG_APPROVER.getRoute(policyID, orderWeight, currentPolicyTag.name, backTo)
            : ROUTES_1.default.WORKSPACE_TAG_APPROVER.getRoute(policyID, orderWeight, currentPolicyTag.name));
    };
    var isThereAnyAccountingConnection = Object.keys((_f = policy === null || policy === void 0 ? void 0 : policy.connections) !== null && _f !== void 0 ? _f : {}).length !== 0;
    var isMultiLevelTags = (0, PolicyUtils_1.isMultiLevelTags)(policyTags);
    var shouldShowDeleteMenuItem = !isThereAnyAccountingConnection && !isMultiLevelTags;
    var workflowApprovalsUnavailable = (0, PolicyUtils_1.getWorkflowApprovalsUnavailable)(policy);
    var approverDisabled = !(policy === null || policy === void 0 ? void 0 : policy.areWorkflowsEnabled) || workflowApprovalsUnavailable;
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={TagSettingsPage.displayName}>
                <HeaderWithBackButton_1.default title={(0, PolicyUtils_1.getCleanedTagName)(tagName)} shouldSetModalVisibility={false} onBackButtonPress={function () { return Navigation_1.default.goBack(isQuickSettingsFlow ? ROUTES_1.default.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo) : undefined); }}/>
                <ConfirmModal_1.default title={translate('workspace.tags.deleteTag')} isVisible={isDeleteTagModalOpen} onConfirm={deleteTagAndHideModal} onCancel={function () { return setIsDeleteTagModalOpen(false); }} shouldSetModalVisibility={false} prompt={translate('workspace.tags.deleteTagConfirmation')} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger/>
                <ConfirmModal_1.default isVisible={isCannotDeleteOrDisableLastTagModalVisible} onConfirm={function () { return setIsCannotDeleteOrDisableLastTagModalVisible(false); }} onCancel={function () { return setIsCannotDeleteOrDisableLastTagModalVisible(false); }} title={translate('workspace.tags.cannotDeleteOrDisableAllTags.title')} prompt={translate('workspace.tags.cannotDeleteOrDisableAllTags.description')} confirmText={translate('common.buttonConfirm')} shouldShowCancelButton={false}/>

                <react_native_1.View style={styles.flexGrow1}>
                    {!hasDependentTags && (<OfflineWithFeedback_1.default errors={(0, ErrorUtils_1.getLatestErrorMessageField)(currentPolicyTag)} pendingAction={(_g = currentPolicyTag.pendingFields) === null || _g === void 0 ? void 0 : _g.enabled} errorRowStyles={styles.mh5} onClose={function () { return (0, Tag_1.clearPolicyTagErrors)(policyID, tagName, orderWeight); }}>
                            <react_native_1.View style={[styles.mt2, styles.mh5]}>
                                <react_native_1.View style={[styles.flexRow, styles.mb5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                    <Text_1.default>{translate('workspace.tags.enableTag')}</Text_1.default>
                                    <Switch_1.default isOn={currentPolicyTag.enabled} accessibilityLabel={translate('workspace.tags.enableTag')} onToggle={updateWorkspaceTagEnabled} showLockIcon={shouldPreventDisableOrDelete}/>
                                </react_native_1.View>
                            </react_native_1.View>
                        </OfflineWithFeedback_1.default>)}
                    <OfflineWithFeedback_1.default pendingAction={(_h = currentPolicyTag.pendingFields) === null || _h === void 0 ? void 0 : _h.name}>
                        <MenuItemWithTopDescription_1.default title={(0, PolicyUtils_1.getCleanedTagName)(currentPolicyTag.name)} description={translate("common.name")} onPress={navigateToEditTag} interactive={!hasDependentTags} shouldShowRightIcon={!hasDependentTags}/>
                    </OfflineWithFeedback_1.default>
                    {(!hasDependentTags || !!(currentPolicyTag === null || currentPolicyTag === void 0 ? void 0 : currentPolicyTag['GL Code'])) && (<OfflineWithFeedback_1.default pendingAction={(_j = currentPolicyTag.pendingFields) === null || _j === void 0 ? void 0 : _j['GL Code']}>
                            <MenuItemWithTopDescription_1.default description={translate("workspace.tags.glCode")} title={currentPolicyTag === null || currentPolicyTag === void 0 ? void 0 : currentPolicyTag['GL Code']} onPress={navigateToEditGlCode} iconRight={hasAccountingConnections ? Expensicons.Lock : undefined} interactive={!hasAccountingConnections && !hasDependentTags} shouldShowRightIcon={!hasDependentTags}/>
                        </OfflineWithFeedback_1.default>)}

                    {!!(policy === null || policy === void 0 ? void 0 : policy.areRulesEnabled) && !isMultiLevelTags && (<>
                            <react_native_1.View style={[styles.mh5, styles.mv3, styles.pt3, styles.borderTop]}>
                                <Text_1.default style={[styles.textNormal, styles.textStrong, styles.mv3]}>{translate('workspace.tags.tagRules')}</Text_1.default>
                            </react_native_1.View>
                            <MenuItemWithTopDescription_1.default title={approverText} description={translate("workspace.tags.approverDescription")} onPress={navigateToEditTagApprover} shouldShowRightIcon disabled={approverDisabled}/>
                            {approverDisabled && (<Text_1.default style={[styles.flexRow, styles.alignItemsCenter, styles.mv2, styles.mh5]}>
                                    <Text_1.default style={[styles.textLabel, styles.colorMuted]}>{translate('workspace.rules.categoryRules.goTo')}</Text_1.default>{' '}
                                    <TextLink_1.default style={[styles.link, styles.label]} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_MORE_FEATURES.getRoute(policyID)); }}>
                                        {translate('workspace.common.moreFeatures')}
                                    </TextLink_1.default>{' '}
                                    <Text_1.default style={[styles.textLabel, styles.colorMuted]}>{translate('workspace.rules.categoryRules.andEnableWorkflows')}</Text_1.default>
                                </Text_1.default>)}
                        </>)}

                    {shouldShowDeleteMenuItem && (<MenuItem_1.default icon={Expensicons.Trashcan} title={translate('common.delete')} onPress={function () {
                if (shouldPreventDisableOrDelete) {
                    setIsCannotDeleteOrDisableLastTagModalVisible(true);
                    return;
                }
                setIsDeleteTagModalOpen(true);
            }}/>)}
                </react_native_1.View>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
TagSettingsPage.displayName = 'TagSettingsPage';
exports.default = TagSettingsPage;
