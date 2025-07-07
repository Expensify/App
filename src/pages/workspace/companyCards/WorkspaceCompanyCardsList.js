"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var Pressable_1 = require("@components/Pressable");
var SearchBar_1 = require("@components/SearchBar");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useSearchResults_1 = require("@hooks/useSearchResults");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardUtils_1 = require("@libs/CardUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var WorkspaceCompanyCardsFeedAddedEmptyPage_1 = require("./WorkspaceCompanyCardsFeedAddedEmptyPage");
var WorkspaceCompanyCardsListRow_1 = require("./WorkspaceCompanyCardsListRow");
function WorkspaceCompanyCardsList(_a) {
    var cardsList = _a.cardsList, policyID = _a.policyID, handleAssignCard = _a.handleAssignCard, isDisabledAssignCardButton = _a.isDisabledAssignCardButton, shouldShowGBDisclaimer = _a.shouldShowGBDisclaimer;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: false })[0];
    var customCardNames = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES, { canBeMissing: true })[0];
    var policy = (0, usePolicy_1.default)(policyID);
    var allCards = (0, react_1.useMemo)(function () {
        var policyMembersAccountIDs = Object.values((0, PolicyUtils_1.getMemberAccountIDsForWorkspace)(policy === null || policy === void 0 ? void 0 : policy.employeeList));
        return (0, CardUtils_1.getCardsByCardholderName)(cardsList, policyMembersAccountIDs);
    }, [cardsList, policy === null || policy === void 0 ? void 0 : policy.employeeList]);
    var filterCard = (0, react_1.useCallback)(function (card, searchInput) { return (0, CardUtils_1.filterCardsByPersonalDetails)(card, searchInput, personalDetails); }, [personalDetails]);
    var sortCards = (0, react_1.useCallback)(function (cards) { return (0, CardUtils_1.sortCardsByCardholderName)(cards, personalDetails); }, [personalDetails]);
    var _b = (0, useSearchResults_1.default)(allCards, filterCard, sortCards), inputValue = _b[0], setInputValue = _b[1], filteredSortedCards = _b[2];
    var renderItem = (0, react_1.useCallback)(function (_a) {
        var _b, _c, _d, _e, _f, _g;
        var item = _a.item, index = _a.index;
        var cardID = Object.keys(cardsList !== null && cardsList !== void 0 ? cardsList : {}).find(function (id) { return (cardsList === null || cardsList === void 0 ? void 0 : cardsList[id].cardID) === item.cardID; });
        var isCardDeleted = item.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        return (<OfflineWithFeedback_1.default key={"".concat((_b = item.nameValuePairs) === null || _b === void 0 ? void 0 : _b.cardTitle, "_").concat(index)} errorRowStyles={styles.ph5} errors={item.errors} pendingAction={item.pendingAction}>
                    <Pressable_1.PressableWithFeedback role={CONST_1.default.ROLE.BUTTON} style={[styles.mh5, styles.br3, styles.mb3, styles.highlightBG]} accessibilityLabel="row" hoverStyle={styles.hoveredComponentBG} disabled={isCardDeleted} onPress={function () {
                if (!cardID || !(item === null || item === void 0 ? void 0 : item.accountID)) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(policyID, cardID, item.bank));
            }}>
                        <WorkspaceCompanyCardsListRow_1.default cardholder={personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[(_c = item.accountID) !== null && _c !== void 0 ? _c : CONST_1.default.DEFAULT_NUMBER_ID]} cardNumber={(_d = item.lastFourPAN) !== null && _d !== void 0 ? _d : ''} name={(_e = customCardNames === null || customCardNames === void 0 ? void 0 : customCardNames[item.cardID]) !== null && _e !== void 0 ? _e : (0, CardUtils_1.getDefaultCardName)((_g = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[(_f = item.accountID) !== null && _f !== void 0 ? _f : CONST_1.default.DEFAULT_NUMBER_ID]) === null || _g === void 0 ? void 0 : _g.firstName)}/>
                    </Pressable_1.PressableWithFeedback>
                </OfflineWithFeedback_1.default>);
    }, [cardsList, customCardNames, personalDetails, policyID, styles]);
    var isSearchEmpty = filteredSortedCards.length === 0 && inputValue.length > 0;
    var renderListHeader = (<>
            {allCards.length > CONST_1.default.SEARCH_ITEM_LIMIT && (<SearchBar_1.default label={translate('workspace.companyCards.findCard')} inputValue={inputValue} onChangeText={setInputValue} shouldShowEmptyState={isSearchEmpty} style={[styles.mt5]}/>)}
            {!isSearchEmpty && (<react_native_1.View style={[styles.flexRow, styles.appBG, styles.justifyContentBetween, styles.mh5, styles.gap5, styles.p4]}>
                    <Text_1.default numberOfLines={1} style={[styles.textMicroSupporting, styles.lh16]}>
                        {translate('common.name')}
                    </Text_1.default>
                    <Text_1.default numberOfLines={1} style={[styles.textMicroSupporting, styles.lh16]}>
                        {translate('workspace.expensifyCard.lastFour')}
                    </Text_1.default>
                </react_native_1.View>)}
        </>);
    if (allCards.length === 0) {
        return (<WorkspaceCompanyCardsFeedAddedEmptyPage_1.default shouldShowGBDisclaimer={shouldShowGBDisclaimer} handleAssignCard={handleAssignCard} isDisabledAssignCardButton={isDisabledAssignCardButton}/>);
    }
    return (<react_native_1.FlatList contentContainerStyle={styles.flexGrow1} data={filteredSortedCards} renderItem={renderItem} ListHeaderComponent={renderListHeader} keyboardShouldPersistTaps="handled"/>);
}
exports.default = WorkspaceCompanyCardsList;
