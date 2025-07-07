"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var useFilteredSelection_1 = require("@hooks/useFilteredSelection");
var useLocalize_1 = require("@hooks/useLocalize");
var useMobileSelectionMode_1 = require("@hooks/useMobileSelectionMode");
var useNetwork_1 = require("@hooks/useNetwork");
var usePolicy_1 = require("@hooks/usePolicy");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSearchBackPress_1 = require("@hooks/useSearchBackPress");
var useSearchResults_1 = require("@hooks/useSearchResults");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var MobileSelectionMode_1 = require("@libs/actions/MobileSelectionMode");
var DistanceRate_1 = require("@libs/actions/Policy/DistanceRate");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var StringUtils_1 = require("@libs/StringUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var ButtonWithDropdownMenu_1 = require("@src/components/ButtonWithDropdownMenu");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function PolicyDistanceRatesPage(_a) {
    var policyID = _a.route.params.policyID;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, react_1.useState)(false), isWarningModalVisible = _b[0], setIsWarningModalVisible = _b[1];
    var _c = (0, react_1.useState)(false), isDeleteModalVisible = _c[0], setIsDeleteModalVisible = _c[1];
    var policy = (0, usePolicy_1.default)(policyID);
    var selectionMode = (0, useMobileSelectionMode_1.default)().selectionMode;
    var canSelectMultiple = shouldUseNarrowLayout ? selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled : true;
    var customUnit = (0, PolicyUtils_1.getDistanceRateCustomUnit)(policy);
    var customUnitRates = (0, react_1.useMemo)(function () { var _a; return (_a = customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates) !== null && _a !== void 0 ? _a : {}; }, [customUnit]);
    var selectableRates = (0, react_1.useMemo)(function () {
        return Object.values(customUnitRates).reduce(function (acc, rate) {
            acc[rate.customUnitRateID] = rate;
            return acc;
        }, {});
    }, [customUnitRates]);
    var filterRateSelection = (0, react_1.useCallback)(function (rate) { var _a; return !!rate && !!(customUnitRates === null || customUnitRates === void 0 ? void 0 : customUnitRates[rate.customUnitRateID]) && ((_a = customUnitRates === null || customUnitRates === void 0 ? void 0 : customUnitRates[rate.customUnitRateID]) === null || _a === void 0 ? void 0 : _a.pendingAction) !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE; }, [customUnitRates]);
    var _d = (0, useFilteredSelection_1.default)(selectableRates, filterRateSelection), selectedDistanceRates = _d[0], setSelectedDistanceRates = _d[1];
    var canDisableOrDeleteSelectedRates = (0, react_1.useMemo)(function () {
        return Object.keys(selectableRates)
            .filter(function (rateID) { return !selectedDistanceRates.includes(rateID); })
            .some(function (rateID) { return selectableRates[rateID].enabled; });
    }, [selectableRates, selectedDistanceRates]);
    var fetchDistanceRates = (0, react_1.useCallback)(function () {
        (0, DistanceRate_1.openPolicyDistanceRatesPage)(policyID);
    }, [policyID]);
    var dismissError = (0, react_1.useCallback)(function (item) {
        if (!(customUnit === null || customUnit === void 0 ? void 0 : customUnit.customUnitID)) {
            return;
        }
        if (customUnitRates[item.value].errors) {
            (0, DistanceRate_1.clearDeleteDistanceRateError)(policyID, customUnit.customUnitID, item.value);
            return;
        }
        (0, DistanceRate_1.clearCreateDistanceRateItemAndError)(policyID, customUnit.customUnitID, item.value);
    }, [customUnit === null || customUnit === void 0 ? void 0 : customUnit.customUnitID, customUnitRates, policyID]);
    var isOffline = (0, useNetwork_1.default)({ onReconnect: fetchDistanceRates }).isOffline;
    (0, react_1.useEffect)(function () {
        fetchDistanceRates();
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    (0, useSearchBackPress_1.default)({
        onClearSelection: function () { return setSelectedDistanceRates([]); },
        onNavigationCallBack: function () { return Navigation_1.default.goBack(); },
    });
    var updateDistanceRateEnabled = (0, react_1.useCallback)(function (value, rateID) {
        var _a, _b;
        if (!customUnit) {
            return;
        }
        var rate = (_a = customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates) === null || _a === void 0 ? void 0 : _a[rateID];
        // Rates can be disabled or deleted as long as in the remaining rates there is always at least one enabled rate and there are no pending delete actions
        var canDisableOrDeleteRate = Object.values((_b = customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates) !== null && _b !== void 0 ? _b : {}).some(function (distanceRate) { return (distanceRate === null || distanceRate === void 0 ? void 0 : distanceRate.enabled) && rateID !== (distanceRate === null || distanceRate === void 0 ? void 0 : distanceRate.customUnitRateID) && (distanceRate === null || distanceRate === void 0 ? void 0 : distanceRate.pendingAction) !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE; });
        if (!(rate === null || rate === void 0 ? void 0 : rate.enabled) || canDisableOrDeleteRate) {
            (0, DistanceRate_1.setPolicyDistanceRatesEnabled)(policyID, customUnit, [__assign(__assign({}, rate), { enabled: value })]);
        }
        else {
            setIsWarningModalVisible(true);
        }
    }, [customUnit, policyID]);
    var distanceRatesList = (0, react_1.useMemo)(function () {
        return Object.values(customUnitRates).map(function (value) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
            return ({
                rate: value.rate,
                value: value.customUnitRateID,
                text: "".concat((0, CurrencyUtils_1.convertAmountToDisplayString)(value.rate, (_a = value.currency) !== null && _a !== void 0 ? _a : CONST_1.default.CURRENCY.USD), " / ").concat(translate("common.".concat((_c = (_b = customUnit === null || customUnit === void 0 ? void 0 : customUnit.attributes) === null || _b === void 0 ? void 0 : _b.unit) !== null && _c !== void 0 ? _c : CONST_1.default.CUSTOM_UNITS.DISTANCE_UNIT_MILES))),
                keyForList: value.customUnitRateID,
                isDisabled: value.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                pendingAction: (_p = (_m = (_k = (_h = (_f = (_d = value.pendingAction) !== null && _d !== void 0 ? _d : (_e = value.pendingFields) === null || _e === void 0 ? void 0 : _e.rate) !== null && _f !== void 0 ? _f : (_g = value.pendingFields) === null || _g === void 0 ? void 0 : _g.enabled) !== null && _h !== void 0 ? _h : (_j = value.pendingFields) === null || _j === void 0 ? void 0 : _j.currency) !== null && _k !== void 0 ? _k : (_l = value.pendingFields) === null || _l === void 0 ? void 0 : _l.taxRateExternalID) !== null && _m !== void 0 ? _m : (_o = value.pendingFields) === null || _o === void 0 ? void 0 : _o.taxClaimablePercentage) !== null && _p !== void 0 ? _p : ((policy === null || policy === void 0 ? void 0 : policy.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD ? policy === null || policy === void 0 ? void 0 : policy.pendingAction : undefined),
                errors: (_q = value.errors) !== null && _q !== void 0 ? _q : undefined,
                rightElement: (<Switch_1.default isOn={!!(value === null || value === void 0 ? void 0 : value.enabled)} accessibilityLabel={translate('workspace.distanceRates.trackTax')} onToggle={function (newValue) { return updateDistanceRateEnabled(newValue, value.customUnitRateID); }} disabled={value.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE}/>),
            });
        });
    }, [customUnitRates, translate, customUnit, policy === null || policy === void 0 ? void 0 : policy.pendingAction, updateDistanceRateEnabled]);
    var filterRate = (0, react_1.useCallback)(function (rate, searchInput) {
        var _a, _b;
        var rateText = StringUtils_1.default.normalize((_b = (_a = rate.text) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : '');
        var normalizedSearchInput = StringUtils_1.default.normalize(searchInput.toLowerCase());
        return rateText.includes(normalizedSearchInput);
    }, []);
    var sortRates = (0, react_1.useCallback)(function (rates) { return rates.sort(function (a, b) { var _a, _b; return ((_a = a.rate) !== null && _a !== void 0 ? _a : 0) - ((_b = b.rate) !== null && _b !== void 0 ? _b : 0); }); }, []);
    var _e = (0, useSearchResults_1.default)(distanceRatesList, filterRate, sortRates), inputValue = _e[0], setInputValue = _e[1], filteredDistanceRatesList = _e[2];
    var addRate = function () {
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_CREATE_DISTANCE_RATE.getRoute(policyID));
    };
    var openSettings = (0, react_1.useCallback)(function () {
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_DISTANCE_RATES_SETTINGS.getRoute(policyID));
    }, [policyID]);
    var openRateDetails = function (rate) {
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_DISTANCE_RATE_DETAILS.getRoute(policyID, rate.value));
    };
    var disableRates = function () {
        if (customUnit === undefined) {
            return;
        }
        (0, DistanceRate_1.setPolicyDistanceRatesEnabled)(policyID, customUnit, selectedDistanceRates
            .map(function (rateID) { return selectableRates[rateID]; })
            .filter(function (rate) { return rate.enabled; })
            .map(function (rate) { return (__assign(__assign({}, rate), { enabled: false })); }));
        setSelectedDistanceRates([]);
    };
    var enableRates = function () {
        if (customUnit === undefined) {
            return;
        }
        (0, DistanceRate_1.setPolicyDistanceRatesEnabled)(policyID, customUnit, selectedDistanceRates
            .map(function (rateID) { return selectableRates[rateID]; })
            .filter(function (rate) { return !rate.enabled; })
            .map(function (rate) { return (__assign(__assign({}, rate), { enabled: true })); }));
        setSelectedDistanceRates([]);
    };
    var deleteRates = function () {
        if (customUnit === undefined) {
            return;
        }
        (0, DistanceRate_1.deletePolicyDistanceRates)(policyID, customUnit, selectedDistanceRates);
        setIsDeleteModalVisible(false);
        react_native_1.InteractionManager.runAfterInteractions(function () {
            setSelectedDistanceRates([]);
        });
    };
    var toggleRate = function (rate) {
        setSelectedDistanceRates(function (prevSelectedRates) {
            if (prevSelectedRates.includes(rate.value)) {
                return prevSelectedRates.filter(function (selectedRate) { return selectedRate !== rate.value; });
            }
            return __spreadArray(__spreadArray([], prevSelectedRates, true), [rate.value], false);
        });
    };
    var toggleAllRates = function () {
        if (selectedDistanceRates.length > 0) {
            setSelectedDistanceRates([]);
        }
        else {
            setSelectedDistanceRates(Object.entries(selectableRates)
                .filter(function (_a) {
                var rate = _a[1];
                return rate.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE && filteredDistanceRatesList.some(function (item) { return item.value === rate.customUnitRateID; });
            })
                .map(function (_a) {
                var key = _a[0];
                return key;
            }));
        }
    };
    var getCustomListHeader = function () {
        if (filteredDistanceRatesList.length === 0) {
            return null;
        }
        return (<CustomListHeader_1.default canSelectMultiple={canSelectMultiple} leftHeaderText={translate('workspace.distanceRates.rate')} rightHeaderText={translate('common.enabled')}/>);
    };
    var getBulkActionsButtonOptions = function () {
        var options = [
            {
                text: translate('workspace.distanceRates.deleteRates', { count: selectedDistanceRates.length }),
                value: CONST_1.default.POLICY.BULK_ACTION_TYPES.DELETE,
                icon: Expensicons.Trashcan,
                onSelected: function () { return (canDisableOrDeleteSelectedRates ? setIsDeleteModalVisible(true) : setIsWarningModalVisible(true)); },
            },
        ];
        var enabledRates = selectedDistanceRates.filter(function (rateID) { return selectableRates[rateID].enabled; });
        if (enabledRates.length > 0) {
            options.push({
                text: translate('workspace.distanceRates.disableRates', { count: enabledRates.length }),
                value: CONST_1.default.POLICY.BULK_ACTION_TYPES.DISABLE,
                icon: Expensicons.Close,
                onSelected: function () { return (canDisableOrDeleteSelectedRates ? disableRates() : setIsWarningModalVisible(true)); },
            });
        }
        var disabledRates = selectedDistanceRates.filter(function (rateID) { return !selectableRates[rateID].enabled; });
        if (disabledRates.length > 0) {
            options.push({
                text: translate('workspace.distanceRates.enableRates', { count: disabledRates.length }),
                value: CONST_1.default.POLICY.BULK_ACTION_TYPES.ENABLE,
                icon: Expensicons.Checkmark,
                onSelected: enableRates,
            });
        }
        return options;
    };
    var isLoading = !isOffline && customUnit === undefined;
    var secondaryActions = (0, react_1.useMemo)(function () { return [
        {
            icon: Expensicons.Gear,
            text: translate('common.settings'),
            onSelected: openSettings,
            value: CONST_1.default.POLICY.SECONDARY_ACTIONS.SETTINGS,
        },
    ]; }, [openSettings, translate]);
    var headerButtons = (<react_native_1.View style={[styles.w100, styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
            {(shouldUseNarrowLayout ? !(selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) : selectedDistanceRates.length === 0) ? (<>
                    <Button_1.default text={translate('workspace.distanceRates.addRate')} onPress={addRate} style={[shouldUseNarrowLayout && styles.flex1]} icon={Expensicons.Plus} success/>
                    <ButtonWithDropdownMenu_1.default success={false} onPress={function () { }} shouldAlwaysShowDropdownMenu customText={translate('common.more')} options={secondaryActions} isSplitButton={false} wrapperStyle={styles.flexGrow0}/>
                </>) : (<ButtonWithDropdownMenu_1.default shouldAlwaysShowDropdownMenu pressOnEnter customText={translate('workspace.common.selected', { count: selectedDistanceRates.length })} buttonSize={CONST_1.default.DROPDOWN_BUTTON_SIZE.MEDIUM} onPress={function () { return null; }} options={getBulkActionsButtonOptions()} style={[shouldUseNarrowLayout && styles.flexGrow1]} wrapperStyle={styles.w100} isSplitButton={false} isDisabled={!selectedDistanceRates.length}/>)}
        </react_native_1.View>);
    var selectionModeHeader = (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) && shouldUseNarrowLayout;
    var headerContent = (<>
            {Object.values(customUnitRates).length > 0 && (<react_native_1.View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Text_1.default style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.distanceRates.centrallyManage')}</Text_1.default>
                </react_native_1.View>)}
            {Object.values(customUnitRates).length > CONST_1.default.SEARCH_ITEM_LIMIT && (<SearchBar_1.default label={translate('workspace.distanceRates.findRate')} inputValue={inputValue} onChangeText={setInputValue} shouldShowEmptyState={filteredDistanceRatesList.length === 0}/>)}
        </>);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={PolicyDistanceRatesPage.displayName} shouldShowOfflineIndicatorInWideScreen>
                <HeaderWithBackButton_1.default icon={!selectionModeHeader ? Illustrations.CarIce : undefined} shouldUseHeadlineHeader={!selectionModeHeader} title={translate(!selectionModeHeader ? 'workspace.common.distanceRates' : 'common.selectMultiple')} shouldShowBackButton={shouldUseNarrowLayout} onBackButtonPress={function () {
            if (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) {
                setSelectedDistanceRates([]);
                (0, MobileSelectionMode_1.turnOffMobileSelectionMode)();
                return;
            }
            Navigation_1.default.popToSidebar();
        }}>
                    {!shouldUseNarrowLayout && headerButtons}
                </HeaderWithBackButton_1.default>
                {shouldUseNarrowLayout && <react_native_1.View style={[styles.ph5]}>{headerButtons}</react_native_1.View>}
                {isLoading && (<react_native_1.ActivityIndicator size={CONST_1.default.ACTIVITY_INDICATOR_SIZE.LARGE} style={[styles.flex1]} color={theme.spinner}/>)}
                {Object.values(customUnitRates).length > 0 && (<SelectionListWithModal_1.default addBottomSafeAreaPadding canSelectMultiple={canSelectMultiple} turnOnSelectionModeOnLongPress onTurnOnSelectionMode={function (item) { return item && toggleRate(item); }} sections={[{ data: filteredDistanceRatesList, isDisabled: false }]} shouldUseDefaultRightHandSideCheckmark={false} selectedItems={selectedDistanceRates} onCheckboxPress={toggleRate} onSelectRow={openRateDetails} onSelectAll={filteredDistanceRatesList.length > 0 ? toggleAllRates : undefined} onDismissError={dismissError} ListItem={TableListItem_1.default} listHeaderContent={headerContent} shouldPreventDefaultFocusOnSelectRow={!(0, DeviceCapabilities_1.canUseTouchScreen)()} customListHeader={getCustomListHeader()} shouldShowListEmptyContent={false} listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]} showScrollIndicator={false}/>)}
                <ConfirmModal_1.default onConfirm={function () { return setIsWarningModalVisible(false); }} onCancel={function () { return setIsWarningModalVisible(false); }} isVisible={isWarningModalVisible} title={translate('workspace.distanceRates.oopsNotSoFast')} prompt={translate('workspace.distanceRates.workspaceNeeds')} confirmText={translate('common.buttonConfirm')} shouldShowCancelButton={false}/>
                <ConfirmModal_1.default title={translate('workspace.distanceRates.deleteDistanceRate')} isVisible={isDeleteModalVisible} onConfirm={deleteRates} onCancel={function () { return setIsDeleteModalVisible(false); }} prompt={translate('workspace.distanceRates.areYouSureDelete', { count: selectedDistanceRates.length })} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
PolicyDistanceRatesPage.displayName = 'PolicyDistanceRatesPage';
exports.default = PolicyDistanceRatesPage;
