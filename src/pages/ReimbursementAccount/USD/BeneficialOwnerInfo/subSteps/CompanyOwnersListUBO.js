"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var DotIndicatorMessage_1 = require("@components/DotIndicatorMessage");
var Expensicons_1 = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useSafeAreaPaddings_1 = require("@hooks/useSafeAreaPaddings");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var getValuesForBeneficialOwner_1 = require("@pages/ReimbursementAccount/USD/utils/getValuesForBeneficialOwner");
var getSubStepValues_1 = require("@pages/ReimbursementAccount/utils/getSubStepValues");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var REQUESTOR_PERSONAL_INFO_KEYS = ReimbursementAccountForm_1.default.PERSONAL_INFO_STEP;
function CompanyOwnersListUBO(_a) {
    var _b;
    var isAnyoneElseUBO = _a.isAnyoneElseUBO, isUserUBO = _a.isUserUBO, handleUBOsConfirmation = _a.handleUBOsConfirmation, beneficialOwnerKeys = _a.beneficialOwnerKeys, handleUBOEdit = _a.handleUBOEdit;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var safeAreaInsetPaddingBottom = (0, useSafeAreaPaddings_1.default)().paddingBottom;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT)[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT)[0];
    var isLoading = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isLoading) !== null && _b !== void 0 ? _b : false;
    var requestorData = (0, getSubStepValues_1.default)(REQUESTOR_PERSONAL_INFO_KEYS, undefined, reimbursementAccount);
    var error = (0, ErrorUtils_1.getLatestErrorMessage)(reimbursementAccount);
    var extraBeneficialOwners = isAnyoneElseUBO &&
        reimbursementAccountDraft &&
        beneficialOwnerKeys.map(function (ownerKey) {
            var beneficialOwnerData = (0, getValuesForBeneficialOwner_1.default)(ownerKey, reimbursementAccountDraft);
            return (<MenuItem_1.default key={ownerKey} title={"".concat(beneficialOwnerData.firstName, " ").concat(beneficialOwnerData.lastName)} description={"".concat(beneficialOwnerData.street, ", ").concat(beneficialOwnerData.city, ", ").concat(beneficialOwnerData.state, " ").concat(beneficialOwnerData.zipCode)} wrapperStyle={[styles.ph5]} icon={Expensicons_1.FallbackAvatar} iconType={CONST_1.default.ICON_TYPE_AVATAR} onPress={function () {
                    handleUBOEdit(ownerKey);
                }} iconWidth={40} iconHeight={40} interactive shouldShowRightIcon displayInDefaultIconColor/>);
        });
    return (<ScrollView_1.default style={styles.pt0} contentContainerStyle={[styles.flexGrow1, { paddingBottom: safeAreaInsetPaddingBottom + styles.pb5.paddingBottom }]}>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5]}>{translate('beneficialOwnerInfoStep.letsDoubleCheck')}</Text_1.default>
            <Text_1.default style={[styles.p5, styles.textSupporting]}>{translate('beneficialOwnerInfoStep.regulationRequiresUsToVerifyTheIdentity')}</Text_1.default>
            <react_native_1.View>
                <Text_1.default style={[styles.textSupporting, styles.pv1, styles.ph5]}>{"".concat(translate('beneficialOwnerInfoStep.owners'), ":")}</Text_1.default>
                {isUserUBO && (<MenuItem_1.default title={"".concat(requestorData.firstName, " ").concat(requestorData.lastName)} description={"".concat(requestorData.requestorAddressStreet, ", ").concat(requestorData.requestorAddressCity, ", ").concat(requestorData.requestorAddressState, " ").concat(requestorData.requestorAddressZipCode)} wrapperStyle={[styles.ph5]} icon={Expensicons_1.FallbackAvatar} iconType={CONST_1.default.ICON_TYPE_AVATAR} iconWidth={40} iconHeight={40} interactive={false} shouldShowRightIcon={false} displayInDefaultIconColor/>)}
                {extraBeneficialOwners}
            </react_native_1.View>

            <react_native_1.View style={[styles.ph5, styles.mt5, styles.flexGrow1, styles.justifyContentEnd]}>
                {!!error && error.length > 0 && (<DotIndicatorMessage_1.default textStyles={[styles.formError]} type="error" messages={{ error: error }}/>)}
                <Button_1.default success large isLoading={isLoading} isDisabled={isOffline} style={[styles.w100]} onPress={handleUBOsConfirmation} text={translate('common.confirm')}/>
            </react_native_1.View>
        </ScrollView_1.default>);
}
CompanyOwnersListUBO.displayName = 'CompanyOwnersListUBO';
exports.default = CompanyOwnersListUBO;
