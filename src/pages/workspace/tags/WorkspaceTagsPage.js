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
var Button_1 = require("@components/Button");
var ButtonWithDropdownMenu_1 = require("@components/ButtonWithDropdownMenu");
var ConfirmModal_1 = require("@components/ConfirmModal");
var DecisionModal_1 = require("@components/DecisionModal");
var EmptyStateComponent_1 = require("@components/EmptyStateComponent");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var LottieAnimations_1 = require("@components/LottieAnimations");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var SearchBar_1 = require("@components/SearchBar");
var ListItemRightCaretWithLabel_1 = require("@components/SelectionList/ListItemRightCaretWithLabel");
var TableListItem_1 = require("@components/SelectionList/TableListItem");
var SelectionListWithModal_1 = require("@components/SelectionListWithModal");
var CustomListHeader_1 = require("@components/SelectionListWithModal/CustomListHeader");
var TableRowSkeleton_1 = require("@components/Skeletons/TableRowSkeleton");
var Switch_1 = require("@components/Switch");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useCleanupSelectedOptions_1 = require("@hooks/useCleanupSelectedOptions");
var useEnvironment_1 = require("@hooks/useEnvironment");
var useFilteredSelection_1 = require("@hooks/useFilteredSelection");
var useLocalize_1 = require("@hooks/useLocalize");
var useMobileSelectionMode_1 = require("@hooks/useMobileSelectionMode");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var usePolicy_1 = require("@hooks/usePolicy");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSearchBackPress_1 = require("@hooks/useSearchBackPress");
var useSearchResults_1 = require("@hooks/useSearchResults");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var connections_1 = require("@libs/actions/connections");
var MobileSelectionMode_1 = require("@libs/actions/MobileSelectionMode");
var Tag_1 = require("@libs/actions/Policy/Tag");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var LocaleCompare_1 = require("@libs/LocaleCompare");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var StringUtils_1 = require("@libs/StringUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var Modal_1 = require("@userActions/Modal");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
function WorkspaceTagsPage(_a) {
    var _b;
    var route = _a.route;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _c = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _c.shouldUseNarrowLayout, isSmallScreenWidth = _c.isSmallScreenWidth;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _d = (0, react_1.useState)(false), isDownloadFailureModalVisible = _d[0], setIsDownloadFailureModalVisible = _d[1];
    var _e = (0, react_1.useState)(false), isDeleteTagsConfirmModalVisible = _e[0], setIsDeleteTagsConfirmModalVisible = _e[1];
    var _f = (0, react_1.useState)(false), isOfflineModalVisible = _f[0], setIsOfflineModalVisible = _f[1];
    var _g = (0, react_1.useState)(false), isCannotDeleteOrDisableLastTagModalVisible = _g[0], setIsCannotDeleteOrDisableLastTagModalVisible = _g[1];
    var _h = (0, react_1.useState)(false), isCannotMakeLastTagOptionalModalVisible = _h[0], setIsCannotMakeLastTagOptionalModalVisible = _h[1];
    var policyID = route.params.policyID;
    var backTo = route.params.backTo;
    var policy = (0, usePolicy_1.default)(policyID);
    var policyTags = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID), { canBeMissing: true })[0];
    var selectionMode = (0, useMobileSelectionMode_1.default)().selectionMode;
    var environmentURL = (0, useEnvironment_1.default)().environmentURL;
    var connectionSyncProgress = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS).concat(policy === null || policy === void 0 ? void 0 : policy.id), { canBeMissing: true })[0];
    var isSyncInProgress = (0, connections_1.isConnectionInProgress)(connectionSyncProgress, policy);
    var hasSyncError = (0, PolicyUtils_1.shouldShowSyncError)(policy, isSyncInProgress);
    var connectedIntegration = (_b = (0, PolicyUtils_1.getConnectedIntegration)(policy)) !== null && _b !== void 0 ? _b : connectionSyncProgress === null || connectionSyncProgress === void 0 ? void 0 : connectionSyncProgress.connectionName;
    var isConnectionVerified = connectedIntegration && !(0, connections_1.isConnectionUnverified)(policy, connectedIntegration);
    var currentConnectionName = (0, PolicyUtils_1.getCurrentConnectionName)(policy);
    var _j = (0, react_1.useMemo)(function () { return [(0, PolicyUtils_1.getTagLists)(policyTags), (0, PolicyUtils_1.isMultiLevelTags)(policyTags), (0, PolicyUtils_1.hasDependentTags)(policy, policyTags), (0, PolicyUtils_1.hasIndependentTags)(policy, policyTags)]; }, [policy, policyTags]), policyTagLists = _j[0], isMultiLevelTags = _j[1], hasDependentTags = _j[2], hasIndependentTags = _j[3];
    var canSelectMultiple = !hasDependentTags && (shouldUseNarrowLayout ? selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled : true);
    var fetchTags = (0, react_1.useCallback)(function () {
        (0, Tag_1.openPolicyTagsPage)(policyID);
    }, [policyID]);
    var isQuickSettingsFlow = route.name === SCREENS_1.default.SETTINGS_TAGS.SETTINGS_TAGS_ROOT;
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var tagsList = (0, react_1.useMemo)(function () {
        var _a;
        if (isMultiLevelTags) {
            return policyTagLists.reduce(function (acc, policyTagList) {
                acc[policyTagList.name] = policyTagList;
                return acc;
            }, {});
        }
        return (_a = policyTagLists === null || policyTagLists === void 0 ? void 0 : policyTagLists.at(0)) === null || _a === void 0 ? void 0 : _a.tags;
    }, [isMultiLevelTags, policyTagLists]);
    var filterTags = (0, react_1.useCallback)(function (tag) { return !!tag && tag.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE; }, []);
    var _k = (0, useFilteredSelection_1.default)(tagsList, filterTags), selectedTags = _k[0], setSelectedTags = _k[1];
    var isTagSelected = (0, react_1.useCallback)(function (tag) { return selectedTags.includes(tag.value); }, [selectedTags]);
    var isOffline = (0, useNetwork_1.default)({ onReconnect: fetchTags }).isOffline;
    (0, react_1.useEffect)(function () {
        fetchTags();
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    var cleanupSelectedOption = (0, react_1.useCallback)(function () { return setSelectedTags([]); }, [setSelectedTags]);
    (0, useCleanupSelectedOptions_1.default)(cleanupSelectedOption);
    (0, useSearchBackPress_1.default)({
        onClearSelection: function () {
            setSelectedTags([]);
        },
        onNavigationCallBack: function () { return Navigation_1.default.goBack(backTo); },
    });
    var getPendingAction = function (policyTagList) {
        var _a;
        if (!policyTagList) {
            return undefined;
        }
        return ((_a = policyTagList.pendingAction) !== null && _a !== void 0 ? _a : Object.values(policyTagList.tags).some(function (tag) { return tag.pendingAction; }))
            ? CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE
            : undefined;
    };
    var updateWorkspaceTagEnabled = (0, react_1.useCallback)(function (value, tagName) {
        var _a;
        (0, Tag_1.setWorkspaceTagEnabled)(policyID, (_a = {}, _a[tagName] = { name: tagName, enabled: value }, _a), 0);
    }, [policyID]);
    var updateWorkspaceRequiresTag = (0, react_1.useCallback)(function (value, orderWeight) {
        (0, Tag_1.setPolicyTagsRequired)(policyID, value, orderWeight);
    }, [policyID]);
    var tagList = (0, react_1.useMemo)(function () {
        var _a, _b;
        if (isMultiLevelTags) {
            return policyTagLists.map(function (policyTagList) {
                var _a, _b, _c;
                var areTagsEnabled = !!Object.values((_a = policyTagList === null || policyTagList === void 0 ? void 0 : policyTagList.tags) !== null && _a !== void 0 ? _a : {}).some(function (tag) { return tag.enabled; });
                var isSwitchDisabled = !policyTagList.required && !areTagsEnabled;
                var isSwitchEnabled = policyTagList.required && areTagsEnabled;
                if (policyTagList.required && !areTagsEnabled) {
                    updateWorkspaceRequiresTag(false, policyTagList.orderWeight);
                }
                return {
                    value: policyTagList.name,
                    orderWeight: policyTagList.orderWeight,
                    text: (0, PolicyUtils_1.getCleanedTagName)(policyTagList.name),
                    alternateText: translate('workspace.tags.tagCount', { count: Object.keys((_b = policyTagList === null || policyTagList === void 0 ? void 0 : policyTagList.tags) !== null && _b !== void 0 ? _b : {}).length }),
                    keyForList: (0, PolicyUtils_1.getCleanedTagName)(policyTagList.name),
                    pendingAction: getPendingAction(policyTagList),
                    enabled: true,
                    required: policyTagList.required,
                    isDisabledCheckbox: isSwitchDisabled,
                    rightElement: isBetaEnabled(CONST_1.default.BETAS.MULTI_LEVEL_TAGS) && hasDependentTags ? (<ListItemRightCaretWithLabel_1.default labelText={translate('workspace.tags.tagCount', { count: Object.keys((_c = policyTagList === null || policyTagList === void 0 ? void 0 : policyTagList.tags) !== null && _c !== void 0 ? _c : {}).length })} shouldShowCaret/>) : (<Switch_1.default isOn={isSwitchEnabled} accessibilityLabel={translate('workspace.tags.requiresTag')} onToggle={function (newValue) {
                            if ((0, OptionsListUtils_1.isMakingLastRequiredTagListOptional)(policy, policyTags, [policyTagList])) {
                                setIsCannotMakeLastTagOptionalModalVisible(true);
                                return;
                            }
                            updateWorkspaceRequiresTag(newValue, policyTagList.orderWeight);
                        }} disabled={isSwitchDisabled} showLockIcon={(0, OptionsListUtils_1.isMakingLastRequiredTagListOptional)(policy, policyTags, [policyTagList])}/>),
                };
            });
        }
        return Object.values((_b = (_a = policyTagLists === null || policyTagLists === void 0 ? void 0 : policyTagLists.at(0)) === null || _a === void 0 ? void 0 : _a.tags) !== null && _b !== void 0 ? _b : {}).map(function (tag) {
            var _a;
            return ({
                value: tag.name,
                text: (0, PolicyUtils_1.getCleanedTagName)(tag.name),
                keyForList: tag.name,
                pendingAction: tag.pendingAction,
                errors: (_a = tag.errors) !== null && _a !== void 0 ? _a : undefined,
                enabled: tag.enabled,
                isDisabled: tag.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                rightElement: (<Switch_1.default isOn={tag.enabled} disabled={tag.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE} accessibilityLabel={translate('workspace.tags.enableTag')} onToggle={function (newValue) {
                        if ((0, OptionsListUtils_1.isDisablingOrDeletingLastEnabledTag)(policyTagLists.at(0), [tag])) {
                            setIsCannotDeleteOrDisableLastTagModalVisible(true);
                            return;
                        }
                        updateWorkspaceTagEnabled(newValue, tag.name);
                    }} showLockIcon={(0, OptionsListUtils_1.isDisablingOrDeletingLastEnabledTag)(policyTagLists.at(0), [tag])}/>),
            });
        });
    }, [isMultiLevelTags, policyTagLists, isBetaEnabled, hasDependentTags, translate, policy, policyTags, updateWorkspaceRequiresTag, updateWorkspaceTagEnabled]);
    var filterTag = (0, react_1.useCallback)(function (tag, searchInput) {
        var _a, _b, _c, _d;
        var tagText = StringUtils_1.default.normalize((_b = (_a = tag.text) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : '');
        var tagValue = StringUtils_1.default.normalize((_d = (_c = tag.value) === null || _c === void 0 ? void 0 : _c.toLowerCase()) !== null && _d !== void 0 ? _d : '');
        var normalizeSearchInput = StringUtils_1.default.normalize(searchInput.toLowerCase());
        return tagText.includes(normalizeSearchInput) || tagValue.includes(normalizeSearchInput);
    }, []);
    var sortTags = (0, react_1.useCallback)(function (tags) {
        // For multi-level tags, preserve the policy order (by orderWeight) instead of sorting alphabetically
        if (hasDependentTags || isMultiLevelTags) {
            return tags.sort(function (a, b) { var _a, _b; return ((_a = a.orderWeight) !== null && _a !== void 0 ? _a : 0) - ((_b = b.orderWeight) !== null && _b !== void 0 ? _b : 0); });
        }
        // For other cases, sort alphabetically by name
        return tags.sort(function (a, b) { return (0, LocaleCompare_1.default)(a.value, b.value); });
    }, [hasDependentTags, isMultiLevelTags]);
    var _l = (0, useSearchResults_1.default)(tagList, filterTag, sortTags), inputValue = _l[0], setInputValue = _l[1], filteredTagList = _l[2];
    var filteredTagListKeyedByName = (0, react_1.useMemo)(function () {
        return filteredTagList.reduce(function (acc, tag) {
            acc[tag.value] = tag;
            return acc;
        }, {});
    }, [filteredTagList]);
    var toggleTag = function (tag) {
        setSelectedTags(function (prev) {
            if (prev.includes(tag.value)) {
                return prev.filter(function (item) { return item !== tag.value; });
            }
            return __spreadArray(__spreadArray([], prev, true), [tag.value], false);
        });
    };
    var toggleAllTags = function () {
        var availableTags = filteredTagList.filter(function (tag) { return tag.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !tag.isDisabledCheckbox; });
        setSelectedTags(selectedTags.length > 0 ? [] : availableTags.map(function (item) { return item.value; }));
    };
    var getCustomListHeader = function () {
        if (isBetaEnabled(CONST_1.default.BETAS.MULTI_LEVEL_TAGS) && hasDependentTags) {
            return (<CustomListHeader_1.default canSelectMultiple={false} leftHeaderText={translate('common.name')} rightHeaderText={translate('common.count')} rightHeaderMinimumWidth={120}/>);
        }
        return (<CustomListHeader_1.default canSelectMultiple={canSelectMultiple} leftHeaderText={translate('common.name')} rightHeaderText={translate(isMultiLevelTags ? 'common.required' : 'common.enabled')}/>);
    };
    var navigateToTagsSettings = (0, react_1.useCallback)(function () {
        Navigation_1.default.navigate(isQuickSettingsFlow ? ROUTES_1.default.SETTINGS_TAGS_SETTINGS.getRoute(policyID, backTo) : ROUTES_1.default.WORKSPACE_TAGS_SETTINGS.getRoute(policyID));
    }, [isQuickSettingsFlow, policyID, backTo]);
    var navigateToCreateTagPage = function () {
        Navigation_1.default.navigate(isQuickSettingsFlow ? ROUTES_1.default.SETTINGS_TAG_CREATE.getRoute(policyID, backTo) : ROUTES_1.default.WORKSPACE_TAG_CREATE.getRoute(policyID));
    };
    var navigateToTagSettings = function (tag) {
        if (isSmallScreenWidth && (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled)) {
            toggleTag(tag);
            return;
        }
        if (tag.orderWeight !== undefined) {
            Navigation_1.default.navigate(isQuickSettingsFlow ? ROUTES_1.default.SETTINGS_TAG_LIST_VIEW.getRoute(policyID, tag.orderWeight, backTo) : ROUTES_1.default.WORKSPACE_TAG_LIST_VIEW.getRoute(policyID, tag.orderWeight));
        }
        else {
            Navigation_1.default.navigate(isQuickSettingsFlow ? ROUTES_1.default.SETTINGS_TAG_SETTINGS.getRoute(policyID, 0, tag.value, backTo) : ROUTES_1.default.WORKSPACE_TAG_SETTINGS.getRoute(policyID, 0, tag.value));
        }
    };
    var deleteTags = function () {
        (0, Tag_1.deletePolicyTags)(policyID, selectedTags);
        setIsDeleteTagsConfirmModalVisible(false);
        react_native_1.InteractionManager.runAfterInteractions(function () {
            setSelectedTags([]);
        });
    };
    var isLoading = !isOffline && policyTags === undefined;
    var hasVisibleTags = tagList.some(function (tag) { return tag.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline; });
    var navigateToImportSpreadsheet = (0, react_1.useCallback)(function () {
        if (isOffline) {
            (0, Modal_1.close)(function () { return setIsOfflineModalVisible(true); });
            return;
        }
        if (isBetaEnabled(CONST_1.default.BETAS.MULTI_LEVEL_TAGS)) {
            Navigation_1.default.navigate(isQuickSettingsFlow
                ? ROUTES_1.default.SETTINGS_TAGS_IMPORT.getRoute(policyID, ROUTES_1.default.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo))
                : ROUTES_1.default.WORKSPACE_TAGS_IMPORT_OPTIONS.getRoute(policyID));
        }
        else {
            Navigation_1.default.navigate(isQuickSettingsFlow ? ROUTES_1.default.SETTINGS_TAGS_IMPORT.getRoute(policyID, ROUTES_1.default.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo)) : ROUTES_1.default.WORKSPACE_TAGS_IMPORT.getRoute(policyID));
        }
    }, [backTo, isOffline, isQuickSettingsFlow, policyID, isBetaEnabled]);
    var hasAccountingConnections = (0, PolicyUtils_1.hasAccountingConnections)(policy);
    var secondaryActions = (0, react_1.useMemo)(function () {
        var menuItems = [];
        menuItems.push({
            icon: Expensicons.Gear,
            text: translate('common.settings'),
            onSelected: navigateToTagsSettings,
            value: CONST_1.default.POLICY.SECONDARY_ACTIONS.SETTINGS,
        });
        if (!hasAccountingConnections) {
            menuItems.push({
                icon: Expensicons.Table,
                text: translate('spreadsheet.importSpreadsheet'),
                onSelected: navigateToImportSpreadsheet,
                value: CONST_1.default.POLICY.SECONDARY_ACTIONS.IMPORT_SPREADSHEET,
            });
        }
        if (hasVisibleTags && !hasDependentTags) {
            menuItems.push({
                icon: Expensicons.Download,
                text: translate('spreadsheet.downloadCSV'),
                onSelected: function () {
                    if (isOffline) {
                        (0, Modal_1.close)(function () { return setIsOfflineModalVisible(true); });
                        return;
                    }
                    (0, Modal_1.close)(function () {
                        if (hasIndependentTags && isBetaEnabled(CONST_1.default.BETAS.MULTI_LEVEL_TAGS)) {
                            (0, Tag_1.downloadMultiLevelIndependentTagsCSV)(policyID, function () {
                                setIsDownloadFailureModalVisible(true);
                            });
                        }
                        else {
                            (0, Tag_1.downloadTagsCSV)(policyID, function () {
                                setIsDownloadFailureModalVisible(true);
                            });
                        }
                    });
                },
                value: CONST_1.default.POLICY.SECONDARY_ACTIONS.DOWNLOAD_CSV,
            });
        }
        return menuItems;
    }, [translate, navigateToTagsSettings, isBetaEnabled, hasDependentTags, hasVisibleTags, isOffline, policyID, hasIndependentTags, hasAccountingConnections, navigateToImportSpreadsheet]);
    var getHeaderButtons = function () {
        var _a, _b, _c, _d, _e, _f;
        var selectedTagsObject = selectedTags.map(function (key) { var _a, _b; return (_b = (_a = policyTagLists.at(0)) === null || _a === void 0 ? void 0 : _a.tags) === null || _b === void 0 ? void 0 : _b[key]; });
        var selectedTagLists = selectedTags.map(function (selectedTag) { return policyTagLists.find(function (policyTagList) { return policyTagList.name === selectedTag; }); });
        if (shouldUseNarrowLayout ? !(selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) : selectedTags.length === 0) {
            var hasPrimaryActions = !hasAccountingConnections && !isMultiLevelTags && hasVisibleTags;
            return (<react_native_1.View style={[styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
                    {hasPrimaryActions && (<Button_1.default success onPress={navigateToCreateTagPage} icon={Expensicons.Plus} text={translate('workspace.tags.addTag')} style={[shouldUseNarrowLayout && styles.flex1]}/>)}
                    <ButtonWithDropdownMenu_1.default success={false} onPress={function () { }} shouldAlwaysShowDropdownMenu customText={translate('common.more')} options={secondaryActions} isSplitButton={false} wrapperStyle={hasPrimaryActions ? styles.flexGrow0 : styles.flexGrow1}/>
                </react_native_1.View>);
        }
        var options = [];
        if (!hasAccountingConnections && !isMultiLevelTags) {
            options.push({
                icon: Expensicons.Trashcan,
                text: translate(selectedTags.length === 1 ? 'workspace.tags.deleteTag' : 'workspace.tags.deleteTags'),
                value: CONST_1.default.POLICY.BULK_ACTION_TYPES.DELETE,
                onSelected: function () {
                    if ((0, OptionsListUtils_1.isDisablingOrDeletingLastEnabledTag)(policyTagLists.at(0), selectedTagsObject)) {
                        setIsCannotDeleteOrDisableLastTagModalVisible(true);
                        return;
                    }
                    setIsDeleteTagsConfirmModalVisible(true);
                },
            });
        }
        var enabledTagCount = 0;
        var tagsToDisable = {};
        var disabledTagCount = 0;
        var tagsToEnable = {};
        for (var _i = 0, selectedTags_1 = selectedTags; _i < selectedTags_1.length; _i++) {
            var tagName = selectedTags_1[_i];
            if ((_a = filteredTagListKeyedByName[tagName]) === null || _a === void 0 ? void 0 : _a.enabled) {
                enabledTagCount++;
                tagsToDisable[tagName] = {
                    name: tagName,
                    enabled: false,
                };
            }
            else {
                disabledTagCount++;
                tagsToEnable[tagName] = {
                    name: tagName,
                    enabled: true,
                };
            }
        }
        if (enabledTagCount > 0 && !isMultiLevelTags) {
            options.push({
                icon: Expensicons.Close,
                text: translate(enabledTagCount === 1 ? 'workspace.tags.disableTag' : 'workspace.tags.disableTags'),
                value: CONST_1.default.POLICY.BULK_ACTION_TYPES.DISABLE,
                onSelected: function () {
                    if ((0, OptionsListUtils_1.isDisablingOrDeletingLastEnabledTag)(policyTagLists.at(0), selectedTagsObject)) {
                        setIsCannotDeleteOrDisableLastTagModalVisible(true);
                        return;
                    }
                    setSelectedTags([]);
                    (0, Tag_1.setWorkspaceTagEnabled)(policyID, tagsToDisable, 0);
                },
            });
        }
        if (disabledTagCount > 0 && !isMultiLevelTags) {
            options.push({
                icon: Expensicons.Checkmark,
                text: translate(disabledTagCount === 1 ? 'workspace.tags.enableTag' : 'workspace.tags.enableTags'),
                value: CONST_1.default.POLICY.BULK_ACTION_TYPES.ENABLE,
                onSelected: function () {
                    setSelectedTags([]);
                    (0, Tag_1.setWorkspaceTagEnabled)(policyID, tagsToEnable, 0);
                },
            });
        }
        var requiredTagCount = 0;
        var tagListIndexesToMarkRequired = [];
        var optionalTagCount = 0;
        var tagListIndexesToMarkOptional = [];
        for (var _g = 0, selectedTags_2 = selectedTags; _g < selectedTags_2.length; _g++) {
            var tagName = selectedTags_2[_g];
            if ((_b = filteredTagListKeyedByName[tagName]) === null || _b === void 0 ? void 0 : _b.required) {
                requiredTagCount++;
                tagListIndexesToMarkOptional.push((_d = (_c = filteredTagListKeyedByName[tagName]) === null || _c === void 0 ? void 0 : _c.orderWeight) !== null && _d !== void 0 ? _d : 0);
            }
            else {
                optionalTagCount++;
                tagListIndexesToMarkRequired.push((_f = (_e = filteredTagListKeyedByName[tagName]) === null || _e === void 0 ? void 0 : _e.orderWeight) !== null && _f !== void 0 ? _f : 0);
            }
        }
        if (requiredTagCount > 0 && !hasDependentTags && isMultiLevelTags) {
            options.push({
                icon: Expensicons.Close,
                text: translate('workspace.tags.notRequireTags'),
                value: CONST_1.default.POLICY.BULK_ACTION_TYPES.REQUIRE,
                onSelected: function () {
                    if ((0, OptionsListUtils_1.isMakingLastRequiredTagListOptional)(policy, policyTags, selectedTagLists)) {
                        setIsCannotMakeLastTagOptionalModalVisible(true);
                        return;
                    }
                    setSelectedTags([]);
                    (0, Tag_1.setWorkspaceTagRequired)(policyID, tagListIndexesToMarkOptional, false, policyTags);
                },
            });
        }
        if (optionalTagCount > 0 && !hasDependentTags && isMultiLevelTags) {
            options.push({
                icon: Expensicons.Checkmark,
                text: translate(requiredTagCount === 1 ? 'workspace.tags.requireTag' : 'workspace.tags.requireTags'),
                value: CONST_1.default.POLICY.BULK_ACTION_TYPES.NOT_REQUIRED,
                onSelected: function () {
                    setSelectedTags([]);
                    (0, Tag_1.setWorkspaceTagRequired)(policyID, tagListIndexesToMarkRequired, true, policyTags);
                },
            });
        }
        return (<ButtonWithDropdownMenu_1.default onPress={function () { return null; }} shouldAlwaysShowDropdownMenu isSplitButton={false} buttonSize={CONST_1.default.DROPDOWN_BUTTON_SIZE.MEDIUM} customText={translate('workspace.common.selected', { count: selectedTags.length })} options={options} style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]} isDisabled={!selectedTags.length} testID={"".concat(WorkspaceTagsPage.displayName, "-header-dropdown-menu-button")}/>);
    };
    var selectionModeHeader = (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) && shouldUseNarrowLayout;
    var headerContent = (<>
            <react_native_1.View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : undefined]}>
                {!hasSyncError && isConnectionVerified ? (<Text_1.default>
                        <Text_1.default style={[styles.textNormal, styles.colorMuted]}>{"".concat(translate('workspace.tags.importedFromAccountingSoftware'), " ")}</Text_1.default>
                        <TextLink_1.default style={[styles.textNormal, styles.link]} href={"".concat(environmentURL, "/").concat(ROUTES_1.default.POLICY_ACCOUNTING.getRoute(policyID))}>
                            {"".concat(currentConnectionName, " ").concat(translate('workspace.accounting.settings'))}
                        </TextLink_1.default>
                        <Text_1.default style={[styles.textNormal, styles.colorMuted]}>.</Text_1.default>
                    </Text_1.default>) : (<Text_1.default style={[styles.textNormal, styles.colorMuted]}>
                        {translate('workspace.tags.subtitle')}
                        {hasDependentTags && (<>
                                <Text_1.default style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.tags.dependentMultiLevelTagsSubtitle.phrase1')}</Text_1.default>
                                <TextLink_1.default style={[styles.textNormal, styles.link]} 
            // TODO: Add a actual link to the help article https://github.com/Expensify/App/issues/63612
            href={CONST_1.default.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}>
                                    {translate('workspace.tags.dependentMultiLevelTagsSubtitle.phrase2')}
                                </TextLink_1.default>
                                <Text_1.default style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.tags.dependentMultiLevelTagsSubtitle.phrase3')}</Text_1.default>
                                <TextLink_1.default style={[styles.textNormal, styles.link]} onPress={function () {
                    Navigation_1.default.navigate(isQuickSettingsFlow
                        ? ROUTES_1.default.SETTINGS_TAGS_IMPORT.getRoute(policyID, ROUTES_1.default.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo))
                        : ROUTES_1.default.WORKSPACE_TAGS_IMPORT_OPTIONS.getRoute(policyID));
                }}>
                                    {translate('workspace.tags.dependentMultiLevelTagsSubtitle.phrase4')}
                                </TextLink_1.default>
                                <Text_1.default style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.tags.dependentMultiLevelTagsSubtitle.phrase5')}</Text_1.default>
                            </>)}
                    </Text_1.default>)}
            </react_native_1.View>
            {tagList.length > CONST_1.default.SEARCH_ITEM_LIMIT && (<SearchBar_1.default label={translate('workspace.tags.findTag')} inputValue={inputValue} onChangeText={setInputValue} shouldShowEmptyState={hasVisibleTags && !isLoading && !filteredTagList.length}/>)}
        </>);
    var emptyTagsCopy = hasAccountingConnections ? 'emptyTagsWithAccounting' : 'emptyTags';
    var subtitleText = (0, react_1.useMemo)(function () { return (<Text_1.default style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal]}>
                {translate("workspace.tags.".concat(emptyTagsCopy, ".subtitle1"))}
                {hasAccountingConnections ? (<TextLink_1.default style={[styles.textAlignCenter]} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING.getRoute(policyID)); }}>
                        {translate("workspace.tags.".concat(emptyTagsCopy, ".subtitle2"))}
                    </TextLink_1.default>) : (<TextLink_1.default style={[styles.textAlignCenter]} href={CONST_1.default.IMPORT_TAGS_EXPENSIFY_URL}>
                        {translate("workspace.tags.".concat(emptyTagsCopy, ".subtitle2"))}
                    </TextLink_1.default>)}
                {translate("workspace.tags.".concat(emptyTagsCopy, ".subtitle3"))}
            </Text_1.default>); }, [styles.textAlignCenter, styles.textNormal, styles.textSupporting, translate, emptyTagsCopy, hasAccountingConnections, policyID]);
    return (<>
            <AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}>
                <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={WorkspaceTagsPage.displayName} shouldShowOfflineIndicatorInWideScreen offlineIndicatorStyle={styles.mtAuto}>
                    <HeaderWithBackButton_1.default icon={!selectionModeHeader ? Illustrations.Tag : undefined} shouldUseHeadlineHeader={!selectionModeHeader} title={translate(selectionModeHeader ? 'common.selectMultiple' : 'workspace.common.tags')} shouldShowBackButton={shouldUseNarrowLayout} onBackButtonPress={function () {
            if (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) {
                setSelectedTags([]);
                (0, MobileSelectionMode_1.turnOffMobileSelectionMode)();
                return;
            }
            if (backTo) {
                Navigation_1.default.goBack(backTo);
                return;
            }
            Navigation_1.default.popToSidebar();
        }}>
                        {!shouldUseNarrowLayout && getHeaderButtons()}
                    </HeaderWithBackButton_1.default>
                    {shouldUseNarrowLayout && <react_native_1.View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</react_native_1.View>}
                    {(!hasVisibleTags || isLoading) && headerContent}
                    {isLoading && (<react_native_1.ActivityIndicator size={CONST_1.default.ACTIVITY_INDICATOR_SIZE.LARGE} style={[styles.flex1]} color={theme.spinner}/>)}
                    {hasVisibleTags && !isLoading && (<SelectionListWithModal_1.default canSelectMultiple={canSelectMultiple} turnOnSelectionModeOnLongPress={!hasDependentTags} onTurnOnSelectionMode={function (item) { return item && toggleTag(item); }} sections={[{ data: filteredTagList, isDisabled: false }]} shouldUseDefaultRightHandSideCheckmark={false} selectedItems={selectedTags} isSelected={isTagSelected} onCheckboxPress={toggleTag} onSelectRow={navigateToTagSettings} shouldSingleExecuteRowSelect={!canSelectMultiple} onSelectAll={filteredTagList.length > 0 ? toggleAllTags : undefined} ListItem={TableListItem_1.default} customListHeader={filteredTagList.length > 0 ? getCustomListHeader() : undefined} shouldPreventDefaultFocusOnSelectRow={!(0, DeviceCapabilities_1.canUseTouchScreen)()} listHeaderContent={headerContent} shouldShowListEmptyContent={false} listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]} onDismissError={function (item) { return !hasDependentTags && (0, Tag_1.clearPolicyTagErrors)(policyID, item.value, 0); }} showScrollIndicator={false} addBottomSafeAreaPadding/>)}
                    {!hasVisibleTags && !isLoading && (<ScrollView_1.default contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
                            <EmptyStateComponent_1.default SkeletonComponent={TableRowSkeleton_1.default} headerMediaType={CONST_1.default.EMPTY_STATE_MEDIA.ANIMATION} headerMedia={LottieAnimations_1.default.GenericEmptyState} title={translate('workspace.tags.emptyTags.title')} subtitleText={subtitleText} headerStyles={[styles.emptyStateCardIllustrationContainer, styles.emptyFolderBG]} lottieWebViewStyles={styles.emptyStateFolderWebStyles} headerContentStyles={styles.emptyStateFolderWebStyles} buttons={!hasAccountingConnections
                ? [
                    {
                        success: true,
                        buttonAction: navigateToCreateTagPage,
                        icon: Expensicons.Plus,
                        buttonText: translate('workspace.tags.addTag'),
                    },
                    {
                        icon: Expensicons.Table,
                        buttonText: translate('common.import'),
                        buttonAction: navigateToImportSpreadsheet,
                    },
                ]
                : undefined}/>
                        </ScrollView_1.default>)}
                </ScreenWrapper_1.default>
            </AccessOrNotFoundWrapper_1.default>
            <ConfirmModal_1.default isVisible={isOfflineModalVisible} onConfirm={function () { return setIsOfflineModalVisible(false); }} title={translate('common.youAppearToBeOffline')} prompt={translate('common.thisFeatureRequiresInternet')} confirmText={translate('common.buttonConfirm')} shouldShowCancelButton={false} onCancel={function () { return setIsOfflineModalVisible(false); }} shouldHandleNavigationBack/>
            <DecisionModal_1.default title={translate('common.downloadFailedTitle')} prompt={translate('common.downloadFailedDescription')} isSmallScreenWidth={isSmallScreenWidth} onSecondOptionSubmit={function () { return setIsDownloadFailureModalVisible(false); }} secondOptionText={translate('common.buttonConfirm')} isVisible={isDownloadFailureModalVisible} onClose={function () { return setIsDownloadFailureModalVisible(false); }}/>
            <ConfirmModal_1.default isVisible={isDeleteTagsConfirmModalVisible} onConfirm={deleteTags} onCancel={function () { return setIsDeleteTagsConfirmModalVisible(false); }} title={translate(selectedTags.length === 1 ? 'workspace.tags.deleteTag' : 'workspace.tags.deleteTags')} prompt={translate(selectedTags.length === 1 ? 'workspace.tags.deleteTagConfirmation' : 'workspace.tags.deleteTagsConfirmation')} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger/>
            <ConfirmModal_1.default isVisible={isCannotDeleteOrDisableLastTagModalVisible} onConfirm={function () { return setIsCannotDeleteOrDisableLastTagModalVisible(false); }} onCancel={function () { return setIsCannotDeleteOrDisableLastTagModalVisible(false); }} title={translate('workspace.tags.cannotDeleteOrDisableAllTags.title')} prompt={translate('workspace.tags.cannotDeleteOrDisableAllTags.description')} confirmText={translate('common.buttonConfirm')} shouldShowCancelButton={false}/>
            <ConfirmModal_1.default isVisible={isCannotMakeLastTagOptionalModalVisible} onConfirm={function () { return setIsCannotMakeLastTagOptionalModalVisible(false); }} onCancel={function () { return setIsCannotMakeLastTagOptionalModalVisible(false); }} title={translate('workspace.tags.cannotMakeAllTagsOptional.title')} prompt={translate('workspace.tags.cannotMakeAllTagsOptional.description')} confirmText={translate('common.buttonConfirm')} shouldShowCancelButton={false}/>
        </>);
}
WorkspaceTagsPage.displayName = 'WorkspaceTagsPage';
exports.default = WorkspaceTagsPage;
