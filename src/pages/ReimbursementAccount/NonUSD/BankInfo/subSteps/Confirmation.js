"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var getBankInfoStepValues_1 = require("@pages/ReimbursementAccount/NonUSD/utils/getBankInfoStepValues");
var getInputKeysForBankInfoStep_1 = require("@pages/ReimbursementAccount/NonUSD/utils/getInputKeysForBankInfoStep");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var ACCOUNT_HOLDER_COUNTRY = ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.ACCOUNT_HOLDER_COUNTRY;
function Confirmation(_a) {
    var onNext = _a.onNext, onMove = _a.onMove, corpayFields = _a.corpayFields;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: false })[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, { canBeMissing: true })[0];
    var inputKeys = (0, getInputKeysForBankInfoStep_1.default)(corpayFields);
    var values = (0, react_1.useMemo)(function () { return (0, getBankInfoStepValues_1.getBankInfoStepValues)(inputKeys, reimbursementAccountDraft, reimbursementAccount); }, [inputKeys, reimbursementAccount, reimbursementAccountDraft]);
    var items = (0, react_1.useMemo)(function () {
        var _a;
        return (_a = corpayFields === null || corpayFields === void 0 ? void 0 : corpayFields.formFields) === null || _a === void 0 ? void 0 : _a.map(function (field) {
            var title = values[field.id] ? String(values[field.id]) : '';
            if (field.id === ACCOUNT_HOLDER_COUNTRY) {
                title = CONST_1.default.ALL_COUNTRIES[title];
            }
            return (<MenuItemWithTopDescription_1.default description={field.label} title={title} shouldShowRightIcon onPress={function () {
                    if (!field.id.includes(CONST_1.default.NON_USD_BANK_ACCOUNT.BANK_INFO_STEP_ACCOUNT_HOLDER_KEY_PREFIX)) {
                        onMove(0);
                    }
                    else {
                        onMove(1);
                    }
                }} key={field.id}/>);
        });
    }, [corpayFields, onMove, values]);
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} submitButtonText={translate('common.confirm')} onSubmit={onNext} style={[styles.flexGrow1]} submitButtonStyles={styles.mh5}>
            <react_native_1.View style={styles.flexGrow4}>
                <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('bankInfoStep.letsDoubleCheck')}</Text_1.default>
                <Text_1.default style={[styles.textSupporting, styles.ph5, styles.mb5]}>{translate('bankInfoStep.thisBankAccount')}</Text_1.default>
                {(corpayFields === null || corpayFields === void 0 ? void 0 : corpayFields.isLoading) ? (<react_native_1.ActivityIndicator size={CONST_1.default.ACTIVITY_INDICATOR_SIZE.LARGE} color={theme.spinner} style={styles.flexGrow1}/>) : (items)}
            </react_native_1.View>
        </FormProvider_1.default>);
}
Confirmation.displayName = 'Confirmation';
exports.default = Confirmation;
