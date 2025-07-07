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
var expensify_card_svg_1 = require("@assets/images/expensify-card.svg");
var FormAlertWithSubmitButton_1 = require("@components/FormAlertWithSubmitButton");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Icon_1 = require("@components/Icon");
var PlaidCardFeedIcon_1 = require("@components/PlaidCardFeedIcon");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useCardFeeds_1 = require("@hooks/useCardFeeds");
var useCardsList_1 = require("@hooks/useCardsList");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeIllustrations_1 = require("@hooks/useThemeIllustrations");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardUtils_1 = require("@libs/CardUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var variables_1 = require("@styles/variables");
var Card_1 = require("@userActions/Card");
var CompanyCards_1 = require("@userActions/CompanyCards");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function WorkspaceMemberNewCardPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var route = _a.route, personalDetails = _a.personalDetails;
    var policyID = route.params.policyID;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = (0, PolicyUtils_1.getPolicy)(policyID);
    var workspaceAccountID = (_b = policy === null || policy === void 0 ? void 0 : policy.workspaceAccountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var illustrations = (0, useThemeIllustrations_1.default)();
    var cardFeeds = (0, useCardFeeds_1.default)(policyID)[0];
    var _m = (0, react_1.useState)(''), selectedFeed = _m[0], setSelectedFeed = _m[1];
    var _o = (0, react_1.useState)(false), shouldShowError = _o[0], setShouldShowError = _o[1];
    var cardSettings = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS).concat(workspaceAccountID), { canBeMissing: true })[0];
    var accountID = Number(route.params.accountID);
    var memberLogin = (_d = (_c = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID]) === null || _c === void 0 ? void 0 : _c.login) !== null && _d !== void 0 ? _d : '';
    var memberName = ((_e = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID]) === null || _e === void 0 ? void 0 : _e.firstName) ? (_f = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID]) === null || _f === void 0 ? void 0 : _f.firstName : (_g = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID]) === null || _g === void 0 ? void 0 : _g.login;
    var companyFeeds = (0, CardUtils_1.getCompanyFeeds)(cardFeeds, false, true);
    var isFeedExpired = (0, CardUtils_1.isSelectedFeedExpired)(selectedFeed ? (_j = (_h = cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.settings) === null || _h === void 0 ? void 0 : _h.oAuthAccountDetails) === null || _j === void 0 ? void 0 : _j[selectedFeed] : undefined);
    var domainOrWorkspaceAccountID = (0, CardUtils_1.getDomainOrWorkspaceAccountID)(workspaceAccountID, companyFeeds[selectedFeed]);
    var list = (0, useCardsList_1.default)(policyID, selectedFeed)[0];
    var filteredCardList = (0, CardUtils_1.getFilteredCardList)(list, (_l = (_k = cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.settings) === null || _k === void 0 ? void 0 : _k.oAuthAccountDetails) === null || _l === void 0 ? void 0 : _l[selectedFeed]);
    var shouldShowExpensifyCard = (0, CardUtils_1.isExpensifyCardFullySetUp)(policy, cardSettings);
    var handleSubmit = function () {
        if (!selectedFeed) {
            setShouldShowError(true);
            return;
        }
        if (selectedFeed === CONST_1.default.EXPENSIFY_CARD.NAME) {
            (0, Card_1.setIssueNewCardStepAndData)({
                step: CONST_1.default.EXPENSIFY_CARD.STEP.CARD_TYPE,
                data: {
                    assigneeEmail: memberLogin,
                },
                isEditing: false,
                policyID: policyID,
            });
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID, ROUTES_1.default.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID)));
        }
        else {
            var data = {
                email: memberLogin,
                bankName: selectedFeed,
                cardName: "".concat(memberName, "'s card"),
            };
            var currentStep = CONST_1.default.COMPANY_CARD.STEP.CARD;
            if ((0, CardUtils_1.hasOnlyOneCardToAssign)(filteredCardList)) {
                currentStep = CONST_1.default.COMPANY_CARD.STEP.TRANSACTION_START_DATE;
                data.cardNumber = Object.keys(filteredCardList).at(0);
                data.encryptedCardNumber = Object.values(filteredCardList).at(0);
            }
            if (isFeedExpired) {
                currentStep = CONST_1.default.COMPANY_CARD.STEP.BANK_CONNECTION;
            }
            (0, CompanyCards_1.setAssignCardStepAndData)({
                currentStep: currentStep,
                data: data,
                isEditing: false,
            });
            Navigation_1.default.setNavigationActionToMicrotaskQueue(function () {
                return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD.getRoute(policyID, selectedFeed, ROUTES_1.default.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID)));
            });
        }
    };
    var handleSelectFeed = function (feed) {
        setSelectedFeed(feed.value);
        var hasAllCardsData = (0, CardUtils_1.hasCardListObject)(workspaceAccountID, feed.value);
        if ((0, CardUtils_1.isCustomFeed)(feed.value) && !hasAllCardsData) {
            (0, CompanyCards_1.openAssignFeedCardPage)(policyID, feed.value, domainOrWorkspaceAccountID);
        }
        setShouldShowError(false);
    };
    var companyCardFeeds = Object.keys(companyFeeds).map(function (key) {
        var _a, _b, _c;
        var plaidUrl = (0, CardUtils_1.getPlaidInstitutionIconUrl)(key);
        return {
            value: key,
            text: (0, CardUtils_1.getCustomOrFormattedFeedName)(key, (_a = cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.settings) === null || _a === void 0 ? void 0 : _a.companyCardNicknames),
            keyForList: key,
            isDisabled: ((_b = companyFeeds[key]) === null || _b === void 0 ? void 0 : _b.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            pendingAction: (_c = companyFeeds[key]) === null || _c === void 0 ? void 0 : _c.pendingAction,
            isSelected: selectedFeed === key,
            leftElement: plaidUrl ? (<PlaidCardFeedIcon_1.default plaidUrl={plaidUrl} style={styles.mr3}/>) : (<Icon_1.default src={(0, CardUtils_1.getCardFeedIcon)(key, illustrations)} height={variables_1.default.cardIconHeight} width={variables_1.default.cardIconWidth} additionalStyles={[styles.mr3, styles.cardIcon]}/>),
        };
    });
    var feeds = shouldShowExpensifyCard
        ? __spreadArray(__spreadArray([], companyCardFeeds, true), [
            {
                value: CONST_1.default.EXPENSIFY_CARD.NAME,
                text: translate('workspace.common.expensifyCard'),
                keyForList: CONST_1.default.EXPENSIFY_CARD.NAME,
                isSelected: selectedFeed === CONST_1.default.EXPENSIFY_CARD.NAME,
                leftElement: (<Icon_1.default src={expensify_card_svg_1.default} width={variables_1.default.cardIconWidth} height={variables_1.default.cardIconHeight} additionalStyles={[styles.cardIcon, styles.mr3]}/>),
            },
        ], false) : companyCardFeeds;
    var goBack = function () { return Navigation_1.default.goBack(); };
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}>
            <ScreenWrapper_1.default testID={WorkspaceMemberNewCardPage.displayName} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('workspace.companyCards.selectCards')} onBackButtonPress={goBack}/>
                <SelectionList_1.default ListItem={RadioListItem_1.default} onSelectRow={handleSelectFeed} sections={[{ data: feeds }]} shouldUpdateFocusedIndex isAlternateTextMultilineSupported/>
                <FormAlertWithSubmitButton_1.default containerStyles={styles.p5} isAlertVisible={shouldShowError} onSubmit={handleSubmit} message={translate('common.error.pleaseSelectOne')} buttonText={translate('common.next')} isLoading={!!(cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.isLoading)}/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceMemberNewCardPage.displayName = 'WorkspaceMemberNewCardPage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(WorkspaceMemberNewCardPage);
