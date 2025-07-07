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
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SearchBar_1 = require("@components/SearchBar");
var TableListItem_1 = require("@components/SelectionList/TableListItem");
var SelectionListWithModal_1 = require("@components/SelectionListWithModal");
var CustomListHeader_1 = require("@components/SelectionListWithModal/CustomListHeader");
var Switch_1 = require("@components/Switch");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useCleanupSelectedOptions_1 = require("@hooks/useCleanupSelectedOptions");
var useEnvironment_1 = require("@hooks/useEnvironment");
var useLocalize_1 = require("@hooks/useLocalize");
var useMobileSelectionMode_1 = require("@hooks/useMobileSelectionMode");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSearchBackPress_1 = require("@hooks/useSearchBackPress");
var useSearchResults_1 = require("@hooks/useSearchResults");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var connections_1 = require("@libs/actions/connections");
var MobileSelectionMode_1 = require("@libs/actions/MobileSelectionMode");
var TaxRate_1 = require("@libs/actions/TaxRate");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var LocaleCompare_1 = require("@libs/LocaleCompare");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var StringUtils_1 = require("@libs/StringUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function WorkspaceTaxesPage(_a) {
    var _b, _c, _d, _e, _f;
    var policy = _a.policy, policyID = _a.route.params.policyID;
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _g = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _g.shouldUseNarrowLayout, isSmallScreenWidth = _g.isSmallScreenWidth;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var environmentURL = (0, useEnvironment_1.default)().environmentURL;
    var _h = (0, react_1.useState)([]), selectedTaxesIDs = _h[0], setSelectedTaxesIDs = _h[1];
    var _j = (0, react_1.useState)(false), isDeleteModalVisible = _j[0], setIsDeleteModalVisible = _j[1];
    var selectionMode = (0, useMobileSelectionMode_1.default)().selectionMode;
    var defaultExternalID = (_b = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _b === void 0 ? void 0 : _b.defaultExternalID;
    var foreignTaxDefault = (_c = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _c === void 0 ? void 0 : _c.foreignTaxDefault;
    var hasAccountingConnections = (0, PolicyUtils_1.hasAccountingConnections)(policy);
    var connectionSyncProgress = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS).concat(policy === null || policy === void 0 ? void 0 : policy.id), { canBeMissing: true })[0];
    var isSyncInProgress = (0, connections_1.isConnectionInProgress)(connectionSyncProgress, policy);
    var hasSyncError = (0, PolicyUtils_1.shouldShowSyncError)(policy, isSyncInProgress);
    var connectedIntegration = (_d = (0, PolicyUtils_1.getConnectedIntegration)(policy)) !== null && _d !== void 0 ? _d : connectionSyncProgress === null || connectionSyncProgress === void 0 ? void 0 : connectionSyncProgress.connectionName;
    var isConnectionVerified = connectedIntegration && !(0, connections_1.isConnectionUnverified)(policy, connectedIntegration);
    var currentConnectionName = (0, PolicyUtils_1.getCurrentConnectionName)(policy);
    var canSelectMultiple = shouldUseNarrowLayout ? selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled : true;
    var enabledRatesCount = selectedTaxesIDs.filter(function (taxID) { var _a, _b; return !((_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes[taxID]) === null || _b === void 0 ? void 0 : _b.isDisabled); }).length;
    var disabledRatesCount = selectedTaxesIDs.length - enabledRatesCount;
    var fetchTaxes = (0, react_1.useCallback)(function () {
        (0, Policy_1.openPolicyTaxesPage)(policyID);
    }, [policyID]);
    var isOffline = (0, useNetwork_1.default)({ onReconnect: fetchTaxes }).isOffline;
    (0, react_1.useEffect)(function () {
        fetchTaxes();
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    var cleanupSelectedOption = (0, react_1.useCallback)(function () { return setSelectedTaxesIDs([]); }, []);
    (0, useCleanupSelectedOptions_1.default)(cleanupSelectedOption);
    (0, react_1.useEffect)(function () {
        if (selectedTaxesIDs.length === 0 || !canSelectMultiple) {
            return;
        }
        setSelectedTaxesIDs(function (prevSelectedTaxesIDs) {
            var _a, _b, _c, _d;
            var newSelectedTaxesIDs = [];
            for (var _i = 0, prevSelectedTaxesIDs_1 = prevSelectedTaxesIDs; _i < prevSelectedTaxesIDs_1.length; _i++) {
                var taxID = prevSelectedTaxesIDs_1[_i];
                if (((_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes) === null || _b === void 0 ? void 0 : _b[taxID]) &&
                    ((_d = (_c = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _c === void 0 ? void 0 : _c.taxes) === null || _d === void 0 ? void 0 : _d[taxID].pendingAction) !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
                    (0, PolicyUtils_1.canEditTaxRate)(policy, taxID)) {
                    newSelectedTaxesIDs.push(taxID);
                }
            }
            return newSelectedTaxesIDs;
        });
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [(_e = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _e === void 0 ? void 0 : _e.taxes]);
    (0, useSearchBackPress_1.default)({
        onClearSelection: function () {
            setSelectedTaxesIDs([]);
        },
        onNavigationCallBack: function () { return Navigation_1.default.goBack(); },
    });
    var textForDefault = (0, react_1.useCallback)(function (taxID, taxRate) {
        var suffix;
        if (taxID === defaultExternalID && taxID === foreignTaxDefault) {
            suffix = translate('common.default');
        }
        else if (taxID === defaultExternalID) {
            suffix = translate('workspace.taxes.workspaceDefault');
        }
        else if (taxID === foreignTaxDefault) {
            suffix = translate('workspace.taxes.foreignDefault');
        }
        if (suffix) {
            return "".concat(taxRate.value, " ").concat(CONST_1.default.DOT_SEPARATOR, " ").concat(suffix);
        }
        return "".concat(taxRate.value);
    }, [defaultExternalID, foreignTaxDefault, translate]);
    var updateWorkspaceTaxEnabled = (0, react_1.useCallback)(function (value, taxID) {
        (0, TaxRate_1.setPolicyTaxesEnabled)(policy, [taxID], value);
    }, [policy]);
    var taxesList = (0, react_1.useMemo)(function () {
        var _a, _b;
        if (!policy) {
            return [];
        }
        return Object.entries((_b = (_a = policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes) !== null && _b !== void 0 ? _b : {}).map(function (_a) {
            var _b, _c, _d;
            var key = _a[0], value = _a[1];
            var canEditTaxRate = policy && (0, PolicyUtils_1.canEditTaxRate)(policy, key);
            return {
                text: value.name,
                alternateText: textForDefault(key, value),
                keyForList: key,
                isDisabledCheckbox: !(0, PolicyUtils_1.canEditTaxRate)(policy, key),
                isDisabled: value.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                pendingAction: (_b = value.pendingAction) !== null && _b !== void 0 ? _b : (Object.keys((_c = value.pendingFields) !== null && _c !== void 0 ? _c : {}).length > 0 ? CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : null),
                errors: (_d = value.errors) !== null && _d !== void 0 ? _d : (0, ErrorUtils_1.getLatestErrorFieldForAnyField)(value),
                rightElement: (<Switch_1.default isOn={!value.isDisabled} disabled={!canEditTaxRate || value.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE} accessibilityLabel={translate('workspace.taxes.actions.enable')} onToggle={function (newValue) { return updateWorkspaceTaxEnabled(newValue, key); }}/>),
            };
        });
    }, [policy, textForDefault, translate, updateWorkspaceTaxEnabled]);
    var filterTax = (0, react_1.useCallback)(function (tax, searchInput) {
        var _a, _b, _c, _d, _e;
        var taxName = StringUtils_1.default.normalize((_b = (_a = tax.text) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : '');
        var taxAlternateText = StringUtils_1.default.normalize((_d = (_c = tax.alternateText) === null || _c === void 0 ? void 0 : _c.toLowerCase()) !== null && _d !== void 0 ? _d : '');
        var normalizedSearchInput = StringUtils_1.default.normalize((_e = searchInput.toLowerCase()) !== null && _e !== void 0 ? _e : '');
        return taxName.includes(normalizedSearchInput) || taxAlternateText.includes(normalizedSearchInput);
    }, []);
    var sortTaxes = (0, react_1.useCallback)(function (taxes) {
        return taxes.sort(function (a, b) {
            var _a, _b, _c, _d;
            var aText = (_b = (_a = a.text) !== null && _a !== void 0 ? _a : a.keyForList) !== null && _b !== void 0 ? _b : '';
            var bText = (_d = (_c = b.text) !== null && _c !== void 0 ? _c : b.keyForList) !== null && _d !== void 0 ? _d : '';
            return (0, LocaleCompare_1.default)(aText, bText);
        });
    }, []);
    var _k = (0, useSearchResults_1.default)(taxesList, filterTax, sortTaxes), inputValue = _k[0], setInputValue = _k[1], filteredTaxesList = _k[2];
    var isLoading = !isOffline && taxesList === undefined;
    var toggleTax = function (tax) {
        var key = tax.keyForList;
        if (typeof key !== 'string' || key === defaultExternalID || key === foreignTaxDefault) {
            return;
        }
        setSelectedTaxesIDs(function (prev) {
            if (prev === null || prev === void 0 ? void 0 : prev.includes(key)) {
                return prev.filter(function (item) { return item !== key; });
            }
            return __spreadArray(__spreadArray([], prev, true), [key], false);
        });
    };
    var toggleAllTaxes = function () {
        var taxesToSelect = filteredTaxesList.filter(function (tax) { return tax.keyForList !== defaultExternalID && tax.keyForList !== foreignTaxDefault && tax.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE; });
        setSelectedTaxesIDs(function (prev) {
            if (prev.length > 0) {
                return [];
            }
            return taxesToSelect.map(function (item) { return (item.keyForList ? item.keyForList : ''); });
        });
    };
    var getCustomListHeader = function () {
        if (filteredTaxesList.length === 0) {
            return null;
        }
        return (<CustomListHeader_1.default canSelectMultiple={canSelectMultiple} leftHeaderText={translate('common.name')} rightHeaderText={translate('common.enabled')}/>);
    };
    var deleteTaxes = (0, react_1.useCallback)(function () {
        if (!(policy === null || policy === void 0 ? void 0 : policy.id)) {
            return;
        }
        (0, TaxRate_1.deletePolicyTaxes)(policy, selectedTaxesIDs);
        setIsDeleteModalVisible(false);
        react_native_1.InteractionManager.runAfterInteractions(function () {
            setSelectedTaxesIDs([]);
        });
    }, [policy, selectedTaxesIDs]);
    var toggleTaxes = (0, react_1.useCallback)(function (isEnabled) {
        if (!(policy === null || policy === void 0 ? void 0 : policy.id)) {
            return;
        }
        (0, TaxRate_1.setPolicyTaxesEnabled)(policy, selectedTaxesIDs, isEnabled);
        setSelectedTaxesIDs([]);
    }, [policy, selectedTaxesIDs]);
    var navigateToEditTaxRate = function (taxRate) {
        if (!taxRate.keyForList) {
            return;
        }
        if (isSmallScreenWidth && (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled)) {
            toggleTax(taxRate);
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_TAX_EDIT.getRoute(policyID, taxRate.keyForList));
    };
    var dropdownMenuOptions = (0, react_1.useMemo)(function () {
        var isMultiple = selectedTaxesIDs.length > 1;
        var options = [];
        if (!hasAccountingConnections) {
            options.push({
                icon: Expensicons.Trashcan,
                text: isMultiple ? translate('workspace.taxes.actions.deleteMultiple') : translate('workspace.taxes.actions.delete'),
                value: CONST_1.default.POLICY.BULK_ACTION_TYPES.DELETE,
                onSelected: function () { return setIsDeleteModalVisible(true); },
            });
        }
        // `Disable rates` when at least one enabled rate is selected.
        if (selectedTaxesIDs.some(function (taxID) { var _a, _b; return !((_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes[taxID]) === null || _b === void 0 ? void 0 : _b.isDisabled); })) {
            options.push({
                icon: Expensicons.Close,
                text: translate('workspace.taxes.actions.disableTaxRates', { count: enabledRatesCount }),
                value: CONST_1.default.POLICY.BULK_ACTION_TYPES.DISABLE,
                onSelected: function () { return toggleTaxes(false); },
            });
        }
        // `Enable rates` when at least one disabled rate is selected.
        if (selectedTaxesIDs.some(function (taxID) { var _a, _b; return (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes[taxID]) === null || _b === void 0 ? void 0 : _b.isDisabled; })) {
            options.push({
                icon: Expensicons.Checkmark,
                text: translate('workspace.taxes.actions.enableTaxRates', { count: disabledRatesCount }),
                value: CONST_1.default.POLICY.BULK_ACTION_TYPES.ENABLE,
                onSelected: function () { return toggleTaxes(true); },
            });
        }
        return options;
    }, [hasAccountingConnections, (_f = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _f === void 0 ? void 0 : _f.taxes, selectedTaxesIDs, toggleTaxes, translate, enabledRatesCount, disabledRatesCount]);
    var shouldShowBulkActionsButton = shouldUseNarrowLayout ? selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled : selectedTaxesIDs.length > 0;
    var secondaryActions = (0, react_1.useMemo)(function () { return [
        {
            icon: Expensicons.Gear,
            text: translate('common.settings'),
            onSelected: function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_TAXES_SETTINGS.getRoute(policyID)); },
            value: CONST_1.default.POLICY.SECONDARY_ACTIONS.SETTINGS,
        },
    ]; }, [policyID, translate]);
    var headerButtons = !shouldShowBulkActionsButton ? (<react_native_1.View style={[styles.w100, styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
            {!hasAccountingConnections && (<Button_1.default success onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_TAX_CREATE.getRoute(policyID)); }} icon={Expensicons.Plus} text={translate('workspace.taxes.addRate')} style={[shouldUseNarrowLayout && styles.flex1]}/>)}
            <ButtonWithDropdownMenu_1.default success={false} onPress={function () { }} shouldAlwaysShowDropdownMenu customText={translate('common.more')} options={secondaryActions} isSplitButton={false} wrapperStyle={hasAccountingConnections ? styles.flexGrow1 : styles.flexGrow0}/>
        </react_native_1.View>) : (<ButtonWithDropdownMenu_1.default onPress={function () { }} options={dropdownMenuOptions} buttonSize={CONST_1.default.DROPDOWN_BUTTON_SIZE.MEDIUM} customText={translate('workspace.common.selected', { count: selectedTaxesIDs.length })} shouldAlwaysShowDropdownMenu isSplitButton={false} style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]} isDisabled={!selectedTaxesIDs.length}/>);
    var selectionModeHeader = (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) && shouldUseNarrowLayout;
    var headerContent = (<>
            <react_native_1.View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                {!hasSyncError && isConnectionVerified ? (<Text_1.default>
                        <Text_1.default style={[styles.textNormal, styles.colorMuted]}>{"".concat(translate('workspace.taxes.importedFromAccountingSoftware'), " ")}</Text_1.default>
                        <TextLink_1.default style={[styles.textNormal, styles.link]} href={"".concat(environmentURL, "/").concat(ROUTES_1.default.POLICY_ACCOUNTING.getRoute(policyID))}>
                            {"".concat(currentConnectionName, " ").concat(translate('workspace.accounting.settings'))}
                        </TextLink_1.default>
                        <Text_1.default style={[styles.textNormal, styles.colorMuted]}>.</Text_1.default>
                    </Text_1.default>) : (<Text_1.default style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.taxes.subtitle')}</Text_1.default>)}
            </react_native_1.View>
            {taxesList.length > CONST_1.default.SEARCH_ITEM_LIMIT && (<SearchBar_1.default label={translate('workspace.taxes.findTaxRate')} inputValue={inputValue} onChangeText={setInputValue} shouldShowEmptyState={filteredTaxesList.length === 0}/>)}
        </>);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={WorkspaceTaxesPage.displayName} shouldShowOfflineIndicatorInWideScreen>
                <HeaderWithBackButton_1.default icon={!selectionModeHeader ? Illustrations.Coins : undefined} shouldUseHeadlineHeader={!selectionModeHeader} title={translate(selectionModeHeader ? 'common.selectMultiple' : 'workspace.common.taxes')} shouldShowBackButton={shouldUseNarrowLayout} onBackButtonPress={function () {
            if (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) {
                setSelectedTaxesIDs([]);
                (0, MobileSelectionMode_1.turnOffMobileSelectionMode)();
                return;
            }
            Navigation_1.default.popToSidebar();
        }}>
                    {!shouldUseNarrowLayout && headerButtons}
                </HeaderWithBackButton_1.default>
                {shouldUseNarrowLayout && <react_native_1.View style={[styles.pl5, styles.pr5]}>{headerButtons}</react_native_1.View>}
                {isLoading && (<react_native_1.ActivityIndicator size={CONST_1.default.ACTIVITY_INDICATOR_SIZE.LARGE} style={[styles.flex1]} color={theme.spinner}/>)}
                <SelectionListWithModal_1.default canSelectMultiple={canSelectMultiple} turnOnSelectionModeOnLongPress onTurnOnSelectionMode={function (item) { return item && toggleTax(item); }} sections={[{ data: filteredTaxesList, isDisabled: false }]} shouldUseDefaultRightHandSideCheckmark={false} selectedItems={selectedTaxesIDs} onCheckboxPress={toggleTax} onSelectRow={navigateToEditTaxRate} onSelectAll={filteredTaxesList.length > 0 ? toggleAllTaxes : undefined} ListItem={TableListItem_1.default} listHeaderContent={headerContent} shouldShowListEmptyContent={false} customListHeader={getCustomListHeader()} shouldPreventDefaultFocusOnSelectRow={!(0, DeviceCapabilities_1.canUseTouchScreen)()} listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]} onDismissError={function (item) { return (item.keyForList ? (0, TaxRate_1.clearTaxRateError)(policyID, item.keyForList, item.pendingAction) : undefined); }} showScrollIndicator={false} addBottomSafeAreaPadding/>
                <ConfirmModal_1.default title={translate('workspace.taxes.actions.delete')} isVisible={isDeleteModalVisible} onConfirm={deleteTaxes} onCancel={function () { return setIsDeleteModalVisible(false); }} prompt={selectedTaxesIDs.length > 1
            ? translate('workspace.taxes.deleteMultipleTaxConfirmation', { taxAmount: selectedTaxesIDs.length })
            : translate('workspace.taxes.deleteTaxConfirmation')} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceTaxesPage.displayName = 'WorkspaceTaxesPage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(WorkspaceTaxesPage);
