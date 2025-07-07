"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var date_fns_1 = require("date-fns");
var react_1 = require("react");
var react_native_1 = require("react-native");
var ConfirmModal_1 = require("@components/ConfirmModal");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons_1 = require("@components/Icon/Expensicons");
var Expensicons = require("@components/Icon/Expensicons");
var ImageSVG_1 = require("@components/ImageSVG");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var PlaidCardFeedIcon_1 = require("@components/PlaidCardFeedIcon");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var useCardFeeds_1 = require("@hooks/useCardFeeds");
var useCardsList_1 = require("@hooks/useCardsList");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useTheme_1 = require("@hooks/useTheme");
var useThemeIllustrations_1 = require("@hooks/useThemeIllustrations");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardUtils_1 = require("@libs/CardUtils");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var SearchQueryUtils_1 = require("@libs/SearchQueryUtils");
var Navigation_1 = require("@navigation/Navigation");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var variables_1 = require("@styles/variables");
var CompanyCards_1 = require("@userActions/CompanyCards");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var utils_1 = require("./utils");
function WorkspaceCompanyCardDetailsPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    var route = _a.route;
    var _u = route.params, policyID = _u.policyID, cardID = _u.cardID, backTo = _u.backTo;
    var bank = decodeURIComponent(route.params.bank);
    var connectionSyncProgress = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS).concat(policyID), { canBeMissing: true })[0];
    var customCardNames = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES, { canBeMissing: true })[0];
    var policy = (0, usePolicy_1.default)(policyID);
    var workspaceAccountID = (_b = policy === null || policy === void 0 ? void 0 : policy.workspaceAccountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    var _v = (0, react_1.useState)(false), isUnassignModalVisible = _v[0], setIsUnassignModalVisible = _v[1];
    var _w = (0, useLocalize_1.default)(), translate = _w.translate, getLocalDateFromDatetime = _w.getLocalDateFromDatetime;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var illustrations = (0, useThemeIllustrations_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var accountingIntegrations = Object.values(CONST_1.default.POLICY.CONNECTIONS.NAME);
    var connectedIntegration = (_c = (0, PolicyUtils_1.getConnectedIntegration)(policy, accountingIntegrations)) !== null && _c !== void 0 ? _c : connectionSyncProgress === null || connectionSyncProgress === void 0 ? void 0 : connectionSyncProgress.connectionName;
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: false })[0];
    var _x = (0, useCardsList_1.default)(policyID, bank), allBankCards = _x[0], allBankCardsMetadata = _x[1];
    var card = allBankCards === null || allBankCards === void 0 ? void 0 : allBankCards[cardID];
    var cardBank = (_d = card === null || card === void 0 ? void 0 : card.bank) !== null && _d !== void 0 ? _d : '';
    var cardholder = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[(_e = card === null || card === void 0 ? void 0 : card.accountID) !== null && _e !== void 0 ? _e : CONST_1.default.DEFAULT_NUMBER_ID];
    var displayName = (0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(cardholder);
    var exportMenuItem = (0, utils_1.getExportMenuItem)(connectedIntegration, policyID, translate, policy, card);
    var cardFeeds = (0, useCardFeeds_1.default)(policyID)[0];
    var companyFeeds = (0, CardUtils_1.getCompanyFeeds)(cardFeeds);
    var domainOrWorkspaceAccountID = (0, CardUtils_1.getDomainOrWorkspaceAccountID)(workspaceAccountID, companyFeeds[bank]);
    var plaidUrl = (0, CardUtils_1.getPlaidInstitutionIconUrl)(bank);
    var unassignCard = function () {
        setIsUnassignModalVisible(false);
        if (card) {
            (0, CompanyCards_1.unassignWorkspaceCompanyCard)(domainOrWorkspaceAccountID, bank, card);
        }
        Navigation_1.default.goBack();
    };
    var updateCard = function () {
        (0, CompanyCards_1.updateWorkspaceCompanyCard)(domainOrWorkspaceAccountID, cardID, bank);
    };
    var lastScrape = (0, react_1.useMemo)(function () {
        if (!(card === null || card === void 0 ? void 0 : card.lastScrape)) {
            return '';
        }
        return (0, date_fns_1.format)(getLocalDateFromDatetime(card === null || card === void 0 ? void 0 : card.lastScrape), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING);
    }, [getLocalDateFromDatetime, card === null || card === void 0 ? void 0 : card.lastScrape]);
    if (!card && !(0, isLoadingOnyxValue_1.default)(allBankCardsMetadata)) {
        return <NotFoundPage_1.default />;
    }
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding testID={WorkspaceCompanyCardDetailsPage.displayName}>
                <HeaderWithBackButton_1.default title={translate('workspace.moreFeatures.companyCards.cardDetails')} onBackButtonPress={function () { return Navigation_1.default.goBack(backTo); }}/>
                <ScrollView_1.default addBottomSafeAreaPadding>
                    <react_native_1.View style={[styles.walletCard, styles.mb3]}>
                        {plaidUrl ? (<PlaidCardFeedIcon_1.default plaidUrl={plaidUrl} isLarge/>) : (<ImageSVG_1.default contentFit="contain" src={(0, CardUtils_1.getCardFeedIcon)(cardBank, illustrations)} pointerEvents="none" height={variables_1.default.cardPreviewHeight} width={variables_1.default.cardPreviewWidth}/>)}
                    </react_native_1.View>

                    <MenuItem_1.default label={translate('workspace.moreFeatures.companyCards.cardholder')} title={displayName} icon={(_f = cardholder === null || cardholder === void 0 ? void 0 : cardholder.avatar) !== null && _f !== void 0 ? _f : Expensicons_1.FallbackAvatar} iconType={CONST_1.default.ICON_TYPE_AVATAR} description={cardholder === null || cardholder === void 0 ? void 0 : cardholder.login} interactive={false}/>
                    <MenuItemWithTopDescription_1.default numberOfLinesTitle={3} description={translate('workspace.moreFeatures.companyCards.cardNumber')} title={(0, CardUtils_1.maskCardNumber)((_g = card === null || card === void 0 ? void 0 : card.cardName) !== null && _g !== void 0 ? _g : '', bank, true)} interactive={false} titleStyle={styles.walletCardNumber}/>
                    <OfflineWithFeedback_1.default pendingAction={(_j = (_h = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _h === void 0 ? void 0 : _h.pendingFields) === null || _j === void 0 ? void 0 : _j.cardTitle} errorRowStyles={[styles.ph5, styles.mb3]} errors={(0, ErrorUtils_1.getLatestErrorField)((_k = card === null || card === void 0 ? void 0 : card.nameValuePairs) !== null && _k !== void 0 ? _k : {}, 'cardTitle')} onClose={function () { return (0, CompanyCards_1.clearCompanyCardErrorField)(domainOrWorkspaceAccountID, cardID, bank, 'cardTitle'); }}>
                        <MenuItemWithTopDescription_1.default description={translate('workspace.moreFeatures.companyCards.cardName')} title={(_l = customCardNames === null || customCardNames === void 0 ? void 0 : customCardNames[cardID]) !== null && _l !== void 0 ? _l : (0, CardUtils_1.getDefaultCardName)(cardholder === null || cardholder === void 0 ? void 0 : cardholder.firstName)} shouldShowRightIcon brickRoadIndicator={((_o = (_m = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _m === void 0 ? void 0 : _m.errorFields) === null || _o === void 0 ? void 0 : _o.cardTitle) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_COMPANY_CARD_NAME.getRoute(policyID, cardID, bank)); }}/>
                    </OfflineWithFeedback_1.default>
                    {(exportMenuItem === null || exportMenuItem === void 0 ? void 0 : exportMenuItem.shouldShowMenuItem) ? (<OfflineWithFeedback_1.default pendingAction={(exportMenuItem === null || exportMenuItem === void 0 ? void 0 : exportMenuItem.exportType) ? (_q = (_p = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _p === void 0 ? void 0 : _p.pendingFields) === null || _q === void 0 ? void 0 : _q[exportMenuItem.exportType] : undefined} errorRowStyles={[styles.ph5, styles.mb3]} errors={exportMenuItem.exportType ? (0, ErrorUtils_1.getLatestErrorField)((_r = card === null || card === void 0 ? void 0 : card.nameValuePairs) !== null && _r !== void 0 ? _r : {}, exportMenuItem.exportType) : undefined} onClose={function () {
                if (!exportMenuItem.exportType) {
                    return;
                }
                (0, CompanyCards_1.clearCompanyCardErrorField)(domainOrWorkspaceAccountID, cardID, bank, exportMenuItem.exportType);
            }}>
                            <MenuItemWithTopDescription_1.default description={exportMenuItem.description} title={exportMenuItem.title} shouldShowRightIcon onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_COMPANY_CARD_EXPORT.getRoute(policyID, cardID, bank, Navigation_1.default.getActiveRoute())); }}/>
                        </OfflineWithFeedback_1.default>) : null}
                    <MenuItemWithTopDescription_1.default shouldShowRightComponent={card === null || card === void 0 ? void 0 : card.isLoadingLastUpdated} rightComponent={<react_native_1.ActivityIndicator style={[styles.popoverMenuIcon]} color={theme.spinner}/>} description={translate('workspace.moreFeatures.companyCards.lastUpdated')} title={(card === null || card === void 0 ? void 0 : card.isLoadingLastUpdated) ? translate('workspace.moreFeatures.companyCards.updating') : lastScrape} interactive={false}/>
                    <MenuItemWithTopDescription_1.default description={translate('workspace.moreFeatures.companyCards.transactionStartDate')} title={(card === null || card === void 0 ? void 0 : card.scrapeMinDate) ? (0, date_fns_1.format)((0, date_fns_1.parseISO)(card.scrapeMinDate), CONST_1.default.DATE.FNS_FORMAT_STRING) : ''} interactive={false}/>
                    <MenuItem_1.default icon={Expensicons.MoneySearch} title={translate('workspace.common.viewTransactions')} style={styles.mt3} onPress={function () {
            Navigation_1.default.navigate(ROUTES_1.default.SEARCH_ROOT.getRoute({
                query: (0, SearchQueryUtils_1.buildCannedSearchQuery)({ type: CONST_1.default.SEARCH.DATA_TYPES.EXPENSE, status: CONST_1.default.SEARCH.STATUS.EXPENSE.ALL, cardID: cardID }),
            }));
        }}/>
                    <OfflineWithFeedback_1.default pendingAction={(_s = card === null || card === void 0 ? void 0 : card.pendingFields) === null || _s === void 0 ? void 0 : _s.lastScrape} errorRowStyles={[styles.ph5, styles.mb3]} errors={(0, ErrorUtils_1.getLatestErrorField)(card !== null && card !== void 0 ? card : {}, 'lastScrape')} onClose={function () { return (0, CompanyCards_1.clearCompanyCardErrorField)(domainOrWorkspaceAccountID, cardID, bank, 'lastScrape', true); }}>
                        <MenuItem_1.default icon={Expensicons.Sync} disabled={isOffline || (card === null || card === void 0 ? void 0 : card.isLoadingLastUpdated)} title={translate('workspace.moreFeatures.companyCards.updateCard')} brickRoadIndicator={((_t = card === null || card === void 0 ? void 0 : card.errorFields) === null || _t === void 0 ? void 0 : _t.lastScrape) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} onPress={updateCard}/>
                    </OfflineWithFeedback_1.default>
                    <MenuItem_1.default icon={Expensicons.RemoveMembers} title={translate('workspace.moreFeatures.companyCards.unassignCard')} style={styles.mb1} onPress={function () { return setIsUnassignModalVisible(true); }}/>
                    <ConfirmModal_1.default title={translate('workspace.moreFeatures.companyCards.unassignCard')} isVisible={isUnassignModalVisible} onConfirm={unassignCard} onCancel={function () { return setIsUnassignModalVisible(false); }} shouldSetModalVisibility={false} prompt={translate('workspace.moreFeatures.companyCards.unassignCardDescription')} confirmText={translate('workspace.moreFeatures.companyCards.unassign')} cancelText={translate('common.cancel')} danger/>
                </ScrollView_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceCompanyCardDetailsPage.displayName = 'WorkspaceCompanyCardDetailsPage';
exports.default = WorkspaceCompanyCardDetailsPage;
