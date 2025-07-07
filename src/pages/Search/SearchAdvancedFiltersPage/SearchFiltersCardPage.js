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
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var OnyxProvider_1 = require("@components/OnyxProvider");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SearchFilterPageFooterButtons_1 = require("@components/Search/SearchFilterPageFooterButtons");
var SelectionList_1 = require("@components/SelectionList");
var CardListItem_1 = require("@components/SelectionList/Search/CardListItem");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeIllustrations_1 = require("@hooks/useThemeIllustrations");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Search_1 = require("@libs/actions/Search");
var CardFeedUtils_1 = require("@libs/CardFeedUtils");
var Navigation_1 = require("@navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
function SearchFiltersCardPage() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var illustrations = (0, useThemeIllustrations_1.default)();
    var _a = (0, useOnyx_1.default)(ONYXKEYS_1.default.CARD_LIST, { canBeMissing: true }), userCardList = _a[0], userCardListMetadata = _a[1];
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST, { canBeMissing: true }), workspaceCardFeeds = _b[0], workspaceCardFeedsMetadata = _b[1];
    var _c = (0, useDebouncedState_1.default)(''), searchTerm = _c[0], debouncedSearchTerm = _c[1], setSearchTerm = _c[2];
    var _d = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.SEARCH_ADVANCED_FILTERS_FORM, { canBeMissing: true }), searchAdvancedFiltersForm = _d[0], searchAdvancedFiltersFormMetadata = _d[1];
    var personalDetails = (0, OnyxProvider_1.usePersonalDetails)();
    var _e = (0, react_1.useState)([]), selectedCards = _e[0], setSelectedCards = _e[1];
    (0, react_1.useEffect)(function () {
        var generatedCards = (0, CardFeedUtils_1.generateSelectedCards)(userCardList, workspaceCardFeeds, searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm.feed, searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm.cardID);
        setSelectedCards(generatedCards);
    }, [searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm.feed, searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm.cardID, workspaceCardFeeds, userCardList]);
    (0, react_1.useEffect)(function () {
        (0, Search_1.openSearchFiltersCardPage)();
    }, []);
    var individualCardsSectionData = (0, react_1.useMemo)(function () { return (0, CardFeedUtils_1.buildCardsData)(workspaceCardFeeds !== null && workspaceCardFeeds !== void 0 ? workspaceCardFeeds : {}, userCardList !== null && userCardList !== void 0 ? userCardList : {}, personalDetails !== null && personalDetails !== void 0 ? personalDetails : {}, selectedCards, illustrations, false); }, [workspaceCardFeeds, userCardList, personalDetails, selectedCards, illustrations]);
    var closedCardsSectionData = (0, react_1.useMemo)(function () { return (0, CardFeedUtils_1.buildCardsData)(workspaceCardFeeds !== null && workspaceCardFeeds !== void 0 ? workspaceCardFeeds : {}, userCardList !== null && userCardList !== void 0 ? userCardList : {}, personalDetails !== null && personalDetails !== void 0 ? personalDetails : {}, selectedCards, illustrations, true); }, [workspaceCardFeeds, userCardList, personalDetails, selectedCards, illustrations]);
    var domainFeedsData = (0, react_1.useMemo)(function () { return (0, CardFeedUtils_1.getDomainFeedData)(workspaceCardFeeds); }, [workspaceCardFeeds]);
    var cardFeedsSectionData = (0, react_1.useMemo)(function () { return (0, CardFeedUtils_1.buildCardFeedsData)(workspaceCardFeeds !== null && workspaceCardFeeds !== void 0 ? workspaceCardFeeds : CONST_1.default.EMPTY_OBJECT, domainFeedsData, selectedCards, translate, illustrations); }, [domainFeedsData, workspaceCardFeeds, selectedCards, translate, illustrations]);
    var shouldShowSearchInput = cardFeedsSectionData.selected.length + cardFeedsSectionData.unselected.length + individualCardsSectionData.selected.length + individualCardsSectionData.unselected.length >
        CONST_1.default.COMPANY_CARDS.CARD_LIST_THRESHOLD;
    var searchFunction = (0, react_1.useCallback)(function (item) {
        var _a, _b, _c;
        return !!((_a = item.text) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase())) ||
            !!((_b = item.lastFourPAN) === null || _b === void 0 ? void 0 : _b.toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase())) ||
            !!((_c = item.cardName) === null || _c === void 0 ? void 0 : _c.toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase())) ||
            (item.isVirtual && translate('workspace.expensifyCard.virtual').toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase()));
    }, [debouncedSearchTerm, translate]);
    var sections = (0, react_1.useMemo)(function () {
        if (searchAdvancedFiltersForm === undefined) {
            return [];
        }
        var newSections = [];
        var selectedItems = __spreadArray(__spreadArray(__spreadArray([], cardFeedsSectionData.selected, true), individualCardsSectionData.selected, true), closedCardsSectionData.selected, true);
        newSections.push({
            title: undefined,
            data: selectedItems.filter(searchFunction),
            shouldShow: selectedItems.length > 0,
        });
        newSections.push({
            title: translate('search.filters.card.cardFeeds'),
            data: cardFeedsSectionData.unselected.filter(searchFunction),
            shouldShow: cardFeedsSectionData.unselected.length > 0,
        });
        newSections.push({
            title: translate('search.filters.card.individualCards'),
            data: individualCardsSectionData.unselected.filter(searchFunction),
            shouldShow: individualCardsSectionData.unselected.length > 0,
        });
        newSections.push({
            title: translate('search.filters.card.closedCards'),
            data: closedCardsSectionData.unselected.filter(searchFunction),
            shouldShow: closedCardsSectionData.unselected.length > 0,
        });
        return newSections;
    }, [
        searchAdvancedFiltersForm,
        cardFeedsSectionData.selected,
        cardFeedsSectionData.unselected,
        individualCardsSectionData.selected,
        individualCardsSectionData.unselected,
        closedCardsSectionData.selected,
        closedCardsSectionData.unselected,
        searchFunction,
        translate,
    ]);
    var handleConfirmSelection = (0, react_1.useCallback)(function () {
        var feeds = cardFeedsSectionData.selected.map(function (feed) { return feed.cardFeedKey; });
        var cardsFromSelectedFeed = (0, CardFeedUtils_1.getSelectedCardsFromFeeds)(userCardList, workspaceCardFeeds, feeds);
        var IDs = selectedCards.filter(function (card) { return !cardsFromSelectedFeed.includes(card); });
        (0, Search_1.updateAdvancedFilters)({
            cardID: IDs,
            feed: feeds,
        });
        Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
    }, [userCardList, selectedCards, cardFeedsSectionData.selected, workspaceCardFeeds]);
    var updateNewCards = (0, react_1.useCallback)(function (item) {
        var _a;
        if (!item.keyForList) {
            return;
        }
        var isCardFeed = (item === null || item === void 0 ? void 0 : item.isCardFeed) && (item === null || item === void 0 ? void 0 : item.correspondingCards);
        if (item.isSelected) {
            var newCardsObject = selectedCards.filter(function (card) { var _a; return (isCardFeed ? !((_a = item.correspondingCards) === null || _a === void 0 ? void 0 : _a.includes(card)) : card !== item.keyForList); });
            setSelectedCards(newCardsObject);
        }
        else {
            var newCardsObject = isCardFeed ? __spreadArray(__spreadArray([], selectedCards, true), ((_a = item === null || item === void 0 ? void 0 : item.correspondingCards) !== null && _a !== void 0 ? _a : []), true) : __spreadArray(__spreadArray([], selectedCards, true), [item.keyForList], false);
            setSelectedCards(newCardsObject);
        }
    }, [selectedCards]);
    var headerMessage = debouncedSearchTerm.trim() && sections.every(function (section) { return !section.data.length; }) ? translate('common.noResultsFound') : '';
    var resetChanges = (0, react_1.useCallback)(function () {
        setSelectedCards([]);
    }, [setSelectedCards]);
    var footerContent = (0, react_1.useMemo)(function () { return (<SearchFilterPageFooterButtons_1.default applyChanges={handleConfirmSelection} resetChanges={resetChanges}/>); }, [resetChanges, handleConfirmSelection]);
    return (<ScreenWrapper_1.default testID={SearchFiltersCardPage.displayName} shouldShowOfflineIndicatorInWideScreen offlineIndicatorStyle={styles.mtAuto} shouldEnableMaxHeight>
            {function (_a) {
            var didScreenTransitionEnd = _a.didScreenTransitionEnd;
            return (<>
                    <HeaderWithBackButton_1.default title={translate('common.card')} onBackButtonPress={function () {
                    Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
                }}/>
                    <react_native_1.View style={[styles.flex1]}>
                        <SelectionList_1.default sections={sections} onSelectRow={updateNewCards} footerContent={footerContent} headerMessage={headerMessage} shouldStopPropagation shouldShowTooltips canSelectMultiple shouldPreventDefaultFocusOnSelectRow={false} shouldKeepFocusedItemAtTopOfViewableArea={false} ListItem={CardListItem_1.default} shouldShowTextInput={shouldShowSearchInput} textInputLabel={shouldShowSearchInput ? translate('common.search') : undefined} textInputValue={searchTerm} onChangeText={function (value) {
                    setSearchTerm(value);
                }} showLoadingPlaceholder={(0, isLoadingOnyxValue_1.default)(userCardListMetadata, workspaceCardFeedsMetadata, searchAdvancedFiltersFormMetadata) || !didScreenTransitionEnd}/>
                    </react_native_1.View>
                </>);
        }}
        </ScreenWrapper_1.default>);
}
SearchFiltersCardPage.displayName = 'SearchFiltersCardPage';
exports.default = SearchFiltersCardPage;
