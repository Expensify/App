"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var expensify_card_svg_1 = require("@assets/images/expensify-card.svg");
var Badge_1 = require("@components/Badge");
var ConfirmModal_1 = require("@components/ConfirmModal");
var DecisionModal_1 = require("@components/DecisionModal");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons_1 = require("@components/Icon/Expensicons");
var Expensicons = require("@components/Icon/Expensicons");
var ImageSVG_1 = require("@components/ImageSVG");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var useDefaultFundID_1 = require("@hooks/useDefaultFundID");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardUtils_1 = require("@libs/CardUtils");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var SearchQueryUtils_1 = require("@libs/SearchQueryUtils");
var Navigation_1 = require("@navigation/Navigation");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var variables_1 = require("@styles/variables");
var Card_1 = require("@userActions/Card");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
function WorkspaceExpensifyCardDetailsPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    var route = _a.route;
    var _q = route.params, policyID = _q.policyID, cardID = _q.cardID, backTo = _q.backTo;
    var defaultFundID = (0, useDefaultFundID_1.default)(policyID);
    var _r = (0, react_1.useState)(false), isDeactivateModalVisible = _r[0], setIsDeactivateModalVisible = _r[1];
    var _s = (0, react_1.useState)(false), isOfflineModalVisible = _s[0], setIsOfflineModalVisible = _s[1];
    var translate = (0, useLocalize_1.default)().translate;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    var styles = (0, useThemeStyles_1.default)();
    var _t = (0, react_1.useState)(false), isDeleted = _t[0], setIsDeleted = _t[1];
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: false })[0];
    var _u = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(defaultFundID, "_").concat(CONST_1.default.EXPENSIFY_CARD.BANK), {
        selector: CardUtils_1.filterInactiveCards,
        canBeMissing: true,
    }), cardsList = _u[0], cardsListResult = _u[1];
    var isWorkspaceCardRhp = route.name === SCREENS_1.default.WORKSPACE.EXPENSIFY_CARD_DETAILS;
    var card = cardsList === null || cardsList === void 0 ? void 0 : cardsList[cardID];
    var cardholder = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[(_b = card === null || card === void 0 ? void 0 : card.accountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID];
    var isVirtual = !!((_c = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _c === void 0 ? void 0 : _c.isVirtual);
    var formattedAvailableSpendAmount = (0, CurrencyUtils_1.convertToDisplayString)(card === null || card === void 0 ? void 0 : card.availableSpend);
    var formattedLimit = (0, CurrencyUtils_1.convertToDisplayString)((_d = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _d === void 0 ? void 0 : _d.unapprovedExpenseLimit);
    var displayName = (0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(cardholder);
    var translationForLimitType = (0, CardUtils_1.getTranslationKeyForLimitType)((_e = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _e === void 0 ? void 0 : _e.limitType);
    var fetchCardDetails = (0, react_1.useCallback)(function () {
        (0, Card_1.openCardDetailsPage)(Number(cardID));
    }, [cardID]);
    (0, react_1.useEffect)(function () {
        if (!isDeleted) {
            return;
        }
        return function () {
            (0, Card_1.deactivateCard)(defaultFundID, card);
        };
    }, [isDeleted, defaultFundID, card]);
    var isOffline = (0, useNetwork_1.default)({ onReconnect: fetchCardDetails }).isOffline;
    (0, react_1.useEffect)(function () { return fetchCardDetails(); }, [fetchCardDetails]);
    var deactivateCard = function () {
        setIsDeleted(true);
        setIsDeactivateModalVisible(false);
        requestAnimationFrame(function () {
            Navigation_1.default.goBack();
        });
    };
    if (!card && !(0, isLoadingOnyxValue_1.default)(cardsListResult)) {
        return <NotFoundPage_1.default />;
    }
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding testID={WorkspaceExpensifyCardDetailsPage.displayName}>
                <HeaderWithBackButton_1.default title={translate('workspace.expensifyCard.cardDetails')} onBackButtonPress={function () { return Navigation_1.default.goBack(backTo); }}/>
                <ScrollView_1.default addBottomSafeAreaPadding>
                    <react_native_1.View style={[styles.walletCard, styles.mb3]}>
                        <ImageSVG_1.default contentFit="contain" src={expensify_card_svg_1.default} pointerEvents="none" height={variables_1.default.cardPreviewHeight} width={variables_1.default.cardPreviewWidth}/>
                        <Badge_1.default badgeStyles={styles.cardBadge} textStyles={styles.cardBadgeText} text={translate(isVirtual ? 'workspace.expensifyCard.virtual' : 'workspace.expensifyCard.physical')}/>
                    </react_native_1.View>

                    <MenuItem_1.default label={translate('workspace.card.issueNewCard.cardholder')} title={displayName} icon={(_f = cardholder === null || cardholder === void 0 ? void 0 : cardholder.avatar) !== null && _f !== void 0 ? _f : Expensicons_1.FallbackAvatar} iconType={CONST_1.default.ICON_TYPE_AVATAR} description={cardholder === null || cardholder === void 0 ? void 0 : cardholder.login} interactive={false}/>
                    <MenuItemWithTopDescription_1.default description={translate(isVirtual ? 'cardPage.virtualCardNumber' : 'cardPage.physicalCardNumber')} title={(0, CardUtils_1.maskCard)(card === null || card === void 0 ? void 0 : card.lastFourPAN)} interactive={false} titleStyle={styles.walletCardNumber}/>
                    <OfflineWithFeedback_1.default pendingAction={(_g = card === null || card === void 0 ? void 0 : card.pendingFields) === null || _g === void 0 ? void 0 : _g.availableSpend}>
                        <MenuItemWithTopDescription_1.default description={translate('cardPage.availableSpend')} title={formattedAvailableSpendAmount} interactive={false} titleStyle={styles.newKansasLarge}/>
                    </OfflineWithFeedback_1.default>
                    <OfflineWithFeedback_1.default pendingAction={(_j = (_h = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _h === void 0 ? void 0 : _h.pendingFields) === null || _j === void 0 ? void 0 : _j.unapprovedExpenseLimit}>
                        <MenuItemWithTopDescription_1.default description={translate('workspace.expensifyCard.cardLimit')} title={formattedLimit} shouldShowRightIcon onPress={function () {
            return Navigation_1.default.navigate(isWorkspaceCardRhp
                ? ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD_LIMIT.getRoute(policyID, cardID, Navigation_1.default.getActiveRoute())
                : ROUTES_1.default.EXPENSIFY_CARD_LIMIT.getRoute(policyID, cardID, Navigation_1.default.getActiveRoute()));
        }}/>
                    </OfflineWithFeedback_1.default>
                    <OfflineWithFeedback_1.default pendingAction={(_l = (_k = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _k === void 0 ? void 0 : _k.pendingFields) === null || _l === void 0 ? void 0 : _l.limitType}>
                        <MenuItemWithTopDescription_1.default description={translate('workspace.card.issueNewCard.limitType')} title={translationForLimitType ? translate(translationForLimitType) : ''} shouldShowRightIcon onPress={function () {
            return Navigation_1.default.navigate(isWorkspaceCardRhp
                ? ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD_LIMIT_TYPE.getRoute(policyID, cardID, Navigation_1.default.getActiveRoute())
                : ROUTES_1.default.EXPENSIFY_CARD_LIMIT_TYPE.getRoute(policyID, cardID, Navigation_1.default.getActiveRoute()));
        }}/>
                    </OfflineWithFeedback_1.default>
                    <OfflineWithFeedback_1.default pendingAction={(_o = (_m = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _m === void 0 ? void 0 : _m.pendingFields) === null || _o === void 0 ? void 0 : _o.cardTitle}>
                        <MenuItemWithTopDescription_1.default description={translate('workspace.card.issueNewCard.cardName')} title={(_p = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _p === void 0 ? void 0 : _p.cardTitle} shouldShowRightIcon onPress={function () {
            return Navigation_1.default.navigate(isWorkspaceCardRhp
                ? ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD_NAME.getRoute(policyID, cardID, Navigation_1.default.getActiveRoute())
                : ROUTES_1.default.EXPENSIFY_CARD_NAME.getRoute(policyID, cardID, Navigation_1.default.getActiveRoute()));
        }}/>
                    </OfflineWithFeedback_1.default>
                    <MenuItem_1.default icon={Expensicons.MoneySearch} title={translate('workspace.common.viewTransactions')} style={styles.mt3} onPress={function () {
            Navigation_1.default.navigate(ROUTES_1.default.SEARCH_ROOT.getRoute({
                query: (0, SearchQueryUtils_1.buildCannedSearchQuery)({
                    type: CONST_1.default.SEARCH.DATA_TYPES.EXPENSE,
                    status: CONST_1.default.SEARCH.STATUS.EXPENSE.ALL,
                    cardID: cardID,
                }),
            }));
        }}/>
                    <MenuItem_1.default icon={Expensicons.Trashcan} title={translate('workspace.expensifyCard.deactivate')} style={styles.mb1} onPress={function () { return (isOffline ? setIsOfflineModalVisible(true) : setIsDeactivateModalVisible(true)); }}/>
                    <ConfirmModal_1.default title={translate('workspace.card.deactivateCardModal.deactivateCard')} isVisible={isDeactivateModalVisible} onConfirm={deactivateCard} onCancel={function () { return setIsDeactivateModalVisible(false); }} shouldSetModalVisibility={false} prompt={translate('workspace.card.deactivateCardModal.deactivateConfirmation')} confirmText={translate('workspace.card.deactivateCardModal.deactivate')} cancelText={translate('common.cancel')} danger/>
                    <DecisionModal_1.default title={translate('common.youAppearToBeOffline')} prompt={translate('common.offlinePrompt')} isSmallScreenWidth={isSmallScreenWidth} onSecondOptionSubmit={function () { return setIsOfflineModalVisible(false); }} secondOptionText={translate('common.buttonConfirm')} isVisible={isOfflineModalVisible} onClose={function () { return setIsOfflineModalVisible(false); }}/>
                </ScrollView_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceExpensifyCardDetailsPage.displayName = 'WorkspaceExpensifyCardDetailsPage';
exports.default = WorkspaceExpensifyCardDetailsPage;
