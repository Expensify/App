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
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var ButtonWithDropdownMenu_1 = require("@components/ButtonWithDropdownMenu");
var ConfirmModal_1 = require("@components/ConfirmModal");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SearchBar_1 = require("@components/SearchBar");
var ListItemRightCaretWithLabel_1 = require("@components/SelectionList/ListItemRightCaretWithLabel");
var TableListItem_1 = require("@components/SelectionList/TableListItem");
var SelectionListWithModal_1 = require("@components/SelectionListWithModal");
var CustomListHeader_1 = require("@components/SelectionListWithModal/CustomListHeader");
var Switch_1 = require("@components/Switch");
var useFilteredSelection_1 = require("@hooks/useFilteredSelection");
var useLocalize_1 = require("@hooks/useLocalize");
var useMobileSelectionMode_1 = require("@hooks/useMobileSelectionMode");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSearchBackPress_1 = require("@hooks/useSearchBackPress");
var useSearchResults_1 = require("@hooks/useSearchResults");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var MobileSelectionMode_1 = require("@libs/actions/MobileSelectionMode");
var Tag_1 = require("@libs/actions/Policy/Tag");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var LocaleCompare_1 = require("@libs/LocaleCompare");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var StringUtils_1 = require("@libs/StringUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
function WorkspaceViewTagsPage(_a) {
    var _b, _c, _d, _e, _f;
    var route = _a.route;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout for the small screen selection mode
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _g = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _g.shouldUseNarrowLayout, isSmallScreenWidth = _g.isSmallScreenWidth;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var dropdownButtonRef = (0, react_1.useRef)(null);
    var _h = (0, react_1.useState)(false), isDeleteTagsConfirmModalVisible = _h[0], setIsDeleteTagsConfirmModalVisible = _h[1];
    var isFocused = (0, native_1.useIsFocused)();
    var policyID = route.params.policyID;
    var backTo = route.params.backTo;
    var policy = (0, usePolicy_1.default)(policyID);
    var policyTags = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID), { canBeMissing: false })[0];
    var selectionMode = (0, useMobileSelectionMode_1.default)().selectionMode;
    var currentTagListName = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.getTagListName)(policyTags, route.params.orderWeight); }, [policyTags, route.params.orderWeight]);
    var hasDependentTags = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.hasDependentTags)(policy, policyTags); }, [policy, policyTags]);
    var currentPolicyTag = policyTags === null || policyTags === void 0 ? void 0 : policyTags[currentTagListName];
    var isQuickSettingsFlow = route.name === SCREENS_1.default.SETTINGS_TAGS.SETTINGS_TAG_LIST_VIEW;
    var _j = (0, react_1.useState)(false), isCannotMakeAllTagsOptionalModalVisible = _j[0], setIsCannotMakeAllTagsOptionalModalVisible = _j[1];
    var _k = (0, react_1.useState)(false), isCannotDeleteOrDisableLastTagModalVisible = _k[0], setIsCannotDeleteOrDisableLastTagModalVisible = _k[1];
    var fetchTags = (0, react_1.useCallback)(function () {
        (0, Tag_1.openPolicyTagsPage)(policyID);
    }, [policyID]);
    var filterFunction = (0, react_1.useCallback)(function (tag) { return !!tag && tag.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE; }, []);
    var _l = (0, useFilteredSelection_1.default)(currentPolicyTag === null || currentPolicyTag === void 0 ? void 0 : currentPolicyTag.tags, filterFunction), selectedTags = _l[0], setSelectedTags = _l[1];
    var isOffline = (0, useNetwork_1.default)({ onReconnect: fetchTags }).isOffline;
    var canSelectMultiple = (0, react_1.useMemo)(function () {
        if (hasDependentTags) {
            return false;
        }
        return isSmallScreenWidth ? selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled : true;
    }, [hasDependentTags, isSmallScreenWidth, selectionMode]);
    (0, react_1.useEffect)(function () {
        if (isFocused) {
            return;
        }
        return function () {
            (0, MobileSelectionMode_1.turnOffMobileSelectionMode)();
        };
    }, [isFocused]);
    (0, useSearchBackPress_1.default)({
        onClearSelection: function () {
            setSelectedTags([]);
        },
        onNavigationCallBack: function () { return Navigation_1.default.goBack(isQuickSettingsFlow ? ROUTES_1.default.SETTINGS_TAGS_ROOT.getRoute(policyID) : undefined); },
    });
    var updateWorkspaceTagEnabled = (0, react_1.useCallback)(function (value, tagName) {
        var _a;
        (0, Tag_1.setWorkspaceTagEnabled)(policyID, (_a = {}, _a[tagName] = { name: tagName, enabled: value }, _a), route.params.orderWeight);
    }, [policyID, route.params.orderWeight]);
    var tagList = (0, react_1.useMemo)(function () {
        var _a;
        return Object.values((_a = currentPolicyTag === null || currentPolicyTag === void 0 ? void 0 : currentPolicyTag.tags) !== null && _a !== void 0 ? _a : {}).map(function (tag) {
            var _a, _b, _c;
            return ({
                value: tag.name,
                text: hasDependentTags ? tag.name : (0, PolicyUtils_1.getCleanedTagName)(tag.name),
                keyForList: hasDependentTags ? "".concat(tag.name, "-").concat((_b = (_a = tag.rules) === null || _a === void 0 ? void 0 : _a.parentTagsFilter) !== null && _b !== void 0 ? _b : '') : tag.name,
                isSelected: selectedTags.includes(tag.name) && canSelectMultiple,
                pendingAction: tag.pendingAction,
                rules: tag.rules,
                errors: (_c = tag.errors) !== null && _c !== void 0 ? _c : undefined,
                enabled: tag.enabled,
                isDisabled: tag.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                rightElement: hasDependentTags ? (<ListItemRightCaretWithLabel_1.default shouldShowCaret/>) : (<Switch_1.default isOn={tag.enabled} disabled={tag.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE} accessibilityLabel={translate('workspace.tags.enableTag')} onToggle={function (newValue) {
                        if ((0, OptionsListUtils_1.isDisablingOrDeletingLastEnabledTag)(currentPolicyTag, [tag])) {
                            setIsCannotDeleteOrDisableLastTagModalVisible(true);
                            return;
                        }
                        updateWorkspaceTagEnabled(newValue, tag.name);
                    }} showLockIcon={(0, OptionsListUtils_1.isDisablingOrDeletingLastEnabledTag)(currentPolicyTag, [tag])}/>),
            });
        });
    }, [currentPolicyTag, hasDependentTags, selectedTags, canSelectMultiple, translate, updateWorkspaceTagEnabled]);
    var filterTag = (0, react_1.useCallback)(function (tag, searchInput) {
        var _a, _b, _c, _d, _e;
        var tagText = StringUtils_1.default.normalize((_b = (_a = tag.text) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : '');
        var tagValue = StringUtils_1.default.normalize((_d = (_c = tag.text) === null || _c === void 0 ? void 0 : _c.toLowerCase()) !== null && _d !== void 0 ? _d : '');
        var normalizedSearchInput = StringUtils_1.default.normalize((_e = searchInput.toLowerCase()) !== null && _e !== void 0 ? _e : '');
        return tagText.includes(normalizedSearchInput) || tagValue.includes(normalizedSearchInput);
    }, []);
    var sortTags = (0, react_1.useCallback)(function (tags) { return tags.sort(function (tagA, tagB) { return (0, LocaleCompare_1.default)(tagA.value, tagB.value); }); }, []);
    var _m = (0, useSearchResults_1.default)(tagList, filterTag, sortTags), inputValue = _m[0], setInputValue = _m[1], filteredTagList = _m[2];
    var tagListKeyedByName = (0, react_1.useMemo)(function () {
        return filteredTagList.reduce(function (acc, tag) {
            acc[tag.value] = tag;
            return acc;
        }, {});
    }, [filteredTagList]);
    if (!currentPolicyTag) {
        return <NotFoundPage_1.default />;
    }
    var toggleTag = function (tag) {
        setSelectedTags(function (prev) {
            if (prev.includes(tag.value)) {
                return prev.filter(function (selectedTag) { return selectedTag !== tag.value; });
            }
            return __spreadArray(__spreadArray([], prev, true), [tag.value], false);
        });
    };
    var toggleAllTags = function () {
        var availableTags = filteredTagList.filter(function (tag) { return tag.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE; });
        var anySelected = availableTags.some(function (tag) { return selectedTags.includes(tag.value); });
        setSelectedTags(anySelected ? [] : availableTags.map(function (tag) { return tag.value; }));
    };
    var getCustomListHeader = function () {
        if (filteredTagList.length === 0) {
            return null;
        }
        return (<CustomListHeader_1.default canSelectMultiple={canSelectMultiple} leftHeaderText={translate('common.name')} rightHeaderText={hasDependentTags ? undefined : translate('common.enabled')}/>);
    };
    var navigateToTagSettings = function (tag) {
        var _a, _b;
        Navigation_1.default.navigate(isQuickSettingsFlow
            ? ROUTES_1.default.SETTINGS_TAG_SETTINGS.getRoute(policyID, route.params.orderWeight, tag.value, backTo)
            : ROUTES_1.default.WORKSPACE_TAG_SETTINGS.getRoute(policyID, route.params.orderWeight, tag.value, (_b = (_a = tag === null || tag === void 0 ? void 0 : tag.rules) === null || _a === void 0 ? void 0 : _a.parentTagsFilter) !== null && _b !== void 0 ? _b : undefined));
    };
    var deleteTags = function () {
        (0, Tag_1.deletePolicyTags)(policyID, selectedTags);
        setIsDeleteTagsConfirmModalVisible(false);
        react_native_1.InteractionManager.runAfterInteractions(function () {
            setSelectedTags([]);
        });
    };
    var isLoading = !isOffline && policyTags === undefined;
    var listHeaderContent = tagList.length > CONST_1.default.SEARCH_ITEM_LIMIT ? (<SearchBar_1.default inputValue={inputValue} onChangeText={setInputValue} label={translate('workspace.tags.findTag')} shouldShowEmptyState={filteredTagList.length === 0 && !isLoading}/>) : undefined;
    var getHeaderButtons = function () {
        var _a, _b;
        if ((!isSmallScreenWidth && selectedTags.length === 0) || (isSmallScreenWidth && !(selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled))) {
            return null;
        }
        var options = [];
        var isThereAnyAccountingConnection = Object.keys((_a = policy === null || policy === void 0 ? void 0 : policy.connections) !== null && _a !== void 0 ? _a : {}).length !== 0;
        var isMultiLevelTags = (0, PolicyUtils_1.isMultiLevelTags)(policyTags);
        if (!isThereAnyAccountingConnection && !isMultiLevelTags && selectedTags.length > 0) {
            options.push({
                icon: Expensicons.Trashcan,
                text: translate(selectedTags.length === 1 ? 'workspace.tags.deleteTag' : 'workspace.tags.deleteTags'),
                value: CONST_1.default.POLICY.BULK_ACTION_TYPES.DELETE,
                onSelected: function () { return setIsDeleteTagsConfirmModalVisible(true); },
            });
        }
        var enabledTagCount = 0;
        var tagsToDisable = {};
        var disabledTagCount = 0;
        var tagsToEnable = {};
        for (var _i = 0, selectedTags_1 = selectedTags; _i < selectedTags_1.length; _i++) {
            var tagName = selectedTags_1[_i];
            if ((_b = tagListKeyedByName[tagName]) === null || _b === void 0 ? void 0 : _b.enabled) {
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
        if (enabledTagCount > 0) {
            var selectedTagsObject_1 = selectedTags.map(function (key) { return currentPolicyTag === null || currentPolicyTag === void 0 ? void 0 : currentPolicyTag.tags[key]; });
            options.push({
                icon: Expensicons.Close,
                text: translate(enabledTagCount === 1 ? 'workspace.tags.disableTag' : 'workspace.tags.disableTags'),
                value: CONST_1.default.POLICY.BULK_ACTION_TYPES.DISABLE,
                onSelected: function () {
                    if ((0, OptionsListUtils_1.isDisablingOrDeletingLastEnabledTag)(currentPolicyTag, selectedTagsObject_1)) {
                        setIsCannotDeleteOrDisableLastTagModalVisible(true);
                        return;
                    }
                    setSelectedTags([]);
                    (0, Tag_1.setWorkspaceTagEnabled)(policyID, tagsToDisable, route.params.orderWeight);
                },
            });
        }
        if (disabledTagCount > 0) {
            options.push({
                icon: Expensicons.Checkmark,
                text: translate(disabledTagCount === 1 ? 'workspace.tags.enableTag' : 'workspace.tags.enableTags'),
                value: CONST_1.default.POLICY.BULK_ACTION_TYPES.ENABLE,
                onSelected: function () {
                    setSelectedTags([]);
                    (0, Tag_1.setWorkspaceTagEnabled)(policyID, tagsToEnable, route.params.orderWeight);
                },
            });
        }
        return (<ButtonWithDropdownMenu_1.default buttonRef={dropdownButtonRef} onPress={function () { return null; }} shouldAlwaysShowDropdownMenu isSplitButton={false} buttonSize={CONST_1.default.DROPDOWN_BUTTON_SIZE.MEDIUM} customText={translate('workspace.common.selected', { count: selectedTags.length })} options={options} style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]} isDisabled={!selectedTags.length}/>);
    };
    if (!!(currentPolicyTag === null || currentPolicyTag === void 0 ? void 0 : currentPolicyTag.required) && !Object.values((_b = currentPolicyTag === null || currentPolicyTag === void 0 ? void 0 : currentPolicyTag.tags) !== null && _b !== void 0 ? _b : {}).some(function (tag) { return tag.enabled; })) {
        (0, Tag_1.setPolicyTagsRequired)(policyID, false, route.params.orderWeight);
    }
    var navigateToEditTag = function () {
        var _a, _b;
        Navigation_1.default.navigate(isQuickSettingsFlow
            ? ROUTES_1.default.SETTINGS_TAGS_EDIT.getRoute(route.params.policyID, (_a = currentPolicyTag === null || currentPolicyTag === void 0 ? void 0 : currentPolicyTag.orderWeight) !== null && _a !== void 0 ? _a : 0, backTo)
            : ROUTES_1.default.WORKSPACE_EDIT_TAGS.getRoute(route.params.policyID, (_b = currentPolicyTag === null || currentPolicyTag === void 0 ? void 0 : currentPolicyTag.orderWeight) !== null && _b !== void 0 ? _b : 0, Navigation_1.default.getActiveRoute()));
    };
    var selectionModeHeader = (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) && isSmallScreenWidth;
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding shouldEnableMaxHeight testID={WorkspaceViewTagsPage.displayName}>
                <HeaderWithBackButton_1.default title={selectionModeHeader ? translate('common.selectMultiple') : currentTagListName} onBackButtonPress={function () {
            if (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) {
                setSelectedTags([]);
                (0, MobileSelectionMode_1.turnOffMobileSelectionMode)();
                return;
            }
            Navigation_1.default.goBack(isQuickSettingsFlow ? ROUTES_1.default.SETTINGS_TAGS_ROOT.getRoute(policyID) : undefined);
        }}>
                    {!shouldUseNarrowLayout && getHeaderButtons()}
                </HeaderWithBackButton_1.default>
                {shouldUseNarrowLayout && <react_native_1.View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</react_native_1.View>}
                <ConfirmModal_1.default isVisible={isDeleteTagsConfirmModalVisible} onConfirm={deleteTags} onCancel={function () { return setIsDeleteTagsConfirmModalVisible(false); }} title={translate(selectedTags.length === 1 ? 'workspace.tags.deleteTag' : 'workspace.tags.deleteTags')} prompt={translate(selectedTags.length === 1 ? 'workspace.tags.deleteTagConfirmation' : 'workspace.tags.deleteTagsConfirmation')} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger/>
                {!hasDependentTags && (<react_native_1.View style={[styles.pv4, styles.ph5]}>
                        <ToggleSettingsOptionRow_1.default title={translate('common.required')} switchAccessibilityLabel={translate('common.required')} isActive={!!(currentPolicyTag === null || currentPolicyTag === void 0 ? void 0 : currentPolicyTag.required)} onToggle={function (on) {
                if ((0, OptionsListUtils_1.isMakingLastRequiredTagListOptional)(policy, policyTags, [currentPolicyTag])) {
                    setIsCannotMakeAllTagsOptionalModalVisible(true);
                    return;
                }
                (0, Tag_1.setPolicyTagsRequired)(policyID, on, route.params.orderWeight);
            }} pendingAction={(_c = currentPolicyTag.pendingFields) === null || _c === void 0 ? void 0 : _c.required} errors={(_e = (_d = currentPolicyTag === null || currentPolicyTag === void 0 ? void 0 : currentPolicyTag.errorFields) === null || _d === void 0 ? void 0 : _d.required) !== null && _e !== void 0 ? _e : undefined} onCloseError={function () { return (0, Tag_1.clearPolicyTagListErrorField)(policyID, route.params.orderWeight, 'required'); }} disabled={!(currentPolicyTag === null || currentPolicyTag === void 0 ? void 0 : currentPolicyTag.required) && !Object.values((_f = currentPolicyTag === null || currentPolicyTag === void 0 ? void 0 : currentPolicyTag.tags) !== null && _f !== void 0 ? _f : {}).some(function (tag) { return tag.enabled; })} showLockIcon={(0, OptionsListUtils_1.isMakingLastRequiredTagListOptional)(policy, policyTags, [currentPolicyTag])}/>
                    </react_native_1.View>)}
                <OfflineWithFeedback_1.default errors={currentPolicyTag.errors} onClose={function () { return (0, Tag_1.clearPolicyTagListErrors)(policyID, currentPolicyTag.orderWeight); }} pendingAction={currentPolicyTag.pendingAction} errorRowStyles={styles.mh5}>
                    <MenuItemWithTopDescription_1.default title={(0, PolicyUtils_1.getCleanedTagName)(currentPolicyTag.name)} description={translate("workspace.tags.customTagName")} onPress={navigateToEditTag} shouldShowRightIcon/>
                </OfflineWithFeedback_1.default>
                {isLoading && (<react_native_1.ActivityIndicator size={CONST_1.default.ACTIVITY_INDICATOR_SIZE.LARGE} style={[styles.flex1]} color={theme.spinner}/>)}
                {tagList.length > 0 && !isLoading && (<SelectionListWithModal_1.default canSelectMultiple={canSelectMultiple} turnOnSelectionModeOnLongPress={!hasDependentTags} onTurnOnSelectionMode={function (item) { return item && toggleTag(item); }} sections={[{ data: filteredTagList, isDisabled: false }]} selectedItems={selectedTags} shouldUseDefaultRightHandSideCheckmark={false} onCheckboxPress={toggleTag} onSelectRow={navigateToTagSettings} onSelectAll={filteredTagList.length > 0 ? toggleAllTags : undefined} showScrollIndicator ListItem={TableListItem_1.default} customListHeader={getCustomListHeader()} listHeaderContent={listHeaderContent} shouldShowListEmptyContent={false} shouldPreventDefaultFocusOnSelectRow={!(0, DeviceCapabilities_1.canUseTouchScreen)()} listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]} addBottomSafeAreaPadding onDismissError={function (item) {
                (0, Tag_1.clearPolicyTagErrors)(policyID, item.value, route.params.orderWeight);
            }}/>)}
                <ConfirmModal_1.default isVisible={isCannotDeleteOrDisableLastTagModalVisible} onConfirm={function () { return setIsCannotDeleteOrDisableLastTagModalVisible(false); }} onCancel={function () { return setIsCannotDeleteOrDisableLastTagModalVisible(false); }} title={translate('workspace.tags.cannotDeleteOrDisableAllTags.title')} prompt={translate('workspace.tags.cannotDeleteOrDisableAllTags.description')} confirmText={translate('common.buttonConfirm')} shouldShowCancelButton={false}/>
                <ConfirmModal_1.default isVisible={isCannotMakeAllTagsOptionalModalVisible} onConfirm={function () { return setIsCannotMakeAllTagsOptionalModalVisible(false); }} onCancel={function () { return setIsCannotMakeAllTagsOptionalModalVisible(false); }} title={translate('workspace.tags.cannotMakeAllTagsOptional.title')} prompt={translate('workspace.tags.cannotMakeAllTagsOptional.description')} confirmText={translate('common.buttonConfirm')} shouldShowCancelButton={false}/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceViewTagsPage.displayName = 'WorkspaceViewTagsPage';
exports.default = WorkspaceViewTagsPage;
