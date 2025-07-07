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
var TableListItem_1 = require("@components/SelectionList/TableListItem");
var SelectionListWithModal_1 = require("@components/SelectionListWithModal");
var CustomListHeader_1 = require("@components/SelectionListWithModal/CustomListHeader");
var TableRowSkeleton_1 = require("@components/Skeletons/TableRowSkeleton");
var Switch_1 = require("@components/Switch");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useAutoTurnSelectionModeOffWhenHasNoActiveOption_1 = require("@hooks/useAutoTurnSelectionModeOffWhenHasNoActiveOption");
var useCleanupSelectedOptions_1 = require("@hooks/useCleanupSelectedOptions");
var useEnvironment_1 = require("@hooks/useEnvironment");
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
var connections_1 = require("@libs/actions/connections");
var MobileSelectionMode_1 = require("@libs/actions/MobileSelectionMode");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var LocaleCompare_1 = require("@libs/LocaleCompare");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var StringUtils_1 = require("@libs/StringUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var Modal_1 = require("@userActions/Modal");
var Category_1 = require("@userActions/Policy/Category");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
function WorkspaceCategoriesPage(_a) {
    var _b, _c;
    var route = _a.route;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _d = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _d.shouldUseNarrowLayout, isSmallScreenWidth = _d.isSmallScreenWidth;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _e = (0, react_1.useState)(false), isOfflineModalVisible = _e[0], setIsOfflineModalVisible = _e[1];
    var _f = (0, react_1.useState)(false), isDownloadFailureModalVisible = _f[0], setIsDownloadFailureModalVisible = _f[1];
    var _g = (0, react_1.useState)(false), deleteCategoriesConfirmModalVisible = _g[0], setDeleteCategoriesConfirmModalVisible = _g[1];
    var _h = (0, react_1.useState)(false), isCannotDeleteOrDisableLastCategoryModalVisible = _h[0], setIsCannotDeleteOrDisableLastCategoryModalVisible = _h[1];
    var environmentURL = (0, useEnvironment_1.default)().environmentURL;
    var policyId = route.params.policyID;
    var backTo = (_b = route.params) === null || _b === void 0 ? void 0 : _b.backTo;
    var policy = (0, usePolicy_1.default)(policyId);
    var selectionMode = (0, useMobileSelectionMode_1.default)().selectionMode;
    var allTransactionViolations = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS, { canBeMissing: true })[0];
    var policyTagLists = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyId), { canBeMissing: true })[0];
    var policyCategories = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(policyId), { canBeMissing: true })[0];
    var connectionSyncProgress = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS).concat(policy === null || policy === void 0 ? void 0 : policy.id), { canBeMissing: true })[0];
    var isSyncInProgress = (0, connections_1.isConnectionInProgress)(connectionSyncProgress, policy);
    var hasSyncError = (0, PolicyUtils_1.shouldShowSyncError)(policy, isSyncInProgress);
    var connectedIntegration = (_c = (0, PolicyUtils_1.getConnectedIntegration)(policy)) !== null && _c !== void 0 ? _c : connectionSyncProgress === null || connectionSyncProgress === void 0 ? void 0 : connectionSyncProgress.connectionName;
    var isConnectionVerified = connectedIntegration && !(0, connections_1.isConnectionUnverified)(policy, connectedIntegration);
    var currentConnectionName = (0, PolicyUtils_1.getCurrentConnectionName)(policy);
    var isQuickSettingsFlow = route.name === SCREENS_1.default.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_ROOT;
    var filterCategories = (0, react_1.useCallback)(function (category) { return !!category && category.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE; }, []);
    var _j = (0, useFilteredSelection_1.default)(policyCategories, filterCategories), selectedCategories = _j[0], setSelectedCategories = _j[1];
    var canSelectMultiple = isSmallScreenWidth ? selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled : true;
    var fetchCategories = (0, react_1.useCallback)(function () {
        (0, Category_1.openPolicyCategoriesPage)(policyId);
    }, [policyId]);
    var isOffline = (0, useNetwork_1.default)({ onReconnect: fetchCategories }).isOffline;
    (0, react_1.useEffect)(function () {
        fetchCategories();
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    var cleanupSelectedOption = (0, react_1.useCallback)(function () { return setSelectedCategories([]); }, [setSelectedCategories]);
    (0, useCleanupSelectedOptions_1.default)(cleanupSelectedOption);
    (0, useSearchBackPress_1.default)({
        onClearSelection: function () { return setSelectedCategories([]); },
        onNavigationCallBack: function () { return Navigation_1.default.goBack(backTo); },
    });
    var updateWorkspaceCategoryEnabled = (0, react_1.useCallback)(function (value, categoryName) {
        var _a;
        (0, Category_1.setWorkspaceCategoryEnabled)(policyId, (_a = {}, _a[categoryName] = { name: categoryName, enabled: value }, _a), policyTagLists, allTransactionViolations);
    }, [policyId, policyTagLists, allTransactionViolations]);
    var categoryList = (0, react_1.useMemo)(function () {
        var categories = Object.values(policyCategories !== null && policyCategories !== void 0 ? policyCategories : {});
        return categories.reduce(function (acc, value) {
            var _a;
            var isDisabled = value.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
            if (!isOffline && isDisabled) {
                return acc;
            }
            acc.push({
                text: value.name,
                keyForList: value.name,
                isDisabled: isDisabled,
                pendingAction: value.pendingAction,
                errors: (_a = value.errors) !== null && _a !== void 0 ? _a : undefined,
                rightElement: (<Switch_1.default isOn={value.enabled} disabled={isDisabled} accessibilityLabel={translate('workspace.categories.enableCategory')} onToggle={function (newValue) {
                        if ((0, OptionsListUtils_1.isDisablingOrDeletingLastEnabledCategory)(policy, policyCategories, [value])) {
                            setIsCannotDeleteOrDisableLastCategoryModalVisible(true);
                            return;
                        }
                        updateWorkspaceCategoryEnabled(newValue, value.name);
                    }} showLockIcon={(0, OptionsListUtils_1.isDisablingOrDeletingLastEnabledCategory)(policy, policyCategories, [value])}/>),
            });
            return acc;
        }, []);
    }, [policyCategories, isOffline, translate, updateWorkspaceCategoryEnabled, policy]);
    var filterCategory = (0, react_1.useCallback)(function (categoryOption, searchInput) {
        var _a, _b, _c, _d;
        var categoryText = StringUtils_1.default.normalize((_b = (_a = categoryOption.text) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : '');
        var alternateText = StringUtils_1.default.normalize((_d = (_c = categoryOption.alternateText) === null || _c === void 0 ? void 0 : _c.toLowerCase()) !== null && _d !== void 0 ? _d : '');
        var normalizedSearchInput = StringUtils_1.default.normalize(searchInput);
        return categoryText.includes(normalizedSearchInput) || alternateText.includes(normalizedSearchInput);
    }, []);
    var sortCategories = (0, react_1.useCallback)(function (data) {
        return data.sort(function (a, b) { var _a, _b; return (0, LocaleCompare_1.default)((_a = a.text) !== null && _a !== void 0 ? _a : '', (_b = b === null || b === void 0 ? void 0 : b.text) !== null && _b !== void 0 ? _b : ''); });
    }, []);
    var _k = (0, useSearchResults_1.default)(categoryList, filterCategory, sortCategories), inputValue = _k[0], setInputValue = _k[1], filteredCategoryList = _k[2];
    (0, useAutoTurnSelectionModeOffWhenHasNoActiveOption_1.default)(categoryList);
    var toggleCategory = (0, react_1.useCallback)(function (category) {
        setSelectedCategories(function (prev) {
            if (prev.includes(category.keyForList)) {
                return prev.filter(function (key) { return key !== category.keyForList; });
            }
            return __spreadArray(__spreadArray([], prev, true), [category.keyForList], false);
        });
    }, [setSelectedCategories]);
    var toggleAllCategories = function () {
        var availableCategories = filteredCategoryList.filter(function (category) { return category.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE; });
        var someSelected = availableCategories.some(function (category) { return selectedCategories.includes(category.keyForList); });
        setSelectedCategories(someSelected ? [] : availableCategories.map(function (item) { return item.keyForList; }));
    };
    var getCustomListHeader = function () {
        if (filteredCategoryList.length === 0) {
            return null;
        }
        return (<CustomListHeader_1.default canSelectMultiple={canSelectMultiple} leftHeaderText={translate('common.name')} rightHeaderText={translate('common.enabled')}/>);
    };
    var navigateToCategorySettings = function (category) {
        if (isSmallScreenWidth && (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled)) {
            toggleCategory(category);
            return;
        }
        Navigation_1.default.navigate(isQuickSettingsFlow
            ? ROUTES_1.default.SETTINGS_CATEGORY_SETTINGS.getRoute(policyId, category.keyForList, backTo)
            : ROUTES_1.default.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyId, category.keyForList));
    };
    var navigateToCategoriesSettings = (0, react_1.useCallback)(function () {
        Navigation_1.default.navigate(isQuickSettingsFlow ? ROUTES_1.default.SETTINGS_CATEGORIES_SETTINGS.getRoute(policyId, backTo) : ROUTES_1.default.WORKSPACE_CATEGORIES_SETTINGS.getRoute(policyId));
    }, [isQuickSettingsFlow, policyId, backTo]);
    var navigateToCreateCategoryPage = function () {
        Navigation_1.default.navigate(isQuickSettingsFlow ? ROUTES_1.default.SETTINGS_CATEGORY_CREATE.getRoute(policyId, backTo) : ROUTES_1.default.WORKSPACE_CATEGORY_CREATE.getRoute(policyId));
    };
    var dismissError = function (item) {
        (0, Category_1.clearCategoryErrors)(policyId, item.keyForList);
    };
    var handleDeleteCategories = function () {
        (0, Category_1.deleteWorkspaceCategories)(policyId, selectedCategories, policyTagLists, allTransactionViolations);
        setDeleteCategoriesConfirmModalVisible(false);
        react_native_1.InteractionManager.runAfterInteractions(function () {
            setSelectedCategories([]);
        });
    };
    var hasVisibleCategories = categoryList.some(function (category) { return category.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline; });
    var policyHasAccountingConnections = (0, PolicyUtils_1.hasAccountingConnections)(policy);
    var navigateToImportSpreadsheet = (0, react_1.useCallback)(function () {
        if (isOffline) {
            (0, Modal_1.close)(function () { return setIsOfflineModalVisible(true); });
            return;
        }
        Navigation_1.default.navigate(isQuickSettingsFlow
            ? ROUTES_1.default.SETTINGS_CATEGORIES_IMPORT.getRoute(policyId, ROUTES_1.default.SETTINGS_CATEGORIES_ROOT.getRoute(policyId, backTo))
            : ROUTES_1.default.WORKSPACE_CATEGORIES_IMPORT.getRoute(policyId));
    }, [backTo, isOffline, isQuickSettingsFlow, policyId]);
    var secondaryActions = (0, react_1.useMemo)(function () {
        var menuItems = [];
        menuItems.push({
            icon: Expensicons.Gear,
            text: translate('common.settings'),
            onSelected: navigateToCategoriesSettings,
            value: CONST_1.default.POLICY.SECONDARY_ACTIONS.SETTINGS,
        });
        if (!policyHasAccountingConnections) {
            menuItems.push({
                icon: Expensicons.Table,
                text: translate('spreadsheet.importSpreadsheet'),
                onSelected: navigateToImportSpreadsheet,
                value: CONST_1.default.POLICY.SECONDARY_ACTIONS.IMPORT_SPREADSHEET,
            });
        }
        if (hasVisibleCategories) {
            menuItems.push({
                icon: Expensicons.Download,
                text: translate('spreadsheet.downloadCSV'),
                onSelected: function () {
                    if (isOffline) {
                        (0, Modal_1.close)(function () { return setIsOfflineModalVisible(true); });
                        return;
                    }
                    (0, Modal_1.close)(function () {
                        (0, Category_1.downloadCategoriesCSV)(policyId, function () {
                            setIsDownloadFailureModalVisible(true);
                        });
                    });
                },
                value: CONST_1.default.POLICY.SECONDARY_ACTIONS.DOWNLOAD_CSV,
            });
        }
        return menuItems;
    }, [translate, navigateToCategoriesSettings, policyHasAccountingConnections, hasVisibleCategories, navigateToImportSpreadsheet, isOffline, policyId]);
    var getHeaderButtons = function () {
        var _a;
        var options = [];
        var isThereAnyAccountingConnection = Object.keys((_a = policy === null || policy === void 0 ? void 0 : policy.connections) !== null && _a !== void 0 ? _a : {}).length !== 0;
        var selectedCategoriesObject = selectedCategories.map(function (key) { return policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[key]; });
        if (isSmallScreenWidth ? canSelectMultiple : selectedCategories.length > 0) {
            if (!isThereAnyAccountingConnection) {
                options.push({
                    icon: Expensicons.Trashcan,
                    text: translate(selectedCategories.length === 1 ? 'workspace.categories.deleteCategory' : 'workspace.categories.deleteCategories'),
                    value: CONST_1.default.POLICY.BULK_ACTION_TYPES.DELETE,
                    onSelected: function () {
                        if ((0, OptionsListUtils_1.isDisablingOrDeletingLastEnabledCategory)(policy, policyCategories, selectedCategoriesObject)) {
                            setIsCannotDeleteOrDisableLastCategoryModalVisible(true);
                            return;
                        }
                        setDeleteCategoriesConfirmModalVisible(true);
                    },
                });
            }
            var enabledCategories = selectedCategories.filter(function (categoryName) { var _a; return (_a = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[categoryName]) === null || _a === void 0 ? void 0 : _a.enabled; });
            if (enabledCategories.length > 0) {
                var categoriesToDisable_1 = selectedCategories
                    .filter(function (categoryName) { var _a; return (_a = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[categoryName]) === null || _a === void 0 ? void 0 : _a.enabled; })
                    .reduce(function (acc, categoryName) {
                    acc[categoryName] = {
                        name: categoryName,
                        enabled: false,
                    };
                    return acc;
                }, {});
                options.push({
                    icon: Expensicons.Close,
                    text: translate(enabledCategories.length === 1 ? 'workspace.categories.disableCategory' : 'workspace.categories.disableCategories'),
                    value: CONST_1.default.POLICY.BULK_ACTION_TYPES.DISABLE,
                    onSelected: function () {
                        if ((0, OptionsListUtils_1.isDisablingOrDeletingLastEnabledCategory)(policy, policyCategories, selectedCategoriesObject)) {
                            setIsCannotDeleteOrDisableLastCategoryModalVisible(true);
                            return;
                        }
                        setSelectedCategories([]);
                        (0, Category_1.setWorkspaceCategoryEnabled)(policyId, categoriesToDisable_1, policyTagLists, allTransactionViolations);
                    },
                });
            }
            var disabledCategories = selectedCategories.filter(function (categoryName) { var _a; return !((_a = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[categoryName]) === null || _a === void 0 ? void 0 : _a.enabled); });
            if (disabledCategories.length > 0) {
                var categoriesToEnable_1 = selectedCategories
                    .filter(function (categoryName) { var _a; return !((_a = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[categoryName]) === null || _a === void 0 ? void 0 : _a.enabled); })
                    .reduce(function (acc, categoryName) {
                    acc[categoryName] = {
                        name: categoryName,
                        enabled: true,
                    };
                    return acc;
                }, {});
                options.push({
                    icon: Expensicons.Checkmark,
                    text: translate(disabledCategories.length === 1 ? 'workspace.categories.enableCategory' : 'workspace.categories.enableCategories'),
                    value: CONST_1.default.POLICY.BULK_ACTION_TYPES.ENABLE,
                    onSelected: function () {
                        setSelectedCategories([]);
                        (0, Category_1.setWorkspaceCategoryEnabled)(policyId, categoriesToEnable_1, policyTagLists, allTransactionViolations);
                    },
                });
            }
            return (<ButtonWithDropdownMenu_1.default onPress={function () { return null; }} shouldAlwaysShowDropdownMenu buttonSize={CONST_1.default.DROPDOWN_BUTTON_SIZE.MEDIUM} customText={translate('workspace.common.selected', { count: selectedCategories.length })} options={options} isSplitButton={false} style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]} isDisabled={!selectedCategories.length} testID={"".concat(WorkspaceCategoriesPage.displayName, "-header-dropdown-menu-button")}/>);
        }
        var shouldShowAddCategory = !policyHasAccountingConnections && hasVisibleCategories;
        return (<react_native_1.View style={[styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
                {shouldShowAddCategory && (<Button_1.default success onPress={navigateToCreateCategoryPage} icon={Expensicons.Plus} text={translate('workspace.categories.addCategory')} style={[shouldUseNarrowLayout && styles.flex1]}/>)}
                <ButtonWithDropdownMenu_1.default success={false} onPress={function () { }} shouldAlwaysShowDropdownMenu customText={translate('common.more')} options={secondaryActions} isSplitButton={false} wrapperStyle={shouldShowAddCategory ? styles.flexGrow0 : styles.flexGrow1}/>
            </react_native_1.View>);
    };
    var isLoading = !isOffline && policyCategories === undefined;
    (0, react_1.useEffect)(function () {
        if (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) {
            return;
        }
        setSelectedCategories([]);
    }, [setSelectedCategories, selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled]);
    var selectionModeHeader = (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) && shouldUseNarrowLayout;
    var headerContent = (<>
            <react_native_1.View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                {!hasSyncError && isConnectionVerified ? (<Text_1.default>
                        <Text_1.default style={[styles.textNormal, styles.colorMuted]}>{"".concat(translate('workspace.categories.importedFromAccountingSoftware'), " ")}</Text_1.default>
                        <TextLink_1.default style={[styles.textNormal, styles.link]} href={"".concat(environmentURL, "/").concat(ROUTES_1.default.POLICY_ACCOUNTING.getRoute(policyId))}>
                            {"".concat(currentConnectionName, " ").concat(translate('workspace.accounting.settings'))}
                        </TextLink_1.default>
                        <Text_1.default style={[styles.textNormal, styles.colorMuted]}>.</Text_1.default>
                    </Text_1.default>) : (<Text_1.default style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.categories.subtitle')}</Text_1.default>)}
            </react_native_1.View>
            {categoryList.length > CONST_1.default.SEARCH_ITEM_LIMIT && (<SearchBar_1.default label={translate('workspace.categories.findCategory')} inputValue={inputValue} onChangeText={setInputValue} shouldShowEmptyState={hasVisibleCategories && !isLoading && filteredCategoryList.length === 0}/>)}
        </>);
    var subtitleText = (0, react_1.useMemo)(function () { return (<Text_1.default style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal]}>
                {!policyHasAccountingConnections ? translate('workspace.categories.emptyCategories.subtitle') : translate("workspace.categories.emptyCategoriesWithAccounting.subtitle1")}
                {policyHasAccountingConnections && (<>
                        <TextLink_1.default style={[styles.textAlignCenter]} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING.getRoute(policyId)); }}>
                            {translate("workspace.categories.emptyCategoriesWithAccounting.subtitle2")}
                        </TextLink_1.default>
                        {translate("workspace.categories.emptyCategoriesWithAccounting.subtitle3")}{' '}
                    </>)}
            </Text_1.default>); }, [styles.textAlignCenter, styles.textSupporting, styles.textNormal, policyHasAccountingConnections, translate, policyId]);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyId} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={WorkspaceCategoriesPage.displayName} shouldShowOfflineIndicatorInWideScreen offlineIndicatorStyle={styles.mtAuto}>
                <HeaderWithBackButton_1.default shouldShowBackButton={shouldUseNarrowLayout} title={selectionModeHeader ? translate('common.selectMultiple') : translate('workspace.common.categories')} icon={!selectionModeHeader ? Illustrations.FolderOpen : undefined} shouldUseHeadlineHeader={!selectionModeHeader} onBackButtonPress={function () {
            if (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) {
                setSelectedCategories([]);
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
                <ConfirmModal_1.default isVisible={deleteCategoriesConfirmModalVisible} onConfirm={handleDeleteCategories} onCancel={function () { return setDeleteCategoriesConfirmModalVisible(false); }} title={translate(selectedCategories.length === 1 ? 'workspace.categories.deleteCategory' : 'workspace.categories.deleteCategories')} prompt={translate(selectedCategories.length === 1 ? 'workspace.categories.deleteCategoryPrompt' : 'workspace.categories.deleteCategoriesPrompt')} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger/>
                {shouldUseNarrowLayout && <react_native_1.View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</react_native_1.View>}
                {(!hasVisibleCategories || isLoading) && headerContent}
                {isLoading && (<react_native_1.ActivityIndicator size={CONST_1.default.ACTIVITY_INDICATOR_SIZE.LARGE} style={[styles.flex1]} color={theme.spinner}/>)}
                {hasVisibleCategories && !isLoading && (<SelectionListWithModal_1.default canSelectMultiple={canSelectMultiple} turnOnSelectionModeOnLongPress={isSmallScreenWidth} onTurnOnSelectionMode={function (item) { return item && toggleCategory(item); }} sections={[{ data: filteredCategoryList, isDisabled: false }]} shouldUseDefaultRightHandSideCheckmark={false} selectedItems={selectedCategories} onCheckboxPress={toggleCategory} onSelectRow={navigateToCategorySettings} shouldPreventDefaultFocusOnSelectRow={!(0, DeviceCapabilities_1.canUseTouchScreen)()} onSelectAll={filteredCategoryList.length > 0 ? toggleAllCategories : undefined} ListItem={TableListItem_1.default} listHeaderContent={headerContent} shouldShowListEmptyContent={false} onDismissError={dismissError} customListHeader={getCustomListHeader()} listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]} showScrollIndicator={false} addBottomSafeAreaPadding/>)}
                {!hasVisibleCategories && !isLoading && inputValue.length === 0 && (<ScrollView_1.default contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
                        <EmptyStateComponent_1.default SkeletonComponent={TableRowSkeleton_1.default} headerMediaType={CONST_1.default.EMPTY_STATE_MEDIA.ANIMATION} headerMedia={LottieAnimations_1.default.GenericEmptyState} title={translate('workspace.categories.emptyCategories.title')} subtitleText={subtitleText} headerStyles={[styles.emptyStateCardIllustrationContainer, styles.emptyFolderBG]} lottieWebViewStyles={styles.emptyStateFolderWebStyles} headerContentStyles={styles.emptyStateFolderWebStyles} buttons={!policyHasAccountingConnections
                ? [
                    {
                        icon: Expensicons.Plus,
                        buttonText: translate('workspace.categories.addCategory'),
                        buttonAction: navigateToCreateCategoryPage,
                        success: true,
                    },
                    {
                        icon: Expensicons.Table,
                        buttonText: translate('common.import'),
                        buttonAction: navigateToImportSpreadsheet,
                    },
                ]
                : undefined}/>
                    </ScrollView_1.default>)}
                <ConfirmModal_1.default isVisible={isCannotDeleteOrDisableLastCategoryModalVisible} onConfirm={function () { return setIsCannotDeleteOrDisableLastCategoryModalVisible(false); }} onCancel={function () { return setIsCannotDeleteOrDisableLastCategoryModalVisible(false); }} title={translate('workspace.categories.cannotDeleteOrDisableAllCategories.title')} prompt={translate('workspace.categories.cannotDeleteOrDisableAllCategories.description')} confirmText={translate('common.buttonConfirm')} shouldShowCancelButton={false}/>
                <ConfirmModal_1.default isVisible={isOfflineModalVisible} onConfirm={function () { return setIsOfflineModalVisible(false); }} title={translate('common.youAppearToBeOffline')} prompt={translate('common.thisFeatureRequiresInternet')} confirmText={translate('common.buttonConfirm')} shouldShowCancelButton={false} onCancel={function () { return setIsOfflineModalVisible(false); }} shouldHandleNavigationBack/>
                <DecisionModal_1.default title={translate('common.downloadFailedTitle')} prompt={translate('common.downloadFailedDescription')} isSmallScreenWidth={isSmallScreenWidth} onSecondOptionSubmit={function () { return setIsDownloadFailureModalVisible(false); }} secondOptionText={translate('common.buttonConfirm')} isVisible={isDownloadFailureModalVisible} onClose={function () { return setIsDownloadFailureModalVisible(false); }}/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceCategoriesPage.displayName = 'WorkspaceCategoriesPage';
exports.default = WorkspaceCategoriesPage;
