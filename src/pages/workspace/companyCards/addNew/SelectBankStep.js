"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Icon_1 = require("@components/Icon");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var useThemeIllustrations_1 = require("@hooks/useThemeIllustrations");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardUtils_1 = require("@libs/CardUtils");
var Navigation_1 = require("@navigation/Navigation");
var variables_1 = require("@styles/variables");
var CompanyCards_1 = require("@userActions/CompanyCards");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function SelectBankStep() {
    var translate = (0, useLocalize_1.default)().translate;
    var route = (0, native_1.useRoute)();
    var styles = (0, useThemeStyles_1.default)();
    var illustrations = (0, useThemeIllustrations_1.default)();
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var addNewCard = (0, useOnyx_1.default)(ONYXKEYS_1.default.ADD_NEW_COMPANY_CARD, { canBeMissing: true })[0];
    var _a = (0, react_1.useState)(), bankSelected = _a[0], setBankSelected = _a[1];
    var _b = (0, react_1.useState)(false), hasError = _b[0], setHasError = _b[1];
    var isOtherBankSelected = bankSelected === CONST_1.default.COMPANY_CARDS.BANKS.OTHER;
    var submit = function () {
        if (!bankSelected) {
            setHasError(true);
        }
        else {
            if ((addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data.selectedBank) !== bankSelected && !isBetaEnabled(CONST_1.default.BETAS.PLAID_COMPANY_CARDS)) {
                (0, CompanyCards_1.clearAddNewCardFlow)();
            }
            (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({
                step: isBetaEnabled(CONST_1.default.BETAS.PLAID_COMPANY_CARDS) ? (0, CardUtils_1.getCorrectStepForPlaidSelectedBank)(bankSelected) : (0, CardUtils_1.getCorrectStepForSelectedBank)(bankSelected),
                data: {
                    selectedBank: bankSelected,
                    cardTitle: !isOtherBankSelected ? bankSelected : undefined,
                    feedType: bankSelected === CONST_1.default.COMPANY_CARDS.BANKS.STRIPE ? CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.STRIPE : undefined,
                },
                isEditing: false,
            });
        }
    };
    (0, react_1.useEffect)(function () {
        setBankSelected(addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data.selectedBank);
    }, [addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data.selectedBank]);
    var handleBackButtonPress = function () {
        var _a;
        if ((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.backTo) {
            Navigation_1.default.navigate(route.params.backTo);
            return;
        }
        if (isBetaEnabled(CONST_1.default.BETAS.PLAID_COMPANY_CARDS)) {
            (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({ step: CONST_1.default.COMPANY_CARDS.STEP.SELECT_FEED_TYPE });
        }
        else {
            Navigation_1.default.goBack();
        }
    };
    var data = Object.values(CONST_1.default.COMPANY_CARDS.BANKS).map(function (bank) { return ({
        value: bank,
        text: bank === CONST_1.default.COMPANY_CARDS.BANKS.OTHER ? translate('workspace.companyCards.addNewCard.other') : bank,
        keyForList: bank,
        isSelected: bankSelected === bank,
        leftElement: (<Icon_1.default src={(0, CardUtils_1.getBankCardDetailsImage)(bank, illustrations)} height={variables_1.default.iconSizeExtraLarge} width={variables_1.default.iconSizeExtraLarge} additionalStyles={styles.mr3}/>),
    }); });
    return (<ScreenWrapper_1.default testID={SelectBankStep.displayName} enableEdgeToEdgeBottomSafeAreaPadding shouldEnablePickerAvoiding={false} shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={translate('workspace.companyCards.addCards')} onBackButtonPress={handleBackButtonPress}/>

            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.addNewCard.whoIsYourBankAccount')}</Text_1.default>
            <SelectionList_1.default ListItem={RadioListItem_1.default} onSelectRow={function (_a) {
            var value = _a.value;
            setBankSelected(value);
            setHasError(false);
        }} sections={[{ data: data }]} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data.selectedBank} shouldUpdateFocusedIndex showConfirmButton confirmButtonText={translate('common.next')} onConfirm={submit} confirmButtonStyles={!hasError && styles.mt5} addBottomSafeAreaPadding>
                {hasError && (<react_native_1.View style={[styles.ph3, styles.mb3]}>
                        <FormHelpMessage_1.default isError={hasError} message={translate('workspace.companyCards.addNewCard.error.pleaseSelectBank')}/>
                    </react_native_1.View>)}
            </SelectionList_1.default>
        </ScreenWrapper_1.default>);
}
SelectBankStep.displayName = 'SelectBankStep';
exports.default = SelectBankStep;
