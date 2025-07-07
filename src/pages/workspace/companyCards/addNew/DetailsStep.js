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
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var TextLink_1 = require("@components/TextLink");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useCardFeeds_1 = require("@hooks/useCardFeeds");
var useEnvironment_1 = require("@hooks/useEnvironment");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var Navigation_1 = require("@navigation/Navigation");
var variables_1 = require("@styles/variables");
var CompanyCards_1 = require("@userActions/CompanyCards");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var AddNewCardFeedForm_1 = require("@src/types/form/AddNewCardFeedForm");
function DetailsStep(_a) {
    var _b, _c;
    var policyID = _a.policyID;
    var translate = (0, useLocalize_1.default)().translate;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var isDevelopment = (0, useEnvironment_1.default)().isDevelopment;
    var addNewCard = (0, useOnyx_1.default)(ONYXKEYS_1.default.ADD_NEW_COMPANY_CARD, { canBeMissing: false })[0];
    var lastSelectedFeed = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.LAST_SELECTED_FEED).concat(policyID), { canBeMissing: true })[0];
    var cardFeeds = (0, useCardFeeds_1.default)(policyID)[0];
    var feedProvider = (_b = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _b === void 0 ? void 0 : _b.feedType;
    var isStripeFeedProvider = feedProvider === CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.STRIPE;
    var bank = (_c = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _c === void 0 ? void 0 : _c.selectedBank;
    var isOtherBankSelected = bank === CONST_1.default.COMPANY_CARDS.BANKS.OTHER;
    // s77rt remove DEV lock
    var shouldSelectStatementCloseDate = isDevelopment;
    var submit = function (values) {
        var _a;
        if (!(addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data)) {
            return;
        }
        var feedDetails = __assign(__assign({}, values), { bankName: (_a = addNewCard.data.bankName) !== null && _a !== void 0 ? _a : 'Amex' });
        if (shouldSelectStatementCloseDate) {
            (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({ step: CONST_1.default.COMPANY_CARDS.STEP.SELECT_STATEMENT_CLOSE_DATE, data: { feedDetails: feedDetails } });
            return;
        }
        (0, CompanyCards_1.addNewCompanyCardsFeed)(policyID, addNewCard.data.feedType, feedDetails, cardFeeds, lastSelectedFeed);
        Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_COMPANY_CARDS.getRoute(policyID));
    };
    var handleBackButtonPress = function () {
        if (isOtherBankSelected) {
            (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({ step: CONST_1.default.COMPANY_CARDS.STEP.CARD_NAME });
            return;
        }
        (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({ step: CONST_1.default.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS });
    };
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, [AddNewCardFeedForm_1.default.BANK_ID]);
        switch (feedProvider) {
            case CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA:
                if (!values[AddNewCardFeedForm_1.default.BANK_ID]) {
                    errors[AddNewCardFeedForm_1.default.BANK_ID] = translate('common.error.fieldRequired');
                }
                else if (values[AddNewCardFeedForm_1.default.BANK_ID].length > CONST_1.default.STANDARD_LENGTH_LIMIT) {
                    errors[AddNewCardFeedForm_1.default.BANK_ID] = translate('common.error.characterLimitExceedCounter', {
                        length: values[AddNewCardFeedForm_1.default.BANK_ID].length,
                        limit: CONST_1.default.STANDARD_LENGTH_LIMIT,
                    });
                }
                if (!values[AddNewCardFeedForm_1.default.PROCESSOR_ID]) {
                    errors[AddNewCardFeedForm_1.default.PROCESSOR_ID] = translate('common.error.fieldRequired');
                }
                else if (values[AddNewCardFeedForm_1.default.PROCESSOR_ID].length > CONST_1.default.STANDARD_LENGTH_LIMIT) {
                    errors[AddNewCardFeedForm_1.default.PROCESSOR_ID] = translate('common.error.characterLimitExceedCounter', {
                        length: values[AddNewCardFeedForm_1.default.PROCESSOR_ID].length,
                        limit: CONST_1.default.STANDARD_LENGTH_LIMIT,
                    });
                }
                if (!values[AddNewCardFeedForm_1.default.COMPANY_ID]) {
                    errors[AddNewCardFeedForm_1.default.COMPANY_ID] = translate('common.error.fieldRequired');
                }
                else if (values[AddNewCardFeedForm_1.default.COMPANY_ID].length > CONST_1.default.STANDARD_LENGTH_LIMIT) {
                    errors[AddNewCardFeedForm_1.default.COMPANY_ID] = translate('common.error.characterLimitExceedCounter', {
                        length: values[AddNewCardFeedForm_1.default.COMPANY_ID].length,
                        limit: CONST_1.default.STANDARD_LENGTH_LIMIT,
                    });
                }
                break;
            case CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD:
                if (!values[AddNewCardFeedForm_1.default.DISTRIBUTION_ID]) {
                    errors[AddNewCardFeedForm_1.default.DISTRIBUTION_ID] = translate('common.error.fieldRequired');
                }
                else if (values[AddNewCardFeedForm_1.default.DISTRIBUTION_ID].length > CONST_1.default.STANDARD_LENGTH_LIMIT) {
                    errors[AddNewCardFeedForm_1.default.DISTRIBUTION_ID] = translate('common.error.characterLimitExceedCounter', {
                        length: values[AddNewCardFeedForm_1.default.DISTRIBUTION_ID].length,
                        limit: CONST_1.default.STANDARD_LENGTH_LIMIT,
                    });
                }
                break;
            case CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.AMEX:
                if (!values[AddNewCardFeedForm_1.default.DELIVERY_FILE_NAME]) {
                    errors[AddNewCardFeedForm_1.default.DELIVERY_FILE_NAME] = translate('common.error.fieldRequired');
                }
                else if (values[AddNewCardFeedForm_1.default.DELIVERY_FILE_NAME].length > CONST_1.default.STANDARD_LENGTH_LIMIT) {
                    errors[AddNewCardFeedForm_1.default.DELIVERY_FILE_NAME] = translate('common.error.characterLimitExceedCounter', {
                        length: values[AddNewCardFeedForm_1.default.DELIVERY_FILE_NAME].length,
                        limit: CONST_1.default.STANDARD_LENGTH_LIMIT,
                    });
                }
                break;
            default:
                break;
        }
        return errors;
    }, [feedProvider, translate]);
    var renderInputs = function () {
        var _a, _b, _c, _d, _e;
        switch (feedProvider) {
            case CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA:
                return (<>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={AddNewCardFeedForm_1.default.PROCESSOR_ID} label={translate('workspace.companyCards.addNewCard.feedDetails.vcf.processorLabel')} role={CONST_1.default.ROLE.PRESENTATION} containerStyles={[styles.mb6]} ref={inputCallbackRef} defaultValue={(_a = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data.feedDetails) === null || _a === void 0 ? void 0 : _a.processorID}/>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={AddNewCardFeedForm_1.default.BANK_ID} label={translate('workspace.companyCards.addNewCard.feedDetails.vcf.bankLabel')} role={CONST_1.default.ROLE.PRESENTATION} containerStyles={[styles.mb6]} defaultValue={(_b = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data.feedDetails) === null || _b === void 0 ? void 0 : _b.bankID}/>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={AddNewCardFeedForm_1.default.COMPANY_ID} label={translate('workspace.companyCards.addNewCard.feedDetails.vcf.companyLabel')} role={CONST_1.default.ROLE.PRESENTATION} containerStyles={[styles.mb6]} defaultValue={(_c = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data.feedDetails) === null || _c === void 0 ? void 0 : _c.companyID}/>
                    </>);
            case CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD:
                return (<InputWrapper_1.default InputComponent={TextInput_1.default} inputID={AddNewCardFeedForm_1.default.DISTRIBUTION_ID} label={translate('workspace.companyCards.addNewCard.feedDetails.cdf.distributionLabel')} role={CONST_1.default.ROLE.PRESENTATION} containerStyles={[styles.mb6]} ref={inputCallbackRef} defaultValue={(_d = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data.feedDetails) === null || _d === void 0 ? void 0 : _d.distributionID}/>);
            case CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.AMEX:
                return (<InputWrapper_1.default InputComponent={TextInput_1.default} inputID={AddNewCardFeedForm_1.default.DELIVERY_FILE_NAME} label={translate('workspace.companyCards.addNewCard.feedDetails.gl1025.fileNameLabel')} role={CONST_1.default.ROLE.PRESENTATION} containerStyles={[styles.mb6]} ref={inputCallbackRef} defaultValue={(_e = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data.feedDetails) === null || _e === void 0 ? void 0 : _e.deliveryFileName}/>);
            default:
                return null;
        }
    };
    return (<ScreenWrapper_1.default testID={DetailsStep.displayName} enableEdgeToEdgeBottomSafeAreaPadding shouldEnablePickerAvoiding={false} shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={translate('workspace.companyCards.addCards')} onBackButtonPress={handleBackButtonPress}/>
            <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.ADD_NEW_CARD_FEED_FORM} submitButtonText={shouldSelectStatementCloseDate ? translate('common.next') : translate('common.submit')} onSubmit={submit} validate={validate} style={[styles.mh5, styles.flexGrow1]} shouldHideFixErrorsAlert={feedProvider !== CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA} addBottomSafeAreaPadding>
                <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.mv3]}>
                    {!!feedProvider && !isStripeFeedProvider ? translate("workspace.companyCards.addNewCard.feedDetails.".concat(feedProvider, ".title")) : ''}
                </Text_1.default>
                {renderInputs()}
                {!!feedProvider && !isStripeFeedProvider && (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter]}>
                        <Icon_1.default src={Expensicons.QuestionMark} width={variables_1.default.iconSizeExtraSmall} height={variables_1.default.iconSizeExtraSmall} fill={theme.icon}/>
                        <TextLink_1.default style={[styles.label, styles.textLineHeightNormal, styles.ml2]} href={CONST_1.default.COMPANY_CARDS_DELIVERY_FILE_HELP[feedProvider]}>
                            {translate("workspace.companyCards.addNewCard.feedDetails.".concat(feedProvider, ".helpLabel"))}
                        </TextLink_1.default>
                    </react_native_1.View>)}
            </FormProvider_1.default>
        </ScreenWrapper_1.default>);
}
DetailsStep.displayName = 'DetailsStep';
exports.default = DetailsStep;
