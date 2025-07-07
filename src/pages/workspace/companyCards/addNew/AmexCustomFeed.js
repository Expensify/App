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
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CompanyCards = require("@userActions/CompanyCards");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function AmexCustomFeed() {
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var addNewCard = (0, useOnyx_1.default)(ONYXKEYS_1.default.ADD_NEW_COMPANY_CARD)[0];
    var _a = (0, react_1.useState)(), typeSelected = _a[0], setTypeSelected = _a[1];
    var _b = (0, react_1.useState)(false), hasError = _b[0], setHasError = _b[1];
    var submit = function () {
        if (!typeSelected) {
            setHasError(true);
            return;
        }
        CompanyCards.setAddNewCompanyCardStepAndData({
            step: typeSelected === CONST_1.default.COMPANY_CARDS.AMEX_CUSTOM_FEED.CORPORATE ? CONST_1.default.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS : CONST_1.default.COMPANY_CARDS.STEP.BANK_CONNECTION,
            data: {
                feedType: CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.AMEX,
                selectedAmexCustomFeed: typeSelected,
            },
        });
    };
    (0, react_1.useEffect)(function () {
        setTypeSelected(addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data.selectedAmexCustomFeed);
    }, [addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data.selectedAmexCustomFeed]);
    var handleBackButtonPress = function () {
        CompanyCards.setAddNewCompanyCardStepAndData({ step: CONST_1.default.COMPANY_CARDS.STEP.SELECT_BANK });
    };
    var data = [
        {
            value: CONST_1.default.COMPANY_CARDS.AMEX_CUSTOM_FEED.CORPORATE,
            text: CONST_1.default.COMPANY_CARDS.AMEX_CUSTOM_FEED.CORPORATE,
            alternateText: translate('workspace.companyCards.addNewCard.amexCorporate'),
            keyForList: CONST_1.default.COMPANY_CARDS.AMEX_CUSTOM_FEED.CORPORATE,
            isSelected: typeSelected === CONST_1.default.COMPANY_CARDS.AMEX_CUSTOM_FEED.CORPORATE,
        },
        {
            value: CONST_1.default.COMPANY_CARDS.AMEX_CUSTOM_FEED.BUSINESS,
            text: CONST_1.default.COMPANY_CARDS.AMEX_CUSTOM_FEED.BUSINESS,
            alternateText: translate('workspace.companyCards.addNewCard.amexBusiness'),
            keyForList: CONST_1.default.COMPANY_CARDS.AMEX_CUSTOM_FEED.BUSINESS,
            isSelected: typeSelected === CONST_1.default.COMPANY_CARDS.AMEX_CUSTOM_FEED.BUSINESS,
        },
        {
            value: CONST_1.default.COMPANY_CARDS.AMEX_CUSTOM_FEED.PERSONAL,
            text: CONST_1.default.COMPANY_CARDS.AMEX_CUSTOM_FEED.PERSONAL,
            alternateText: translate('workspace.companyCards.addNewCard.amexPersonal'),
            keyForList: CONST_1.default.COMPANY_CARDS.AMEX_CUSTOM_FEED.PERSONAL,
            isSelected: typeSelected === CONST_1.default.COMPANY_CARDS.AMEX_CUSTOM_FEED.PERSONAL,
        },
    ];
    return (<ScreenWrapper_1.default testID={AmexCustomFeed.displayName} enableEdgeToEdgeBottomSafeAreaPadding shouldEnablePickerAvoiding={false} shouldEnableMaxHeight>
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
        }} sections={[{ data: data }]} shouldSingleExecuteRowSelect isAlternateTextMultilineSupported alternateTextNumberOfLines={3} initiallyFocusedOptionKey={addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data.selectedAmexCustomFeed} shouldUpdateFocusedIndex showConfirmButton confirmButtonText={translate('common.next')} onConfirm={submit} addBottomSafeAreaPadding>
                {hasError && (<react_native_1.View style={[styles.ph5, styles.mb3]}>
                        <FormHelpMessage_1.default isError={hasError} message={translate('workspace.companyCards.addNewCard.error.pleaseSelectBankAccount')}/>
                    </react_native_1.View>)}
            </SelectionList_1.default>
        </ScreenWrapper_1.default>);
}
AmexCustomFeed.displayName = 'AmexCustomFeed';
exports.default = AmexCustomFeed;
