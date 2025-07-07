"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormAlertWithSubmitButton_1 = require("@components/FormAlertWithSubmitButton");
var Icon_1 = require("@components/Icon");
var Illustrations_1 = require("@components/Icon/Illustrations");
var InteractiveStepSubHeader_1 = require("@components/InteractiveStepSubHeader");
var InteractiveStepWrapper_1 = require("@components/InteractiveStepWrapper");
var PlaidCardFeedIcon_1 = require("@components/PlaidCardFeedIcon");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useBottomSafeSafeAreaPaddingStyle_1 = require("@hooks/useBottomSafeSafeAreaPaddingStyle");
var useCardFeeds_1 = require("@hooks/useCardFeeds");
var useCardsList_1 = require("@hooks/useCardsList");
var useEnvironment_1 = require("@hooks/useEnvironment");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeIllustrations_1 = require("@hooks/useThemeIllustrations");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CompanyCards_1 = require("@libs/actions/CompanyCards");
var CardUtils_1 = require("@libs/CardUtils");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var tokenizedSearch_1 = require("@libs/tokenizedSearch");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function CardSelectionStep(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var feed = _a.feed, policyID = _a.policyID;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var illustrations = (0, useThemeIllustrations_1.default)();
    var environmentURL = (0, useEnvironment_1.default)().environmentURL;
    var _l = (0, react_1.useState)(''), searchText = _l[0], setSearchText = _l[1];
    var assignCard = (0, useOnyx_1.default)(ONYXKEYS_1.default.ASSIGN_CARD, { canBeMissing: false })[0];
    var list = (0, useCardsList_1.default)(policyID, feed)[0];
    var workspaceCardFeeds = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST, { canBeMissing: false })[0];
    var cardFeeds = (0, useCardFeeds_1.default)(policyID)[0];
    var plaidUrl = (0, CardUtils_1.getPlaidInstitutionIconUrl)(feed);
    var formattedFeedName = (0, CardUtils_1.getCustomOrFormattedFeedName)(feed, (_b = cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.settings) === null || _b === void 0 ? void 0 : _b.companyCardNicknames);
    var isEditing = assignCard === null || assignCard === void 0 ? void 0 : assignCard.isEditing;
    var assigneeDisplayName = (_f = (_e = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)((_d = (_c = assignCard === null || assignCard === void 0 ? void 0 : assignCard.data) === null || _c === void 0 ? void 0 : _c.email) !== null && _d !== void 0 ? _d : '')) === null || _e === void 0 ? void 0 : _e.displayName) !== null && _f !== void 0 ? _f : '';
    var filteredCardList = (0, CardUtils_1.getFilteredCardList)(list, (_h = (_g = cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.settings) === null || _g === void 0 ? void 0 : _g.oAuthAccountDetails) === null || _h === void 0 ? void 0 : _h[feed], workspaceCardFeeds);
    var _m = (0, react_1.useState)((_k = (_j = assignCard === null || assignCard === void 0 ? void 0 : assignCard.data) === null || _j === void 0 ? void 0 : _j.encryptedCardNumber) !== null && _k !== void 0 ? _k : ''), cardSelected = _m[0], setCardSelected = _m[1];
    var _o = (0, react_1.useState)(false), shouldShowError = _o[0], setShouldShowError = _o[1];
    var handleBackButtonPress = function () {
        if (isEditing) {
            (0, CompanyCards_1.setAssignCardStepAndData)({
                currentStep: CONST_1.default.COMPANY_CARD.STEP.CONFIRMATION,
                isEditing: false,
            });
            return;
        }
        (0, CompanyCards_1.setAssignCardStepAndData)({ currentStep: CONST_1.default.COMPANY_CARD.STEP.ASSIGNEE });
    };
    var handleSelectCard = function (cardNumber) {
        setCardSelected(cardNumber);
        setShouldShowError(false);
    };
    var submit = function () {
        var _a, _b;
        if (!cardSelected) {
            setShouldShowError(true);
            return;
        }
        var cardNumber = (_b = (_a = Object.entries(filteredCardList)
            .find(function (_a) {
            var encryptedCardNumber = _a[1];
            return encryptedCardNumber === cardSelected;
        })) === null || _a === void 0 ? void 0 : _a.at(0)) !== null && _b !== void 0 ? _b : '';
        (0, CompanyCards_1.setAssignCardStepAndData)({
            currentStep: isEditing ? CONST_1.default.COMPANY_CARD.STEP.CONFIRMATION : CONST_1.default.COMPANY_CARD.STEP.TRANSACTION_START_DATE,
            data: { encryptedCardNumber: cardSelected, cardNumber: cardNumber },
            isEditing: false,
        });
    };
    var cardListOptions = Object.entries(filteredCardList).map(function (_a) {
        var cardNumber = _a[0], encryptedCardNumber = _a[1];
        return ({
            keyForList: encryptedCardNumber,
            value: encryptedCardNumber,
            text: (0, CardUtils_1.maskCardNumber)(cardNumber, feed),
            alternateText: (0, CardUtils_1.lastFourNumbersFromCardName)(cardNumber),
            isSelected: cardSelected === encryptedCardNumber,
            leftElement: plaidUrl ? (<PlaidCardFeedIcon_1.default plaidUrl={plaidUrl} style={styles.mr3}/>) : (<Icon_1.default src={(0, CardUtils_1.getCardFeedIcon)(feed, illustrations)} height={variables_1.default.cardIconHeight} width={variables_1.default.iconSizeExtraLarge} additionalStyles={[styles.mr3, styles.cardIcon]}/>),
        });
    });
    var searchedListOptions = (0, react_1.useMemo)(function () {
        return (0, tokenizedSearch_1.default)(cardListOptions, searchText, function (option) { return [option.text]; });
    }, [searchText, cardListOptions]);
    var safeAreaPaddingBottomStyle = (0, useBottomSafeSafeAreaPaddingStyle_1.default)();
    return (<InteractiveStepWrapper_1.default wrapperID={CardSelectionStep.displayName} handleBackButtonPress={handleBackButtonPress} headerTitle={translate('workspace.companyCards.assignCard')} headerSubtitle={assigneeDisplayName} enableEdgeToEdgeBottomSafeAreaPadding>
            {!cardListOptions.length ? (<react_native_1.View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter, styles.ph5, styles.mb9, safeAreaPaddingBottomStyle]}>
                    <Icon_1.default src={Illustrations_1.BrokenMagnifyingGlass} width={116} height={168}/>
                    <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.mt3]}>{translate('workspace.companyCards.noActiveCards')}</Text_1.default>
                    <Text_1.default style={[styles.textSupporting, styles.ph5, styles.mv3, styles.textAlignCenter]}>
                        {translate('workspace.companyCards.somethingMightBeBroken')}{' '}
                        <TextLink_1.default href={"".concat(environmentURL, "/").concat(ROUTES_1.default.CONCIERGE)} style={styles.link}>
                            {translate('workspace.companyCards.contactConcierge')}
                        </TextLink_1.default>
                        .
                    </Text_1.default>
                </react_native_1.View>) : (<SelectionList_1.default sections={[{ data: searchedListOptions }]} headerMessage={searchedListOptions.length ? undefined : translate('common.noResultsFound')} shouldShowTextInput={cardListOptions.length > CONST_1.default.COMPANY_CARDS.CARD_LIST_THRESHOLD} textInputLabel={translate('common.search')} textInputValue={searchText} onChangeText={setSearchText} ListItem={RadioListItem_1.default} onSelectRow={function (_a) {
            var value = _a.value;
            return handleSelectCard(value);
        }} initiallyFocusedOptionKey={cardSelected} listHeaderContent={<react_native_1.View>
                            <react_native_1.View style={[styles.ph5, styles.mb5, styles.mt3, { height: CONST_1.default.BANK_ACCOUNT.STEPS_HEADER_HEIGHT }]}>
                                <InteractiveStepSubHeader_1.default startStepIndex={1} stepNames={CONST_1.default.COMPANY_CARD.STEP_NAMES}/>
                            </react_native_1.View>
                            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mt3]}>{translate('workspace.companyCards.chooseCard')}</Text_1.default>
                            <Text_1.default style={[styles.textSupporting, styles.ph5, styles.mv3]}>
                                {translate('workspace.companyCards.chooseCardFor', {
                    assignee: assigneeDisplayName,
                    feed: plaidUrl && formattedFeedName ? formattedFeedName : (0, CardUtils_1.getBankName)(feed),
                })}
                            </Text_1.default>
                        </react_native_1.View>} shouldShowTextInputAfterHeader shouldShowHeaderMessageAfterHeader addBottomSafeAreaPadding shouldShowListEmptyContent={false} shouldScrollToFocusedIndex={false} shouldUpdateFocusedIndex footerContent={<FormAlertWithSubmitButton_1.default buttonText={translate(isEditing ? 'common.confirm' : 'common.next')} onSubmit={submit} isAlertVisible={shouldShowError} containerStyles={[!shouldShowError && styles.mt5]} message={translate('common.error.pleaseSelectOne')}/>}/>)}
        </InteractiveStepWrapper_1.default>);
}
CardSelectionStep.displayName = 'CardSelectionStep';
exports.default = CardSelectionStep;
