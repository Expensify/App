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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var ButtonWithDropdownMenu_1 = require("@components/ButtonWithDropdownMenu");
var ConfirmModal_1 = require("@components/ConfirmModal");
var EmptyStateComponent_1 = require("@components/EmptyStateComponent");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var SearchBar_1 = require("@components/SearchBar");
var TableListItem_1 = require("@components/SelectionList/TableListItem");
var SelectionListWithModal_1 = require("@components/SelectionListWithModal");
var CustomListHeader_1 = require("@components/SelectionListWithModal/CustomListHeader");
var TableRowSkeleton_1 = require("@components/Skeletons/TableRowSkeleton");
var Switch_1 = require("@components/Switch");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useMobileSelectionMode_1 = require("@hooks/useMobileSelectionMode");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSearchBackPress_1 = require("@hooks/useSearchBackPress");
var useSearchResults_1 = require("@hooks/useSearchResults");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var MobileSelectionMode_1 = require("@libs/actions/MobileSelectionMode");
var ReportField_1 = require("@libs/actions/Policy/ReportField");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var LocaleCompare_1 = require("@libs/LocaleCompare");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var StringUtils_1 = require("@libs/StringUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function ReportFieldsListValuesPage(_a) {
    var policy = _a.policy, _b = _a.route.params, policyID = _b.policyID, reportFieldID = _b.reportFieldID;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout here to use the mobile selection mode on small screens only
    // See https://github.com/Expensify/App/issues/48724 for more details
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    var formDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, { canBeMissing: true })[0];
    var selectionMode = (0, useMobileSelectionMode_1.default)().selectionMode;
    var _c = (0, react_1.useState)({}), selectedValues = _c[0], setSelectedValues = _c[1];
    var _d = (0, react_1.useState)(false), deleteValuesConfirmModalVisible = _d[0], setDeleteValuesConfirmModalVisible = _d[1];
    var hasAccountingConnections = (0, PolicyUtils_1.hasAccountingConnections)(policy);
    var canSelectMultiple = !hasAccountingConnections && (isSmallScreenWidth ? selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled : true);
    var _e = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        var reportFieldValues;
        var reportFieldDisabledValues;
        if (reportFieldID) {
            var reportFieldKey = (0, ReportUtils_1.getReportFieldKey)(reportFieldID);
            reportFieldValues = Object.values((_c = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.fieldList) === null || _a === void 0 ? void 0 : _a[reportFieldKey]) === null || _b === void 0 ? void 0 : _b.values) !== null && _c !== void 0 ? _c : {});
            reportFieldDisabledValues = Object.values((_f = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.fieldList) === null || _d === void 0 ? void 0 : _d[reportFieldKey]) === null || _e === void 0 ? void 0 : _e.disabledOptions) !== null && _f !== void 0 ? _f : {});
        }
        else {
            reportFieldValues = (_g = formDraft === null || formDraft === void 0 ? void 0 : formDraft.listValues) !== null && _g !== void 0 ? _g : [];
            reportFieldDisabledValues = (_h = formDraft === null || formDraft === void 0 ? void 0 : formDraft.disabledListValues) !== null && _h !== void 0 ? _h : [];
        }
        return [reportFieldValues, reportFieldDisabledValues];
    }, [formDraft === null || formDraft === void 0 ? void 0 : formDraft.disabledListValues, formDraft === null || formDraft === void 0 ? void 0 : formDraft.listValues, policy === null || policy === void 0 ? void 0 : policy.fieldList, reportFieldID]), listValues = _e[0], disabledListValues = _e[1];
    var updateReportFieldListValueEnabled = (0, react_1.useCallback)(function (value, valueIndex) {
        if (reportFieldID) {
            (0, ReportField_1.updateReportFieldListValueEnabled)(policyID, reportFieldID, [Number(valueIndex)], value);
            return;
        }
        (0, ReportField_1.setReportFieldsListValueEnabled)([valueIndex], value);
    }, [policyID, reportFieldID]);
    (0, useSearchBackPress_1.default)({
        onClearSelection: function () {
            setSelectedValues({});
        },
        onNavigationCallBack: function () { return Navigation_1.default.goBack(); },
    });
    var data = (0, react_1.useMemo)(function () {
        return listValues.map(function (value, index) {
            var _a, _b;
            return ({
                value: value,
                index: index,
                text: value,
                keyForList: value,
                isSelected: selectedValues[value] && canSelectMultiple,
                enabled: (_a = !disabledListValues.at(index)) !== null && _a !== void 0 ? _a : true,
                rightElement: (<Switch_1.default isOn={(_b = !disabledListValues.at(index)) !== null && _b !== void 0 ? _b : true} accessibilityLabel={translate('workspace.distanceRates.trackTax')} onToggle={function (newValue) { return updateReportFieldListValueEnabled(newValue, index); }}/>),
            });
        });
    }, [canSelectMultiple, disabledListValues, listValues, selectedValues, translate, updateReportFieldListValueEnabled]);
    var filterListValue = (0, react_1.useCallback)(function (item, searchInput) {
        var _a, _b;
        var itemText = StringUtils_1.default.normalize((_b = (_a = item.text) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : '');
        var normalizedSearchInput = StringUtils_1.default.normalize(searchInput.toLowerCase());
        return itemText.includes(normalizedSearchInput);
    }, []);
    var sortListValues = (0, react_1.useCallback)(function (values) { return values.sort(function (a, b) { return (0, LocaleCompare_1.default)(a.value, b.value); }); }, []);
    var _f = (0, useSearchResults_1.default)(data, filterListValue, sortListValues), inputValue = _f[0], setInputValue = _f[1], filteredListValues = _f[2];
    var sections = (0, react_1.useMemo)(function () { return [{ data: filteredListValues, isDisabled: false }]; }, [filteredListValues]);
    var filteredListValuesArray = filteredListValues.map(function (item) { return item.value; });
    var shouldShowEmptyState = Object.values(listValues !== null && listValues !== void 0 ? listValues : {}).length <= 0;
    var selectedValuesArray = Object.keys(selectedValues).filter(function (key) { return selectedValues[key] && listValues.includes(key); });
    var toggleValue = function (valueItem) {
        setSelectedValues(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[valueItem.value] = !prev[valueItem.value], _a)));
        });
    };
    var toggleAllValues = function () {
        setSelectedValues(selectedValuesArray.length > 0 ? {} : Object.fromEntries(filteredListValuesArray.map(function (value) { return [value, true]; })));
    };
    var handleDeleteValues = function () {
        var valuesToDelete = selectedValuesArray.reduce(function (acc, valueName) {
            var _a;
            var index = (_a = listValues === null || listValues === void 0 ? void 0 : listValues.indexOf(valueName)) !== null && _a !== void 0 ? _a : -1;
            if (index !== -1) {
                acc.push(index);
            }
            return acc;
        }, []);
        if (reportFieldID) {
            (0, ReportField_1.removeReportFieldListValue)(policyID, reportFieldID, valuesToDelete);
        }
        else {
            (0, ReportField_1.deleteReportFieldsListValue)(valuesToDelete);
        }
        setDeleteValuesConfirmModalVisible(false);
        react_native_1.InteractionManager.runAfterInteractions(function () {
            setSelectedValues({});
        });
    };
    var openListValuePage = function (valueItem) {
        if (valueItem.index === undefined || hasAccountingConnections) {
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_REPORT_FIELDS_VALUE_SETTINGS.getRoute(policyID, valueItem.index, reportFieldID));
    };
    var getCustomListHeader = function () {
        if (filteredListValues.length === 0) {
            return null;
        }
        return (<CustomListHeader_1.default canSelectMultiple={canSelectMultiple} leftHeaderText={translate('common.name')} rightHeaderText={translate('common.enabled')}/>);
    };
    var getHeaderButtons = function () {
        var options = [];
        if (isSmallScreenWidth ? selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled : selectedValuesArray.length > 0) {
            if (selectedValuesArray.length > 0) {
                options.push({
                    icon: Expensicons.Trashcan,
                    text: translate(selectedValuesArray.length === 1 ? 'workspace.reportFields.deleteValue' : 'workspace.reportFields.deleteValues'),
                    value: CONST_1.default.POLICY.BULK_ACTION_TYPES.DELETE,
                    onSelected: function () { return setDeleteValuesConfirmModalVisible(true); },
                });
            }
            var enabledValues = selectedValuesArray.filter(function (valueName) {
                var _a;
                var index = (_a = listValues === null || listValues === void 0 ? void 0 : listValues.indexOf(valueName)) !== null && _a !== void 0 ? _a : -1;
                return !(disabledListValues === null || disabledListValues === void 0 ? void 0 : disabledListValues.at(index));
            });
            if (enabledValues.length > 0) {
                var valuesToDisable_1 = selectedValuesArray.reduce(function (acc, valueName) {
                    var _a;
                    var index = (_a = listValues === null || listValues === void 0 ? void 0 : listValues.indexOf(valueName)) !== null && _a !== void 0 ? _a : -1;
                    if (!(disabledListValues === null || disabledListValues === void 0 ? void 0 : disabledListValues.at(index)) && index !== -1) {
                        acc.push(index);
                    }
                    return acc;
                }, []);
                options.push({
                    icon: Expensicons.Close,
                    text: translate(enabledValues.length === 1 ? 'workspace.reportFields.disableValue' : 'workspace.reportFields.disableValues'),
                    value: CONST_1.default.POLICY.BULK_ACTION_TYPES.DISABLE,
                    onSelected: function () {
                        setSelectedValues({});
                        if (reportFieldID) {
                            (0, ReportField_1.updateReportFieldListValueEnabled)(policyID, reportFieldID, valuesToDisable_1, false);
                            return;
                        }
                        (0, ReportField_1.setReportFieldsListValueEnabled)(valuesToDisable_1, false);
                    },
                });
            }
            var disabledValues = selectedValuesArray.filter(function (valueName) {
                var _a;
                var index = (_a = listValues === null || listValues === void 0 ? void 0 : listValues.indexOf(valueName)) !== null && _a !== void 0 ? _a : -1;
                return disabledListValues === null || disabledListValues === void 0 ? void 0 : disabledListValues.at(index);
            });
            if (disabledValues.length > 0) {
                var valuesToEnable_1 = selectedValuesArray.reduce(function (acc, valueName) {
                    var _a;
                    var index = (_a = listValues === null || listValues === void 0 ? void 0 : listValues.indexOf(valueName)) !== null && _a !== void 0 ? _a : -1;
                    if ((disabledListValues === null || disabledListValues === void 0 ? void 0 : disabledListValues.at(index)) && index !== -1) {
                        acc.push(index);
                    }
                    return acc;
                }, []);
                options.push({
                    icon: Expensicons.Checkmark,
                    text: translate(disabledValues.length === 1 ? 'workspace.reportFields.enableValue' : 'workspace.reportFields.enableValues'),
                    value: CONST_1.default.POLICY.BULK_ACTION_TYPES.ENABLE,
                    onSelected: function () {
                        setSelectedValues({});
                        if (reportFieldID) {
                            (0, ReportField_1.updateReportFieldListValueEnabled)(policyID, reportFieldID, valuesToEnable_1, true);
                            return;
                        }
                        (0, ReportField_1.setReportFieldsListValueEnabled)(valuesToEnable_1, true);
                    },
                });
            }
            return (<ButtonWithDropdownMenu_1.default onPress={function () { return null; }} shouldAlwaysShowDropdownMenu buttonSize={CONST_1.default.DROPDOWN_BUTTON_SIZE.MEDIUM} customText={translate('workspace.common.selected', { count: selectedValuesArray.length })} options={options} isSplitButton={false} style={[isSmallScreenWidth && styles.flexGrow1, isSmallScreenWidth && styles.mb3]} isDisabled={!selectedValuesArray.length}/>);
        }
        return (<Button_1.default style={[isSmallScreenWidth && styles.flexGrow1, isSmallScreenWidth && styles.mb3]} success icon={Expensicons.Plus} text={translate('workspace.reportFields.addValue')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_REPORT_FIELDS_ADD_VALUE.getRoute(policyID, reportFieldID)); }}/>);
    };
    var selectionModeHeader = (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) && isSmallScreenWidth;
    var headerContent = (<>
            <react_native_1.View style={[styles.ph5, styles.pv4]}>
                <Text_1.default style={[styles.sidebarLinkText, styles.optionAlternateText]}>{translate('workspace.reportFields.listInputSubtitle')}</Text_1.default>
            </react_native_1.View>
            {data.length > CONST_1.default.SEARCH_ITEM_LIMIT && (<SearchBar_1.default label={translate('workspace.reportFields.findReportField')} inputValue={inputValue} onChangeText={setInputValue} shouldShowEmptyState={!shouldShowEmptyState && filteredListValues.length === 0}/>)}
        </>);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={styles.defaultModalContainer} testID={ReportFieldsListValuesPage.displayName} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate(selectionModeHeader ? 'common.selectMultiple' : 'workspace.reportFields.listValues')} onBackButtonPress={function () {
            if (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) {
                setSelectedValues({});
                (0, MobileSelectionMode_1.turnOffMobileSelectionMode)();
                return;
            }
            Navigation_1.default.goBack();
        }}>
                    {!isSmallScreenWidth && !hasAccountingConnections && getHeaderButtons()}
                </HeaderWithBackButton_1.default>
                {isSmallScreenWidth && <react_native_1.View style={[styles.pl5, styles.pr5]}>{!hasAccountingConnections && getHeaderButtons()}</react_native_1.View>}
                {shouldShowEmptyState && (<ScrollView_1.default contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
                        {headerContent}
                        <EmptyStateComponent_1.default title={translate('workspace.reportFields.emptyReportFieldsValues.title')} subtitle={translate('workspace.reportFields.emptyReportFieldsValues.subtitle')} SkeletonComponent={TableRowSkeleton_1.default} headerMediaType={CONST_1.default.EMPTY_STATE_MEDIA.ILLUSTRATION} headerMedia={Illustrations.FolderWithPapers} headerStyles={styles.emptyFolderDarkBG} headerContentStyles={styles.emptyStateFolderWithPaperIconSize}/>
                    </ScrollView_1.default>)}
                {!shouldShowEmptyState && (<SelectionListWithModal_1.default addBottomSafeAreaPadding canSelectMultiple={canSelectMultiple} turnOnSelectionModeOnLongPress={!hasAccountingConnections} onTurnOnSelectionMode={function (item) { return item && toggleValue(item); }} sections={sections} selectedItems={selectedValuesArray} shouldUseDefaultRightHandSideCheckmark={false} onCheckboxPress={toggleValue} onSelectRow={openListValuePage} onSelectAll={filteredListValues.length > 0 ? toggleAllValues : undefined} ListItem={TableListItem_1.default} listHeaderContent={headerContent} customListHeader={getCustomListHeader()} shouldShowListEmptyContent={false} shouldPreventDefaultFocusOnSelectRow={!(0, DeviceCapabilities_1.canUseTouchScreen)()} listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]} showScrollIndicator={false}/>)}
                <ConfirmModal_1.default isVisible={deleteValuesConfirmModalVisible} onConfirm={handleDeleteValues} onCancel={function () { return setDeleteValuesConfirmModalVisible(false); }} title={translate(selectedValuesArray.length === 1 ? 'workspace.reportFields.deleteValue' : 'workspace.reportFields.deleteValues')} prompt={translate(selectedValuesArray.length === 1 ? 'workspace.reportFields.deleteValuePrompt' : 'workspace.reportFields.deleteValuesPrompt')} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
ReportFieldsListValuesPage.displayName = 'ReportFieldsListValuesPage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(ReportFieldsListValuesPage);
