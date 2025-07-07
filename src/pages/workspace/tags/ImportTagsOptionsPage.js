"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var ConfirmModal_1 = require("@components/ConfirmModal");
var DecisionModal_1 = require("@components/DecisionModal");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons_1 = require("@components/Icon/Expensicons");
var ImportSpreadsheet_1 = require("@components/ImportSpreadsheet");
var MenuItem_1 = require("@components/MenuItem");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Tag_1 = require("@libs/actions/Policy/Tag");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function ImportTagsOptionsPage(_a) {
    var route = _a.route;
    var policyID = route.params.policyID;
    var policy = (0, usePolicy_1.default)(policyID);
    var backTo = route.params.backTo;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    var hasAccountingConnections = (0, PolicyUtils_1.hasAccountingConnections)(policy);
    var isQuickSettingsFlow = !!backTo;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var _b = (0, react_1.useState)(false), isSwitchSingleToMultipleLevelTagWarningModalVisible = _b[0], setIsSwitchSingleToMultipleLevelTagWarningModalVisible = _b[1];
    var _c = (0, react_1.useState)(false), isDownloadFailureModalVisible = _c[0], setIsDownloadFailureModalVisible = _c[1];
    var _d = (0, react_1.useState)(false), shouldRunPostUpgradeFlow = _d[0], setShouldRunPostUpgradeFlow = _d[1];
    var policyTags = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID), { canBeMissing: true })[0];
    var _e = (0, react_1.useMemo)(function () { return [(0, PolicyUtils_1.getTagLists)(policyTags), (0, PolicyUtils_1.isMultiLevelTags)(policyTags), (0, PolicyUtils_1.hasDependentTags)(policy, policyTags), (0, PolicyUtils_1.hasIndependentTags)(policy, policyTags)]; }, [policy, policyTags]), policyTagLists = _e[0], isMultiLevelTags = _e[1], hasDependentTags = _e[2], hasIndependentTags = _e[3];
    var hasVisibleTags = (0, react_1.useMemo)(function () {
        var _a, _b;
        if (isMultiLevelTags) {
            return policyTagLists.some(function (policyTagList) { var _a; return Object.values((_a = policyTagList.tags) !== null && _a !== void 0 ? _a : {}).some(function (tag) { return tag.enabled; }); });
        }
        var singleLevelTags = (_b = (_a = policyTagLists.at(0)) === null || _a === void 0 ? void 0 : _a.tags) !== null && _b !== void 0 ? _b : {};
        return Object.values(singleLevelTags).some(function (tag) { return tag.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE; });
    }, [isMultiLevelTags, policyTagLists]);
    var startMultiLevelTagImportFlow = (0, react_1.useCallback)(function () {
        (0, Tag_1.setImportedSpreadsheetIsImportingMultiLevelTags)(true);
        if (hasVisibleTags) {
            setIsSwitchSingleToMultipleLevelTagWarningModalVisible(true);
        }
        else {
            Navigation_1.default.navigate(isQuickSettingsFlow ? ROUTES_1.default.SETTINGS_TAGS_IMPORT.getRoute(policyID, ROUTES_1.default.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo)) : ROUTES_1.default.WORKSPACE_TAGS_IMPORT.getRoute(policyID));
        }
    }, [hasVisibleTags, policyID, isQuickSettingsFlow, backTo]);
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        if (!shouldRunPostUpgradeFlow || !(0, PolicyUtils_1.isControlPolicy)(policy)) {
            return;
        }
        startMultiLevelTagImportFlow();
        setShouldRunPostUpgradeFlow(false);
    }, [shouldRunPostUpgradeFlow, policy, startMultiLevelTagImportFlow]));
    if (hasAccountingConnections) {
        return <NotFoundPage_1.default />;
    }
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} fullPageNotFoundViewProps={{ subtitleKey: (0, EmptyObject_1.isEmptyObject)(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: PolicyUtils_1.goBackFromInvalidPolicy }}>
            <ScreenWrapper_1.default shouldEnableKeyboardAvoidingView={false} testID={ImportSpreadsheet_1.default.displayName} shouldEnableMaxHeight={(0, DeviceCapabilities_1.canUseTouchScreen)()} enableEdgeToEdgeBottomSafeAreaPadding>
                <HeaderWithBackButton_1.default title={translate('workspace.tags.importTags')} onBackButtonPress={function () { return Navigation_1.default.goBack(backTo); }}/>
                <FullPageOfflineBlockingView_1.default>
                    <Text_1.default style={[styles.ph5, styles.textSupporting, styles.textNormal]}>{translate('workspace.tags.importTagsSupportingText')}</Text_1.default>

                    <MenuItem_1.default title={translate('workspace.tags.tagLevel.singleLevel')} icon={Expensicons_1.Tag} shouldShowRightIcon onPress={function () {
            (0, Tag_1.setImportedSpreadsheetIsImportingMultiLevelTags)(false);
            if (hasVisibleTags) {
                setIsSwitchSingleToMultipleLevelTagWarningModalVisible(true);
            }
            else {
                Navigation_1.default.navigate(isQuickSettingsFlow
                    ? ROUTES_1.default.SETTINGS_TAGS_IMPORT.getRoute(policyID, ROUTES_1.default.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo))
                    : ROUTES_1.default.WORKSPACE_TAGS_IMPORT.getRoute(policyID));
            }
        }}/>
                    <MenuItem_1.default title={translate('workspace.tags.tagLevel.multiLevel')} 
    // TODO: Update icon to multi-level tag icon once it's provided by design team
    icon={Expensicons_1.MultiTag} shouldShowRightIcon onPress={function () {
            if (!(0, PolicyUtils_1.isControlPolicy)(policy)) {
                setShouldRunPostUpgradeFlow(true);
                Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_UPGRADE.getRoute(policyID, CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.multiLevelTags.alias, Navigation_1.default.getActiveRoute()));
                return;
            }
            startMultiLevelTagImportFlow();
        }}/>
                </FullPageOfflineBlockingView_1.default>
            </ScreenWrapper_1.default>
            <DecisionModal_1.default title={translate('common.downloadFailedTitle')} prompt={translate('common.downloadFailedDescription')} isSmallScreenWidth={isSmallScreenWidth} onSecondOptionSubmit={function () { return setIsDownloadFailureModalVisible(false); }} secondOptionText={translate('common.buttonConfirm')} isVisible={isDownloadFailureModalVisible} onClose={function () { return setIsDownloadFailureModalVisible(false); }}/>
            <ConfirmModal_1.default isVisible={isSwitchSingleToMultipleLevelTagWarningModalVisible} onConfirm={function () {
            (0, Tag_1.cleanPolicyTags)(policyID);
            setIsSwitchSingleToMultipleLevelTagWarningModalVisible(false);
            Navigation_1.default.navigate(isQuickSettingsFlow
                ? ROUTES_1.default.SETTINGS_TAGS_IMPORT.getRoute(policyID, ROUTES_1.default.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo))
                : ROUTES_1.default.WORKSPACE_TAGS_IMPORT.getRoute(policyID));
        }} title={translate('workspace.tags.switchSingleToMultiLevelTagWarning.title')} prompt={<Text_1.default>
                        {translate('workspace.tags.switchSingleToMultiLevelTagWarning.prompt1')}
                        {!hasDependentTags && (<>
                                {translate('workspace.tags.switchSingleToMultiLevelTagWarning.prompt2')}
                                <TextLink_1.default onPress={function () {
                    if (hasIndependentTags && isMultiLevelTags) {
                        (0, Tag_1.downloadMultiLevelIndependentTagsCSV)(policyID, function () {
                            setIsDownloadFailureModalVisible(true);
                        });
                    }
                    else {
                        (0, Tag_1.downloadTagsCSV)(policyID, function () {
                            setIsDownloadFailureModalVisible(true);
                        });
                    }
                }}>
                                    {translate('workspace.tags.switchSingleToMultiLevelTagWarning.prompt3')}
                                </TextLink_1.default>
                                {translate('workspace.tags.switchSingleToMultiLevelTagWarning.prompt4')}
                                <TextLink_1.default onPress={function () {
                    // TODO: Add link to tag levels documentation
                    return null;
                }}>
                                    {translate('workspace.tags.switchSingleToMultiLevelTagWarning.prompt5')}
                                </TextLink_1.default>
                                {translate('workspace.tags.switchSingleToMultiLevelTagWarning.prompt6')}
                            </>)}
                    </Text_1.default>} confirmText={translate('workspace.tags.switchSingleToMultiLevelTagWarning.title')} danger cancelText={translate('common.cancel')} onCancel={function () {
            (0, Tag_1.setImportedSpreadsheetIsImportingMultiLevelTags)(false);
            setIsSwitchSingleToMultipleLevelTagWarningModalVisible(false);
        }}/>
        </AccessOrNotFoundWrapper_1.default>);
}
ImportTagsOptionsPage.displayName = 'ImportTagsOptionsPage';
exports.default = ImportTagsOptionsPage;
