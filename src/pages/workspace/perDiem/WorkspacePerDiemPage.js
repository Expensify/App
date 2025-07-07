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
var TableRowSkeleton_1 = require("@components/Skeletons/TableRowSkeleton");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useCleanupSelectedOptions_1 = require("@hooks/useCleanupSelectedOptions");
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
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var LocaleCompare_1 = require("@libs/LocaleCompare");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var StringUtils_1 = require("@libs/StringUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var Link_1 = require("@userActions/Link");
var MobileSelectionMode_1 = require("@userActions/MobileSelectionMode");
var Modal_1 = require("@userActions/Modal");
var PerDiem_1 = require("@userActions/Policy/PerDiem");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function getSubRatesData(customUnitRates) {
    var _a, _b;
    var subRatesData = [];
    for (var _i = 0, customUnitRates_1 = customUnitRates; _i < customUnitRates_1.length; _i++) {
        var rate = customUnitRates_1[_i];
        var subRates = rate.subRates;
        if (subRates) {
            for (var _c = 0, subRates_1 = subRates; _c < subRates_1.length; _c++) {
                var subRate = subRates_1[_c];
                subRatesData.push({
                    pendingAction: rate.pendingAction,
                    destination: (_a = rate.name) !== null && _a !== void 0 ? _a : '',
                    subRateName: subRate.name,
                    rate: subRate.rate,
                    currency: (_b = rate.currency) !== null && _b !== void 0 ? _b : CONST_1.default.CURRENCY.USD,
                    rateID: rate.customUnitRateID,
                    subRateID: subRate.id,
                });
            }
        }
    }
    return subRatesData;
}
function generateSingleSubRateData(customUnitRates, rateID, subRateID) {
    var _a, _b, _c;
    var selectedRate = customUnitRates.find(function (rate) { return rate.customUnitRateID === rateID; });
    if (!selectedRate) {
        return null;
    }
    var selectedSubRate = (_a = selectedRate.subRates) === null || _a === void 0 ? void 0 : _a.find(function (subRate) { return subRate.id === subRateID; });
    if (!selectedSubRate) {
        return null;
    }
    return {
        pendingAction: selectedRate.pendingAction,
        destination: (_b = selectedRate.name) !== null && _b !== void 0 ? _b : '',
        subRateName: selectedSubRate.name,
        rate: selectedSubRate.rate,
        currency: (_c = selectedRate.currency) !== null && _c !== void 0 ? _c : CONST_1.default.CURRENCY.USD,
        rateID: selectedRate.customUnitRateID,
        subRateID: selectedSubRate.id,
    };
}
function WorkspacePerDiemPage(_a) {
    var _b;
    var route = _a.route;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _c = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _c.shouldUseNarrowLayout, isSmallScreenWidth = _c.isSmallScreenWidth;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _d = (0, react_1.useState)(false), isOfflineModalVisible = _d[0], setIsOfflineModalVisible = _d[1];
    var _e = (0, react_1.useState)([]), selectedPerDiem = _e[0], setSelectedPerDiem = _e[1];
    var _f = (0, react_1.useState)(false), deletePerDiemConfirmModalVisible = _f[0], setDeletePerDiemConfirmModalVisible = _f[1];
    var _g = (0, react_1.useState)(false), isDownloadFailureModalVisible = _g[0], setIsDownloadFailureModalVisible = _g[1];
    var policyID = route.params.policyID;
    var backTo = (_b = route.params) === null || _b === void 0 ? void 0 : _b.backTo;
    var policy = (0, usePolicy_1.default)(policyID);
    var policyCategories = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(policyID), { canBeMissing: false })[0];
    var selectionMode = (0, useMobileSelectionMode_1.default)().selectionMode;
    var _h = (0, react_1.useMemo)(function () {
        var _a;
        var customUnits = (0, PolicyUtils_1.getPerDiemCustomUnit)(policy);
        var customUnitRates = (_a = customUnits === null || customUnits === void 0 ? void 0 : customUnits.rates) !== null && _a !== void 0 ? _a : {};
        var allRates = Object.values(customUnitRates);
        var allSubRatesMemo = getSubRatesData(allRates);
        return [customUnits, allRates, allSubRatesMemo];
    }, [policy]), customUnit = _h[0], allRatesArray = _h[1], allSubRates = _h[2];
    var canSelectMultiple = shouldUseNarrowLayout ? selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled : true;
    var fetchPerDiem = (0, react_1.useCallback)(function () {
        (0, PerDiem_1.openPolicyPerDiemPage)(policyID);
    }, [policyID]);
    var isOffline = (0, useNetwork_1.default)({ onReconnect: fetchPerDiem }).isOffline;
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        fetchPerDiem();
    }, [fetchPerDiem]));
    var cleanupSelectedOption = (0, react_1.useCallback)(function () { return setSelectedPerDiem([]); }, []);
    (0, useCleanupSelectedOptions_1.default)(cleanupSelectedOption);
    var subRatesList = (0, react_1.useMemo)(function () {
        return allSubRates.map(function (value) {
            var isDisabled = value.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
            return {
                text: value.destination,
                subRateID: value.subRateID,
                rateID: value.rateID,
                keyForList: value.subRateID,
                isDisabled: isDisabled,
                pendingAction: value.pendingAction,
                rightElement: (<>
                            <react_native_1.View style={styles.flex2}>
                                <Text_1.default numberOfLines={1} style={[styles.alignItemsStart, styles.textSupporting, styles.label, styles.pl2]}>
                                    {value.subRateName}
                                </Text_1.default>
                            </react_native_1.View>
                            <react_native_1.View style={styles.flex2}>
                                <Text_1.default numberOfLines={1} style={[styles.alignSelfEnd, styles.textSupporting, styles.pl2, styles.label]}>
                                    {(0, CurrencyUtils_1.convertAmountToDisplayString)(value.rate, value.currency)}
                                </Text_1.default>
                            </react_native_1.View>
                        </>),
            };
        });
    }, [allSubRates, styles.flex2, styles.alignItemsStart, styles.textSupporting, styles.label, styles.pl2, styles.alignSelfEnd]);
    var filterRate = (0, react_1.useCallback)(function (rate, searchInput) {
        var _a, _b;
        var rateText = StringUtils_1.default.normalize((_b = (_a = rate.text) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : '');
        var normalizedSearchInput = StringUtils_1.default.normalize(searchInput.toLowerCase());
        return rateText.includes(normalizedSearchInput);
    }, []);
    var sortRates = (0, react_1.useCallback)(function (rates) { return rates.sort(function (a, b) { var _a, _b; return (0, LocaleCompare_1.default)((_a = a.text) !== null && _a !== void 0 ? _a : '', (_b = b.text) !== null && _b !== void 0 ? _b : ''); }); }, []);
    var _j = (0, useSearchResults_1.default)(subRatesList, filterRate, sortRates), inputValue = _j[0], setInputValue = _j[1], filteredSubRatesList = _j[2];
    var toggleSubRate = function (subRate) {
        if (selectedPerDiem.find(function (selectedSubRate) { return selectedSubRate.subRateID === subRate.subRateID; }) !== undefined) {
            setSelectedPerDiem(function (prev) { return prev.filter(function (selectedSubRate) { return selectedSubRate.subRateID !== subRate.subRateID; }); });
        }
        else {
            var subRateData_1 = generateSingleSubRateData(allRatesArray, subRate.rateID, subRate.subRateID);
            if (!subRateData_1) {
                return;
            }
            setSelectedPerDiem(function (prev) { return __spreadArray(__spreadArray([], prev, true), [subRateData_1], false); });
        }
    };
    var toggleAllSubRates = function () {
        if (selectedPerDiem.length > 0) {
            setSelectedPerDiem([]);
        }
        else {
            var availablePerDiemRates = allSubRates.filter(function (subRate) {
                return subRate.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE && filteredSubRatesList.some(function (filteredSubRate) { return filteredSubRate.subRateID === subRate.subRateID; });
            });
            setSelectedPerDiem(availablePerDiemRates);
        }
    };
    var getCustomListHeader = function () {
        if (filteredSubRatesList.length === 0) {
            return null;
        }
        var header = (<react_native_1.View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween, canSelectMultiple && styles.pl3]}>
                <react_native_1.View style={styles.flex3}>
                    <Text_1.default style={[styles.textMicroSupporting, styles.alignSelfStart]}>{translate('common.destination')}</Text_1.default>
                </react_native_1.View>
                <react_native_1.View style={styles.flex2}>
                    <Text_1.default style={[styles.textMicroSupporting, styles.alignItemsStart, styles.pl2]}>{translate('common.subrate')}</Text_1.default>
                </react_native_1.View>
                <react_native_1.View style={styles.flex2}>
                    <Text_1.default style={[styles.textMicroSupporting, styles.alignSelfEnd]}>{translate('workspace.perDiem.amount')}</Text_1.default>
                </react_native_1.View>
            </react_native_1.View>);
        if (canSelectMultiple) {
            return header;
        }
        return <react_native_1.View style={!canSelectMultiple && [styles.ph9, styles.pv3, styles.pb5]}>{header}</react_native_1.View>;
    };
    var openSettings = (0, react_1.useCallback)(function () {
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_PER_DIEM_SETTINGS.getRoute(policyID));
    }, [policyID]);
    var openSubRateDetails = function (rate) {
        if (isSmallScreenWidth && (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled)) {
            toggleSubRate(rate);
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_PER_DIEM_DETAILS.getRoute(policyID, rate.rateID, rate.subRateID));
    };
    var handleDeletePerDiemRates = function () {
        (0, PerDiem_1.deleteWorkspacePerDiemRates)(policyID, customUnit, selectedPerDiem);
        setDeletePerDiemConfirmModalVisible(false);
        react_native_1.InteractionManager.runAfterInteractions(function () {
            setSelectedPerDiem([]);
        });
    };
    var hasVisibleSubRates = subRatesList.some(function (subRate) { return subRate.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline; });
    var secondaryActions = (0, react_1.useMemo)(function () {
        var menuItems = [];
        if ((policy === null || policy === void 0 ? void 0 : policy.areCategoriesEnabled) && (0, OptionsListUtils_1.hasEnabledOptions)(policyCategories !== null && policyCategories !== void 0 ? policyCategories : {})) {
            menuItems.push({
                icon: Expensicons.Gear,
                text: translate('common.settings'),
                onSelected: openSettings,
                value: CONST_1.default.POLICY.SECONDARY_ACTIONS.SETTINGS,
            });
        }
        menuItems.push({
            icon: Expensicons.Table,
            text: translate('spreadsheet.importSpreadsheet'),
            onSelected: function () {
                if (isOffline) {
                    (0, Modal_1.close)(function () { return setIsOfflineModalVisible(true); });
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_PER_DIEM_IMPORT.getRoute(policyID));
            },
            value: CONST_1.default.POLICY.SECONDARY_ACTIONS.IMPORT_SPREADSHEET,
        });
        if (hasVisibleSubRates) {
            menuItems.push({
                icon: Expensicons.Download,
                text: translate('spreadsheet.downloadCSV'),
                onSelected: function () {
                    if (isOffline) {
                        (0, Modal_1.close)(function () { return setIsOfflineModalVisible(true); });
                        return;
                    }
                    (0, PerDiem_1.downloadPerDiemCSV)(policyID, function () {
                        setIsDownloadFailureModalVisible(true);
                    });
                },
                value: CONST_1.default.POLICY.SECONDARY_ACTIONS.DOWNLOAD_CSV,
            });
        }
        return menuItems;
    }, [policy === null || policy === void 0 ? void 0 : policy.areCategoriesEnabled, policyCategories, translate, hasVisibleSubRates, openSettings, isOffline, policyID]);
    var getHeaderButtons = function () {
        var options = [];
        if (shouldUseNarrowLayout ? canSelectMultiple : selectedPerDiem.length > 0) {
            options.push({
                icon: Expensicons.Trashcan,
                text: translate('workspace.perDiem.deleteRates', { count: selectedPerDiem.length }),
                value: CONST_1.default.POLICY.BULK_ACTION_TYPES.DELETE,
                onSelected: function () { return setDeletePerDiemConfirmModalVisible(true); },
            });
            return (<ButtonWithDropdownMenu_1.default onPress={function () { return null; }} shouldAlwaysShowDropdownMenu buttonSize={CONST_1.default.DROPDOWN_BUTTON_SIZE.MEDIUM} customText={translate('workspace.common.selected', { count: selectedPerDiem.length })} options={options} isSplitButton={false} style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]} isDisabled={!selectedPerDiem.length}/>);
        }
        return (<react_native_1.View style={[styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
                <ButtonWithDropdownMenu_1.default success={false} onPress={function () { }} shouldAlwaysShowDropdownMenu customText={translate('common.more')} options={secondaryActions} isSplitButton={false} wrapperStyle={styles.flexGrow1}/>
            </react_native_1.View>);
    };
    var isLoading = !isOffline && customUnit === undefined;
    (0, react_1.useEffect)(function () {
        if (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) {
            return;
        }
        setSelectedPerDiem([]);
    }, [setSelectedPerDiem, selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled]);
    (0, useSearchBackPress_1.default)({
        onClearSelection: function () {
            setSelectedPerDiem([]);
        },
        onNavigationCallBack: function () { return Navigation_1.default.goBack(backTo); },
    });
    var selectionModeHeader = (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) && shouldUseNarrowLayout;
    var headerContent = (<>
            <react_native_1.View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                <Text_1.default>
                    <Text_1.default style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.perDiem.subtitle')}</Text_1.default>
                    <TextLink_1.default style={[styles.textNormal, styles.link]} onPress={function () { return (0, Link_1.openExternalLink)(CONST_1.default.DEEP_DIVE_PER_DIEM); }}>
                        {translate('workspace.common.learnMore')}
                    </TextLink_1.default>
                </Text_1.default>
            </react_native_1.View>
            {subRatesList.length > CONST_1.default.SEARCH_ITEM_LIMIT && (<SearchBar_1.default label={translate('workspace.perDiem.findPerDiemRate')} inputValue={inputValue} onChangeText={setInputValue} shouldShowEmptyState={hasVisibleSubRates && !isLoading && filteredSubRatesList.length === 0}/>)}
        </>);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={WorkspacePerDiemPage.displayName} shouldShowOfflineIndicatorInWideScreen offlineIndicatorStyle={styles.mtAuto}>
                <HeaderWithBackButton_1.default shouldShowBackButton={shouldUseNarrowLayout} title={translate(selectionModeHeader ? 'common.selectMultiple' : 'common.perDiem')} icon={!selectionModeHeader ? Illustrations.PerDiem : undefined} shouldUseHeadlineHeader={!selectionModeHeader} onBackButtonPress={function () {
            if (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) {
                setSelectedPerDiem([]);
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
                <ConfirmModal_1.default isVisible={deletePerDiemConfirmModalVisible} onConfirm={handleDeletePerDiemRates} onCancel={function () { return setDeletePerDiemConfirmModalVisible(false); }} title={translate('workspace.perDiem.deletePerDiemRate')} prompt={translate('workspace.perDiem.areYouSureDelete', { count: selectedPerDiem.length })} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger/>
                {shouldUseNarrowLayout && <react_native_1.View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</react_native_1.View>}
                {(!hasVisibleSubRates || isLoading) && headerContent}
                {isLoading && (<react_native_1.ActivityIndicator size={CONST_1.default.ACTIVITY_INDICATOR_SIZE.LARGE} style={[styles.flex1]} color={theme.spinner}/>)}
                {hasVisibleSubRates && !isLoading && (<SelectionListWithModal_1.default addBottomSafeAreaPadding canSelectMultiple={canSelectMultiple} turnOnSelectionModeOnLongPress onTurnOnSelectionMode={function (item) { return item && toggleSubRate(item); }} sections={[{ data: filteredSubRatesList, isDisabled: false }]} shouldUseDefaultRightHandSideCheckmark={false} selectedItems={selectedPerDiem.map(function (item) { return item.subRateID; })} onCheckboxPress={toggleSubRate} onSelectRow={openSubRateDetails} shouldPreventDefaultFocusOnSelectRow={!(0, DeviceCapabilities_1.canUseTouchScreen)()} onSelectAll={filteredSubRatesList.length > 0 ? toggleAllSubRates : undefined} ListItem={TableListItem_1.default} listHeaderContent={headerContent} shouldShowListEmptyContent={false} customListHeader={getCustomListHeader()} listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]} listItemTitleContainerStyles={styles.flex3} showScrollIndicator={false}/>)}
                {!hasVisibleSubRates && !isLoading && (<ScrollView_1.default contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
                        <EmptyStateComponent_1.default SkeletonComponent={TableRowSkeleton_1.default} headerMediaType={CONST_1.default.EMPTY_STATE_MEDIA.ANIMATION} headerMedia={LottieAnimations_1.default.GenericEmptyState} title={translate('workspace.perDiem.emptyList.title')} subtitle={translate('workspace.perDiem.emptyList.subtitle')} headerStyles={[styles.emptyStateCardIllustrationContainer, styles.emptyFolderBG]} lottieWebViewStyles={styles.emptyStateFolderWebStyles} headerContentStyles={styles.emptyStateFolderWebStyles} buttons={[
                {
                    buttonText: translate('spreadsheet.importSpreadsheet'),
                    buttonAction: function () {
                        if (isOffline) {
                            setIsOfflineModalVisible(true);
                            return;
                        }
                        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_PER_DIEM_IMPORT.getRoute(policyID));
                    },
                    success: true,
                },
            ]}/>
                    </ScrollView_1.default>)}
                <ConfirmModal_1.default isVisible={isOfflineModalVisible} onConfirm={function () { return setIsOfflineModalVisible(false); }} title={translate('common.youAppearToBeOffline')} prompt={translate('common.thisFeatureRequiresInternet')} confirmText={translate('common.buttonConfirm')} shouldShowCancelButton={false} onCancel={function () { return setIsOfflineModalVisible(false); }} shouldHandleNavigationBack/>
                <DecisionModal_1.default title={translate('common.downloadFailedTitle')} prompt={translate('common.downloadFailedDescription')} isSmallScreenWidth={isSmallScreenWidth} onSecondOptionSubmit={function () { return setIsDownloadFailureModalVisible(false); }} secondOptionText={translate('common.buttonConfirm')} isVisible={isDownloadFailureModalVisible} onClose={function () { return setIsDownloadFailureModalVisible(false); }}/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspacePerDiemPage.displayName = 'WorkspacePerDiemPage';
exports.default = WorkspacePerDiemPage;
