"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardUtils_1 = require("@libs/CardUtils");
var CompanyCards_1 = require("@userActions/CompanyCards");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function SelectFeedType() {
    var _a, _b;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var addNewCard = (0, useOnyx_1.default)(ONYXKEYS_1.default.ADD_NEW_COMPANY_CARD, { canBeMissing: true })[0];
    var _c = (0, react_1.useState)(), typeSelected = _c[0], setTypeSelected = _c[1];
    var _d = (0, react_1.useState)(false), hasError = _d[0], setHasError = _d[1];
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var doesCountrySupportPlaid = (0, CardUtils_1.isPlaidSupportedCountry)((_a = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _a === void 0 ? void 0 : _a.selectedCountry);
    var isUSCountry = ((_b = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _b === void 0 ? void 0 : _b.selectedCountry) === CONST_1.default.COUNTRY.US;
    var submit = function () {
        if (!typeSelected) {
            setHasError(true);
            return;
        }
        var isDirectSelected = typeSelected === CONST_1.default.COMPANY_CARDS.FEED_TYPE.DIRECT;
        if (!isBetaEnabled(CONST_1.default.BETAS.PLAID_COMPANY_CARDS) || !isDirectSelected) {
            (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({
                step: isDirectSelected ? CONST_1.default.COMPANY_CARDS.STEP.BANK_CONNECTION : CONST_1.default.COMPANY_CARDS.STEP.CARD_TYPE,
                data: { selectedFeedType: typeSelected },
            });
            return;
        }
        var step = isUSCountry ? CONST_1.default.COMPANY_CARDS.STEP.SELECT_BANK : CONST_1.default.COMPANY_CARDS.STEP.PLAID_CONNECTION;
        (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({
            step: step,
            data: { selectedFeedType: typeSelected },
        });
    };
    (0, react_1.useEffect)(function () {
        if (addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data.selectedFeedType) {
            setTypeSelected(addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data.selectedFeedType);
            return;
        }
        if (doesCountrySupportPlaid) {
            setTypeSelected(CONST_1.default.COMPANY_CARDS.FEED_TYPE.DIRECT);
        }
    }, [addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data.selectedFeedType, doesCountrySupportPlaid]);
    var handleBackButtonPress = function () {
        (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({ step: isBetaEnabled(CONST_1.default.BETAS.PLAID_COMPANY_CARDS) ? CONST_1.default.COMPANY_CARDS.STEP.SELECT_COUNTRY : CONST_1.default.COMPANY_CARDS.STEP.SELECT_BANK });
    };
    var data = [
        {
            value: CONST_1.default.COMPANY_CARDS.FEED_TYPE.CUSTOM,
            text: translate('workspace.companyCards.commercialFeed'),
            alternateText: translate(isBetaEnabled(CONST_1.default.BETAS.PLAID_COMPANY_CARDS) ? 'workspace.companyCards.addNewCard.commercialFeedPlaidDetails' : 'workspace.companyCards.addNewCard.commercialFeedDetails'),
            keyForList: CONST_1.default.COMPANY_CARDS.FEED_TYPE.CUSTOM,
            isSelected: typeSelected === CONST_1.default.COMPANY_CARDS.FEED_TYPE.CUSTOM,
        },
        {
            value: CONST_1.default.COMPANY_CARDS.FEED_TYPE.DIRECT,
            text: translate('workspace.companyCards.directFeed'),
            alternateText: translate('workspace.companyCards.addNewCard.directFeedDetails'),
            keyForList: CONST_1.default.COMPANY_CARDS.FEED_TYPE.DIRECT,
            isSelected: typeSelected === CONST_1.default.COMPANY_CARDS.FEED_TYPE.DIRECT,
        },
    ];
    var getFinalData = function () {
        if (!isBetaEnabled(CONST_1.default.BETAS.PLAID_COMPANY_CARDS)) {
            return data;
        }
        if (doesCountrySupportPlaid) {
            return data.reverse();
        }
        return data.slice(0, 1);
    };
    var finalData = getFinalData();
    return (<ScreenWrapper_1.default testID={SelectFeedType.displayName} enableEdgeToEdgeBottomSafeAreaPadding shouldEnablePickerAvoiding={false} shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={translate('workspace.companyCards.addCards')} onBackButtonPress={handleBackButtonPress}/>

            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.addNewCard.howDoYouWantToConnect')}</Text_1.default>
            <Text_1.default style={[styles.textSupporting, styles.ph5, styles.mb6]}>
                {"".concat(translate('workspace.companyCards.addNewCard.learnMoreAboutOptions.text'))}
                <TextLink_1.default href={CONST_1.default.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}>{"".concat(translate('workspace.companyCards.addNewCard.learnMoreAboutOptions.linkText'))}</TextLink_1.default>
            </Text_1.default>

            <SelectionList_1.default ListItem={RadioListItem_1.default} onSelectRow={function (_a) {
            var value = _a.value;
            setTypeSelected(value);
            setHasError(false);
        }} sections={[{ data: finalData }]} shouldSingleExecuteRowSelect isAlternateTextMultilineSupported alternateTextNumberOfLines={3} initiallyFocusedOptionKey={typeSelected} shouldUpdateFocusedIndex showConfirmButton confirmButtonText={translate('common.next')} onConfirm={submit} addBottomSafeAreaPadding>
                {hasError && (<react_native_1.View style={[styles.ph5, styles.mb3]}>
                        <FormHelpMessage_1.default isError={hasError} message={translate('workspace.companyCards.addNewCard.error.pleaseSelectFeedType')}/>
                    </react_native_1.View>)}
            </SelectionList_1.default>
        </ScreenWrapper_1.default>);
}
SelectFeedType.displayName = 'SelectFeedType';
exports.default = SelectFeedType;
