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
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var TaxRate_1 = require("@libs/actions/TaxRate");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function WorkspaceEditTaxPage(_a) {
    var _b, _c, _d, _e, _f, _g;
    var _h = _a.route.params, policyID = _h.policyID, taxID = _h.taxID, policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var currentTaxID = (0, PolicyUtils_1.getCurrentTaxID)(policy, taxID);
    var currentTaxRate = currentTaxID && ((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _b === void 0 ? void 0 : _b.taxes) === null || _c === void 0 ? void 0 : _c[currentTaxID]);
    var _j = (0, react_1.useState)(false), isDeleteModalVisible = _j[0], setIsDeleteModalVisible = _j[1];
    var canEditTaxRate = policy && (0, PolicyUtils_1.canEditTaxRate)(policy, currentTaxID !== null && currentTaxID !== void 0 ? currentTaxID : taxID);
    var shouldShowDeleteMenuItem = canEditTaxRate && !(0, PolicyUtils_1.hasAccountingConnections)(policy);
    var toggleTaxRate = function () {
        if (!currentTaxRate) {
            return;
        }
        (0, TaxRate_1.setPolicyTaxesEnabled)(policy, [taxID], !!currentTaxRate.isDisabled);
    };
    (0, react_1.useEffect)(function () {
        if (currentTaxID === taxID || !currentTaxID) {
            return;
        }
        Navigation_1.default.setParams({ taxID: currentTaxID });
    }, [taxID, currentTaxID]);
    var deleteTaxRate = function () {
        if (!policyID) {
            return;
        }
        (0, TaxRate_1.deletePolicyTaxes)(policy, [taxID]);
        setIsDeleteModalVisible(false);
        Navigation_1.default.goBack();
    };
    if (!currentTaxRate) {
        return <NotFoundPage_1.default />;
    }
    var taxCodeToShow = (0, PolicyUtils_1.isControlPolicy)(policy) ? taxID : '';
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED}>
            <ScreenWrapper_1.default testID={WorkspaceEditTaxPage.displayName} style={styles.mb5}>
                <react_native_1.View style={[styles.h100, styles.flex1]}>
                    <HeaderWithBackButton_1.default title={currentTaxRate === null || currentTaxRate === void 0 ? void 0 : currentTaxRate.name}/>
                    <OfflineWithFeedback_1.default errors={(0, ErrorUtils_1.getLatestErrorField)(currentTaxRate, 'isDisabled')} pendingAction={(_d = currentTaxRate === null || currentTaxRate === void 0 ? void 0 : currentTaxRate.pendingFields) === null || _d === void 0 ? void 0 : _d.isDisabled} errorRowStyles={styles.mh5} onClose={function () { return (0, TaxRate_1.clearTaxRateFieldError)(policyID, taxID, 'isDisabled'); }}>
                        <react_native_1.View style={[styles.mt2, styles.mh5]}>
                            <react_native_1.View style={[styles.flexRow, styles.mb5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                <Text_1.default>{translate('workspace.taxes.actions.enable')}</Text_1.default>
                                <Switch_1.default isOn={!(currentTaxRate === null || currentTaxRate === void 0 ? void 0 : currentTaxRate.isDisabled)} accessibilityLabel={translate('workspace.taxes.actions.enable')} onToggle={toggleTaxRate} disabled={!canEditTaxRate}/>
                            </react_native_1.View>
                        </react_native_1.View>
                    </OfflineWithFeedback_1.default>
                    <OfflineWithFeedback_1.default errors={(0, ErrorUtils_1.getLatestErrorField)(currentTaxRate, 'name')} pendingAction={(_e = currentTaxRate === null || currentTaxRate === void 0 ? void 0 : currentTaxRate.pendingFields) === null || _e === void 0 ? void 0 : _e.name} errorRowStyles={styles.mh5} onClose={function () { return (0, TaxRate_1.clearTaxRateFieldError)(policyID, taxID, 'name'); }}>
                        <MenuItemWithTopDescription_1.default shouldShowRightIcon title={currentTaxRate === null || currentTaxRate === void 0 ? void 0 : currentTaxRate.name} description={translate('common.name')} style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_TAX_NAME.getRoute("".concat(policyID), taxID)); }}/>
                    </OfflineWithFeedback_1.default>
                    <OfflineWithFeedback_1.default errors={(0, ErrorUtils_1.getLatestErrorField)(currentTaxRate, 'value')} pendingAction={(_f = currentTaxRate === null || currentTaxRate === void 0 ? void 0 : currentTaxRate.pendingFields) === null || _f === void 0 ? void 0 : _f.value} errorRowStyles={styles.mh5} onClose={function () { return (0, TaxRate_1.clearTaxRateFieldError)(policyID, taxID, 'value'); }}>
                        <MenuItemWithTopDescription_1.default shouldShowRightIcon title={currentTaxRate === null || currentTaxRate === void 0 ? void 0 : currentTaxRate.value} description={translate('workspace.taxes.value')} style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_TAX_VALUE.getRoute("".concat(policyID), taxID)); }}/>
                    </OfflineWithFeedback_1.default>
                    <OfflineWithFeedback_1.default errors={(0, ErrorUtils_1.getLatestErrorField)(currentTaxRate, 'code')} pendingAction={(_g = currentTaxRate === null || currentTaxRate === void 0 ? void 0 : currentTaxRate.pendingFields) === null || _g === void 0 ? void 0 : _g.code} errorRowStyles={styles.mh5} onClose={function () { return (0, TaxRate_1.clearTaxRateFieldError)(policyID, taxID, 'code'); }}>
                        <MenuItemWithTopDescription_1.default shouldShowRightIcon title={taxCodeToShow} description={translate('workspace.taxes.taxCode')} style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1} onPress={function () {
            if (!(0, PolicyUtils_1.isControlPolicy)(policy)) {
                Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_UPGRADE.getRoute(policyID, CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.taxCodes.alias, ROUTES_1.default.WORKSPACE_TAX_CODE.getRoute("".concat(policyID), taxID)));
                return;
            }
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_TAX_CODE.getRoute("".concat(policyID), taxID));
        }}/>
                    </OfflineWithFeedback_1.default>
                    {!!shouldShowDeleteMenuItem && (<MenuItem_1.default icon={Expensicons.Trashcan} title={translate('common.delete')} onPress={function () { return setIsDeleteModalVisible(true); }}/>)}
                </react_native_1.View>
                <ConfirmModal_1.default title={translate('workspace.taxes.actions.delete')} isVisible={isDeleteModalVisible} onConfirm={deleteTaxRate} onCancel={function () { return setIsDeleteModalVisible(false); }} prompt={translate('workspace.taxes.deleteTaxConfirmation')} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceEditTaxPage.displayName = 'WorkspaceEditTaxPage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(WorkspaceEditTaxPage);
