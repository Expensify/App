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
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Icon_1 = require("@components/Icon");
var Illustrations = require("@components/Icon/Illustrations");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardUtils_1 = require("@libs/CardUtils");
var variables_1 = require("@styles/variables");
var CompanyCards_1 = require("@userActions/CompanyCards");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function getAvailableCompanyCardTypes(_a) {
    var translate = _a.translate, typeSelected = _a.typeSelected, styles = _a.styles, canUsePlaidCompanyCards = _a.canUsePlaidCompanyCards;
    var defaultCards = [
        {
            value: CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD,
            text: translate('workspace.companyCards.addNewCard.cardProviders.cdf'),
            keyForList: CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD,
            isSelected: typeSelected === CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD,
            leftElement: (<Icon_1.default src={Illustrations.MasterCardCompanyCardDetail} height={variables_1.default.iconSizeExtraLarge} width={variables_1.default.iconSizeExtraLarge} additionalStyles={styles}/>),
        },
        {
            value: CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA,
            text: translate('workspace.companyCards.addNewCard.cardProviders.vcf'),
            keyForList: CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA,
            isSelected: typeSelected === CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA,
            leftElement: (<Icon_1.default src={Illustrations.VisaCompanyCardDetail} height={variables_1.default.iconSizeExtraLarge} width={variables_1.default.iconSizeExtraLarge} additionalStyles={styles}/>),
        },
    ];
    if (!canUsePlaidCompanyCards) {
        return defaultCards;
    }
    return __spreadArray([
        {
            value: CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.AMEX,
            text: translate('workspace.companyCards.addNewCard.cardProviders.gl1025'),
            keyForList: CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.AMEX,
            isSelected: typeSelected === CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.AMEX,
            leftElement: (<Icon_1.default src={Illustrations.AmexCardCompanyCardDetail} height={variables_1.default.iconSizeExtraLarge} width={variables_1.default.iconSizeExtraLarge} additionalStyles={styles}/>),
        }
    ], defaultCards, true);
}
function CardTypeStep() {
    var _a;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var addNewCard = (0, useOnyx_1.default)(ONYXKEYS_1.default.ADD_NEW_COMPANY_CARD, { canBeMissing: true })[0];
    var _b = (0, react_1.useState)(), typeSelected = _b[0], setTypeSelected = _b[1];
    var _c = (0, react_1.useState)(false), isError = _c[0], setIsError = _c[1];
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var data = getAvailableCompanyCardTypes({ translate: translate, typeSelected: typeSelected, styles: styles.mr3, canUsePlaidCompanyCards: isBetaEnabled(CONST_1.default.BETAS.PLAID_COMPANY_CARDS) });
    var _d = (_a = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) !== null && _a !== void 0 ? _a : {}, bankName = _d.bankName, selectedBank = _d.selectedBank, feedType = _d.feedType;
    var isOtherBankSelected = selectedBank === CONST_1.default.COMPANY_CARDS.BANKS.OTHER;
    var isNewCardTypeSelected = typeSelected !== feedType;
    var doesCountrySupportPlaid = (0, CardUtils_1.isPlaidSupportedCountry)(addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data.selectedCountry);
    var submit = function () {
        if (!typeSelected) {
            setIsError(true);
        }
        else {
            (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({
                step: CONST_1.default.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS,
                data: {
                    feedType: typeSelected,
                    bankName: isNewCardTypeSelected && isOtherBankSelected ? '' : bankName,
                },
                isEditing: false,
            });
        }
    };
    (0, react_1.useEffect)(function () {
        setTypeSelected(addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data.feedType);
    }, [addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data.feedType]);
    var handleBackButtonPress = function () {
        if (isOtherBankSelected) {
            (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({ step: CONST_1.default.COMPANY_CARDS.STEP.SELECT_BANK });
            return;
        }
        if (isBetaEnabled(CONST_1.default.BETAS.PLAID_COMPANY_CARDS) && !doesCountrySupportPlaid) {
            (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({ step: CONST_1.default.COMPANY_CARDS.STEP.SELECT_COUNTRY });
            return;
        }
        (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({ step: CONST_1.default.COMPANY_CARDS.STEP.SELECT_FEED_TYPE });
    };
    return (<ScreenWrapper_1.default testID={CardTypeStep.displayName} enableEdgeToEdgeBottomSafeAreaPadding shouldEnablePickerAvoiding={false} shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={translate('workspace.companyCards.addCards')} onBackButtonPress={handleBackButtonPress}/>

            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.addNewCard.yourCardProvider')}</Text_1.default>
            <SelectionList_1.default ListItem={RadioListItem_1.default} onSelectRow={function (_a) {
            var value = _a.value;
            setTypeSelected(value);
            setIsError(false);
        }} sections={[{ data: data }]} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data.feedType} shouldUpdateFocusedIndex showConfirmButton confirmButtonText={translate('common.next')} onConfirm={submit} addBottomSafeAreaPadding>
                {isError && (<react_native_1.View style={[styles.ph5, styles.mb3]}>
                        <FormHelpMessage_1.default isError={isError} message={translate('workspace.companyCards.addNewCard.error.pleaseSelectProvider')}/>
                    </react_native_1.View>)}
            </SelectionList_1.default>
        </ScreenWrapper_1.default>);
}
CardTypeStep.displayName = 'CardTypeStep';
exports.default = CardTypeStep;
