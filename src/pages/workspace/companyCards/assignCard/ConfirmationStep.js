"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var InteractiveStepWrapper_1 = require("@components/InteractiveStepWrapper");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useCardFeeds_1 = require("@hooks/useCardFeeds");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useRootNavigationState_1 = require("@hooks/useRootNavigationState");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardUtils_1 = require("@libs/CardUtils");
var isNavigatorName_1 = require("@libs/Navigation/helpers/isNavigatorName");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var Navigation_1 = require("@navigation/Navigation");
var CompanyCards_1 = require("@userActions/CompanyCards");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
function ConfirmationStep(_a) {
    var _b, _c, _d, _e, _f, _g;
    var policyID = _a.policyID, backTo = _a.backTo;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var assignCard = (0, useOnyx_1.default)(ONYXKEYS_1.default.ASSIGN_CARD, { canBeMissing: false })[0];
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { canBeMissing: false })[0];
    var countryByIp = (0, useOnyx_1.default)(ONYXKEYS_1.default.COUNTRY, { canBeMissing: false })[0];
    var _h = (0, useOnyx_1.default)(ONYXKEYS_1.default.CURRENCY_LIST, { canBeMissing: true })[0], currencyList = _h === void 0 ? {} : _h;
    var feed = (_b = assignCard === null || assignCard === void 0 ? void 0 : assignCard.data) === null || _b === void 0 ? void 0 : _b.bankName;
    var cardFeeds = (0, useCardFeeds_1.default)(policyID)[0];
    var data = assignCard === null || assignCard === void 0 ? void 0 : assignCard.data;
    var cardholderName = (_e = (_d = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)((_c = data === null || data === void 0 ? void 0 : data.email) !== null && _c !== void 0 ? _c : '')) === null || _d === void 0 ? void 0 : _d.displayName) !== null && _e !== void 0 ? _e : '';
    var currentFullScreenRoute = (0, useRootNavigationState_1.default)(function (state) { var _a; return (_a = state === null || state === void 0 ? void 0 : state.routes) === null || _a === void 0 ? void 0 : _a.findLast(function (route) { return (0, isNavigatorName_1.isFullScreenName)(route.name); }); });
    (0, react_1.useEffect)(function () {
        var _a;
        if (!(assignCard === null || assignCard === void 0 ? void 0 : assignCard.isAssigned)) {
            return;
        }
        var lastRoute = (_a = currentFullScreenRoute === null || currentFullScreenRoute === void 0 ? void 0 : currentFullScreenRoute.state) === null || _a === void 0 ? void 0 : _a.routes.at(-1);
        if (backTo !== null && backTo !== void 0 ? backTo : (lastRoute === null || lastRoute === void 0 ? void 0 : lastRoute.name) === SCREENS_1.default.WORKSPACE.COMPANY_CARDS) {
            Navigation_1.default.goBack(backTo);
        }
        else {
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_COMPANY_CARDS.getRoute(policyID), { forceReplace: true });
        }
        react_native_1.InteractionManager.runAfterInteractions(function () { return (0, CompanyCards_1.clearAssignCardStepAndData)(); });
    }, [assignCard, backTo, policyID, (_f = currentFullScreenRoute === null || currentFullScreenRoute === void 0 ? void 0 : currentFullScreenRoute.state) === null || _f === void 0 ? void 0 : _f.routes]);
    var submit = function () {
        var _a, _b;
        if (!policyID) {
            return;
        }
        var isFeedExpired = (0, CardUtils_1.isSelectedFeedExpired)(feed ? (_b = (_a = cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.settings) === null || _a === void 0 ? void 0 : _a.oAuthAccountDetails) === null || _b === void 0 ? void 0 : _b[feed] : undefined);
        var institutionId = !!(0, CardUtils_1.getPlaidInstitutionId)(feed);
        if (isFeedExpired) {
            if (institutionId) {
                var country = (0, CardUtils_1.getPlaidCountry)(policy === null || policy === void 0 ? void 0 : policy.outputCurrency, currencyList, countryByIp);
                (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({
                    data: {
                        selectedCountry: country,
                    },
                });
            }
            (0, CompanyCards_1.setAssignCardStepAndData)({ currentStep: institutionId ? CONST_1.default.COMPANY_CARD.STEP.PLAID_CONNECTION : CONST_1.default.COMPANY_CARD.STEP.BANK_CONNECTION });
            return;
        }
        (0, CompanyCards_1.assignWorkspaceCompanyCard)(policyID, data);
    };
    var editStep = function (step) {
        (0, CompanyCards_1.setAssignCardStepAndData)({ currentStep: step, isEditing: true });
    };
    var handleBackButtonPress = function () {
        (0, CompanyCards_1.setAssignCardStepAndData)({ currentStep: CONST_1.default.COMPANY_CARD.STEP.TRANSACTION_START_DATE });
    };
    return (<InteractiveStepWrapper_1.default wrapperID={ConfirmationStep.displayName} handleBackButtonPress={handleBackButtonPress} startStepIndex={3} stepNames={CONST_1.default.COMPANY_CARD.STEP_NAMES} headerTitle={translate('workspace.companyCards.assignCard')} headerSubtitle={cardholderName} enableEdgeToEdgeBottomSafeAreaPadding>
            <ScrollView_1.default style={styles.pt0} contentContainerStyle={styles.flexGrow1} addBottomSafeAreaPadding>
                <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mt3]}>{translate('workspace.companyCards.letsDoubleCheck')}</Text_1.default>
                <Text_1.default style={[styles.textSupporting, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.confirmationDescription')}</Text_1.default>
                <MenuItemWithTopDescription_1.default description={translate('workspace.companyCards.cardholder')} title={cardholderName} shouldShowRightIcon onPress={function () { return editStep(CONST_1.default.COMPANY_CARD.STEP.ASSIGNEE); }}/>
                <MenuItemWithTopDescription_1.default description={translate('workspace.companyCards.card')} title={(0, CardUtils_1.maskCardNumber)((_g = data === null || data === void 0 ? void 0 : data.cardNumber) !== null && _g !== void 0 ? _g : '', data === null || data === void 0 ? void 0 : data.bankName)} hintText={(0, CardUtils_1.lastFourNumbersFromCardName)(data === null || data === void 0 ? void 0 : data.cardNumber)} shouldShowRightIcon onPress={function () { return editStep(CONST_1.default.COMPANY_CARD.STEP.CARD); }}/>
                <MenuItemWithTopDescription_1.default description={translate('workspace.moreFeatures.companyCards.transactionStartDate')} title={(data === null || data === void 0 ? void 0 : data.dateOption) === CONST_1.default.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING ? translate('workspace.companyCards.fromTheBeginning') : data === null || data === void 0 ? void 0 : data.startDate} shouldShowRightIcon onPress={function () { return editStep(CONST_1.default.COMPANY_CARD.STEP.TRANSACTION_START_DATE); }}/>
                <MenuItemWithTopDescription_1.default description={translate('workspace.companyCards.cardName')} title={data === null || data === void 0 ? void 0 : data.cardName} shouldShowRightIcon onPress={function () { return editStep(CONST_1.default.COMPANY_CARD.STEP.CARD_NAME); }}/>
                <react_native_1.View style={[styles.mh5, styles.pb5, styles.mt3, styles.flexGrow1, styles.justifyContentEnd]}>
                    <OfflineWithFeedback_1.default shouldDisplayErrorAbove errors={assignCard === null || assignCard === void 0 ? void 0 : assignCard.errors} errorRowStyles={styles.mv2} canDismissError={false}>
                        <Button_1.default isDisabled={isOffline} success large isLoading={assignCard === null || assignCard === void 0 ? void 0 : assignCard.isAssigning} style={styles.w100} onPress={submit} testID={CONST_1.default.ASSIGN_CARD_BUTTON_TEST_ID} text={translate('workspace.companyCards.assignCard')}/>
                    </OfflineWithFeedback_1.default>
                </react_native_1.View>
            </ScrollView_1.default>
        </InteractiveStepWrapper_1.default>);
}
ConfirmationStep.displayName = 'ConfirmationStep';
exports.default = ConfirmationStep;
