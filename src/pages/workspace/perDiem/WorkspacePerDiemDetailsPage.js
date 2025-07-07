"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var ConfirmModal_1 = require("@components/ConfirmModal");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var PerDiem_1 = require("@userActions/Policy/PerDiem");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function WorkspacePerDiemDetailsPage(_a) {
    var _b, _c;
    var route = _a.route;
    var policyID = route.params.policyID;
    var rateID = route.params.rateID;
    var subRateID = route.params.subRateID;
    var _d = (0, react_1.useState)(false), deletePerDiemConfirmModalVisible = _d[0], setDeletePerDiemConfirmModalVisible = _d[1];
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { canBeMissing: false })[0];
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var customUnit = (0, PolicyUtils_1.getPerDiemCustomUnit)(policy);
    var selectedRate = (_b = customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates) === null || _b === void 0 ? void 0 : _b[rateID];
    var fetchedSubRate = (_c = selectedRate === null || selectedRate === void 0 ? void 0 : selectedRate.subRates) === null || _c === void 0 ? void 0 : _c.find(function (subRate) { return subRate.id === subRateID; });
    var previousFetchedSubRate = (0, usePrevious_1.default)(fetchedSubRate);
    var selectedSubRate = fetchedSubRate !== null && fetchedSubRate !== void 0 ? fetchedSubRate : previousFetchedSubRate;
    var amountValue = (selectedSubRate === null || selectedSubRate === void 0 ? void 0 : selectedSubRate.rate) ? (0, CurrencyUtils_1.convertToDisplayStringWithoutCurrency)(Number(selectedSubRate.rate)) : undefined;
    var currencyValue = (selectedRate === null || selectedRate === void 0 ? void 0 : selectedRate.currency) ? "".concat(selectedRate.currency, " - ").concat((0, CurrencyUtils_1.getCurrencySymbol)(selectedRate.currency)) : undefined;
    var FullPageBlockingView = (0, EmptyObject_1.isEmptyObject)(selectedSubRate) ? FullPageOfflineBlockingView_1.default : react_native_1.View;
    var handleDeletePerDiemRate = function () {
        var _a, _b, _c, _d;
        (0, PerDiem_1.deleteWorkspacePerDiemRates)(policyID, customUnit, [
            {
                destination: (_a = selectedRate === null || selectedRate === void 0 ? void 0 : selectedRate.name) !== null && _a !== void 0 ? _a : '',
                subRateName: (_b = selectedSubRate === null || selectedSubRate === void 0 ? void 0 : selectedSubRate.name) !== null && _b !== void 0 ? _b : '',
                rate: (_c = selectedSubRate === null || selectedSubRate === void 0 ? void 0 : selectedSubRate.rate) !== null && _c !== void 0 ? _c : 0,
                currency: (_d = selectedRate === null || selectedRate === void 0 ? void 0 : selectedRate.currency) !== null && _d !== void 0 ? _d : '',
                rateID: rateID,
                subRateID: subRateID,
            },
        ]);
        setDeletePerDiemConfirmModalVisible(false);
        Navigation_1.default.goBack();
    };
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={WorkspacePerDiemDetailsPage.displayName}>
                <HeaderWithBackButton_1.default title={translate('workspace.perDiem.editPerDiemRate')}/>
                <ConfirmModal_1.default isVisible={deletePerDiemConfirmModalVisible} onConfirm={handleDeletePerDiemRate} onCancel={function () { return setDeletePerDiemConfirmModalVisible(false); }} title={translate('workspace.perDiem.deletePerDiemRate')} prompt={translate('workspace.perDiem.areYouSureDelete', { count: 1 })} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger/>
                <FullPageBlockingView style={!(0, EmptyObject_1.isEmptyObject)(selectedSubRate) ? styles.flexGrow1 : []} addBottomSafeAreaPadding>
                    <ScrollView_1.default addBottomSafeAreaPadding contentContainerStyle={styles.flexGrow1} keyboardShouldPersistTaps="always">
                        <MenuItemWithTopDescription_1.default title={selectedRate === null || selectedRate === void 0 ? void 0 : selectedRate.name} description={translate('common.destination')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_PER_DIEM_EDIT_DESTINATION.getRoute(policyID, rateID, subRateID)); }} shouldShowRightIcon/>
                        <MenuItemWithTopDescription_1.default title={selectedSubRate === null || selectedSubRate === void 0 ? void 0 : selectedSubRate.name} description={translate('common.subrate')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_PER_DIEM_EDIT_SUBRATE.getRoute(policyID, rateID, subRateID)); }} shouldShowRightIcon/>
                        <MenuItemWithTopDescription_1.default title={amountValue} description={translate('workspace.perDiem.amount')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_PER_DIEM_EDIT_AMOUNT.getRoute(policyID, rateID, subRateID)); }} shouldShowRightIcon/>
                        <MenuItemWithTopDescription_1.default title={currencyValue} description={translate('common.currency')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_PER_DIEM_EDIT_CURRENCY.getRoute(policyID, rateID, subRateID)); }} shouldShowRightIcon/>
                        <MenuItem_1.default icon={Expensicons.Trashcan} title={translate('common.delete')} onPress={function () { return setDeletePerDiemConfirmModalVisible(true); }}/>
                    </ScrollView_1.default>
                </FullPageBlockingView>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspacePerDiemDetailsPage.displayName = 'WorkspacePerDiemDetailsPage';
exports.default = WorkspacePerDiemDetailsPage;
