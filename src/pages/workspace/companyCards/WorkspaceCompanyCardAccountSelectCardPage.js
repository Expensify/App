"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var Illustrations_1 = require("@components/Icon/Illustrations");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useCardFeeds_1 = require("@hooks/useCardFeeds");
var useCardsList_1 = require("@hooks/useCardsList");
var useLocalize_1 = require("@hooks/useLocalize");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWorkspaceAccountID_1 = require("@hooks/useWorkspaceAccountID");
var CompanyCards_1 = require("@libs/actions/CompanyCards");
var CardUtils_1 = require("@libs/CardUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var tokenizedSearch_1 = require("@libs/tokenizedSearch");
var Navigation_1 = require("@navigation/Navigation");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var utils_1 = require("./utils");
function WorkspaceCompanyCardAccountSelectCardPage(_a) {
    var _b, _c, _d, _e, _f;
    var route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var _g = route.params, policyID = _g.policyID, cardID = _g.cardID;
    var bank = decodeURIComponent(route.params.bank);
    var policy = (0, usePolicy_1.default)(policyID);
    var workspaceAccountID = (0, useWorkspaceAccountID_1.default)(policyID);
    var _h = (0, react_1.useState)(''), searchText = _h[0], setSearchText = _h[1];
    var allBankCards = (0, useCardsList_1.default)(policyID, bank)[0];
    var card = allBankCards === null || allBankCards === void 0 ? void 0 : allBankCards[cardID];
    var connectedIntegration = (_b = (0, PolicyUtils_1.getConnectedIntegration)(policy)) !== null && _b !== void 0 ? _b : CONST_1.default.POLICY.CONNECTIONS.NAME.QBO;
    var exportMenuItem = (0, utils_1.getExportMenuItem)(connectedIntegration, policyID, translate, policy, card, Navigation_1.default.getActiveRoute());
    var currentConnectionName = (0, PolicyUtils_1.getCurrentConnectionName)(policy);
    var shouldShowTextInput = ((_d = (_c = exportMenuItem === null || exportMenuItem === void 0 ? void 0 : exportMenuItem.data) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) >= CONST_1.default.STANDARD_LIST_ITEM_LIMIT;
    var defaultCard = translate('workspace.moreFeatures.companyCards.defaultCard');
    var isXeroConnection = connectedIntegration === CONST_1.default.POLICY.CONNECTIONS.NAME.XERO;
    var cardFeeds = (0, useCardFeeds_1.default)(policyID)[0];
    var companyFeeds = (0, CardUtils_1.getCompanyFeeds)(cardFeeds);
    var domainOrWorkspaceAccountID = (0, CardUtils_1.getDomainOrWorkspaceAccountID)(workspaceAccountID, companyFeeds[bank]);
    var searchedListOptions = (0, react_1.useMemo)(function () {
        var _a;
        return (0, tokenizedSearch_1.default)((_a = exportMenuItem === null || exportMenuItem === void 0 ? void 0 : exportMenuItem.data) !== null && _a !== void 0 ? _a : [], searchText, function (option) { return [option.value]; });
    }, [exportMenuItem === null || exportMenuItem === void 0 ? void 0 : exportMenuItem.data, searchText]);
    var listEmptyContent = (0, react_1.useMemo)(function () { return (<BlockingView_1.default icon={Illustrations_1.TeleScope} iconWidth={variables_1.default.emptyListIconWidth} iconHeight={variables_1.default.emptyListIconHeight} title={translate('workspace.moreFeatures.companyCards.noAccountsFound')} subtitle={currentConnectionName ? translate('workspace.moreFeatures.companyCards.noAccountsFoundDescription', { connection: currentConnectionName }) : undefined} containerStyle={styles.pb10}/>); }, [translate, currentConnectionName, styles]);
    var updateExportAccount = (0, react_1.useCallback)(function (_a) {
        var value = _a.value;
        if (!(exportMenuItem === null || exportMenuItem === void 0 ? void 0 : exportMenuItem.exportType)) {
            return;
        }
        var isDefaultCardSelected = value === defaultCard;
        var exportValue = isDefaultCardSelected ? CONST_1.default.COMPANY_CARDS.DEFAULT_EXPORT_TYPE : value;
        (0, CompanyCards_1.setCompanyCardExportAccount)(policyID, domainOrWorkspaceAccountID, cardID, exportMenuItem.exportType, exportValue, bank);
        Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(policyID, cardID, bank));
    }, [exportMenuItem === null || exportMenuItem === void 0 ? void 0 : exportMenuItem.exportType, domainOrWorkspaceAccountID, cardID, policyID, bank, defaultCard]);
    return (<SelectionScreen_1.default policyID={policyID} headerContent={<react_native_1.View style={[styles.mh5, styles.mb3]}>
                    {!!(exportMenuItem === null || exportMenuItem === void 0 ? void 0 : exportMenuItem.description) && (<Text_1.default style={[styles.textNormal]}>
                            {translate('workspace.moreFeatures.companyCards.integrationExportTitleFirstPart', { integration: exportMenuItem.description })}{' '}
                            {!!exportMenuItem && !isXeroConnection && (<>
                                    {translate('workspace.moreFeatures.companyCards.integrationExportTitlePart')}{' '}
                                    <TextLink_1.default style={styles.link} onPress={exportMenuItem.onExportPagePress}>
                                        {translate('workspace.moreFeatures.companyCards.integrationExportTitleLinkPart')}{' '}
                                    </TextLink_1.default>
                                    {translate('workspace.moreFeatures.companyCards.integrationExportTitleSecondPart')}
                                </>)}
                        </Text_1.default>)}
                </react_native_1.View>} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED} displayName={WorkspaceCompanyCardAccountSelectCardPage.displayName} sections={[{ data: searchedListOptions !== null && searchedListOptions !== void 0 ? searchedListOptions : [] }]} listItem={RadioListItem_1.default} textInputLabel={translate('common.search')} textInputValue={searchText} onChangeText={setSearchText} onSelectRow={updateExportAccount} initiallyFocusedOptionKey={(_f = (_e = exportMenuItem === null || exportMenuItem === void 0 ? void 0 : exportMenuItem.data) === null || _e === void 0 ? void 0 : _e.find(function (mode) { return mode.isSelected; })) === null || _f === void 0 ? void 0 : _f.keyForList} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(policyID, cardID, bank), { compareParams: false }); }} headerTitleAlreadyTranslated={exportMenuItem === null || exportMenuItem === void 0 ? void 0 : exportMenuItem.description} listEmptyContent={listEmptyContent} connectionName={connectedIntegration} shouldShowTextInput={shouldShowTextInput}/>);
}
WorkspaceCompanyCardAccountSelectCardPage.displayName = 'WorkspaceCompanyCardAccountSelectCardPage';
exports.default = WorkspaceCompanyCardAccountSelectCardPage;
