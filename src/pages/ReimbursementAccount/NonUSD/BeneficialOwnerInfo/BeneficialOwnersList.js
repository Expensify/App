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
var getValuesForBeneficialOwner_1 = require("@pages/ReimbursementAccount/NonUSD/utils/getValuesForBeneficialOwner");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function BeneficialOwnersList(_a) {
    var handleConfirmation = _a.handleConfirmation, ownerKeys = _a.ownerKeys, handleOwnerEdit = _a.handleOwnerEdit;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var safeAreaInsetPaddingBottom = (0, useSafeAreaPaddings_1.default)().paddingBottom;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: false })[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, { canBeMissing: false })[0];
    var error = (0, ErrorUtils_1.getLatestErrorMessage)(reimbursementAccount);
    var owners = reimbursementAccountDraft &&
        ownerKeys.map(function (ownerKey) {
            var ownerData = (0, getValuesForBeneficialOwner_1.default)(ownerKey, reimbursementAccountDraft);
            return (<MenuItem_1.default key={ownerKey} title={"".concat(ownerData.firstName, " ").concat(ownerData.lastName)} description={"".concat(ownerData.street, ", ").concat(ownerData.city, ", ").concat(ownerData.state, " ").concat(ownerData.zipCode)} wrapperStyle={[styles.ph5]} icon={Expensicons_1.FallbackAvatar} iconType={CONST_1.default.ICON_TYPE_AVATAR} onPress={function () {
                    handleOwnerEdit(ownerKey);
                }} iconWidth={40} iconHeight={40} interactive shouldShowRightIcon displayInDefaultIconColor/>);
        });
    var areThereOwners = owners !== undefined && (owners === null || owners === void 0 ? void 0 : owners.length) > 0;
    return (<ScrollView_1.default style={styles.pt0} contentContainerStyle={[styles.flexGrow1, { paddingBottom: safeAreaInsetPaddingBottom + styles.pb5.paddingBottom }]}>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5]}>{translate('beneficialOwnerInfoStep.letsDoubleCheck')}</Text_1.default>
            <Text_1.default style={[styles.p5, styles.textSupporting]}>{translate('beneficialOwnerInfoStep.regulationRequiresUsToVerifyTheIdentity')}</Text_1.default>
            {areThereOwners && (<react_native_1.View>
                    <Text_1.default style={[styles.textSupporting, styles.pv1, styles.ph5]}>{"".concat(translate('beneficialOwnerInfoStep.owners'), ":")}</Text_1.default>
                    {owners}
                </react_native_1.View>)}
            <react_native_1.View style={[styles.ph5, styles.mt5, styles.flexGrow1, styles.justifyContentEnd]}>
                {!!error && error.length > 0 && (<DotIndicatorMessage_1.default textStyles={[styles.formError]} type="error" messages={{ error: error }}/>)}
                <Button_1.default success large isLoading={reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isSavingCorpayOnboardingBeneficialOwnersFields} isDisabled={isOffline} style={styles.w100} onPress={function () {
            handleConfirmation({ anyIndividualOwn25PercentOrMore: true });
        }} text={translate('common.confirm')}/>
            </react_native_1.View>
        </ScrollView_1.default>);
}
BeneficialOwnersList.displayName = 'BeneficialOwnersList';
exports.default = BeneficialOwnersList;
