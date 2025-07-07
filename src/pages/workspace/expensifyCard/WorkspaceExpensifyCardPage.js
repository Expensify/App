"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useDefaultFundID_1 = require("@hooks/useDefaultFundID");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardUtils_1 = require("@libs/CardUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var WorkspaceExpensifyCardListPage_1 = require("./WorkspaceExpensifyCardListPage");
var WorkspaceExpensifyCardPageEmptyState_1 = require("./WorkspaceExpensifyCardPageEmptyState");
function WorkspaceExpensifyCardPage(_a) {
    var _b;
    var route = _a.route;
    var policyID = route.params.policyID;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var defaultFundID = (0, useDefaultFundID_1.default)(policyID);
    var cardSettings = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS).concat(defaultFundID), { canBeMissing: true })[0];
    var cardsList = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(defaultFundID, "_").concat(CONST_1.default.EXPENSIFY_CARD.BANK), { selector: CardUtils_1.filterInactiveCards, canBeMissing: true })[0];
    var fetchExpensifyCards = (0, react_1.useCallback)(function () {
        (0, Policy_1.openPolicyExpensifyCardsPage)(policyID, defaultFundID);
    }, [policyID, defaultFundID]);
    var isOffline = (0, useNetwork_1.default)({ onReconnect: fetchExpensifyCards }).isOffline;
    (0, react_1.useEffect)(function () {
        fetchExpensifyCards();
    }, [fetchExpensifyCards]);
    var paymentBankAccountID = (_b = cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings.paymentBankAccountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    var isLoading = !isOffline && (!cardSettings || cardSettings.isLoading);
    var renderContent = function () {
        if (!!isLoading && !paymentBankAccountID) {
            return (<react_native_1.ActivityIndicator size={CONST_1.default.ACTIVITY_INDICATOR_SIZE.LARGE} style={styles.flex1} color={theme.spinner}/>);
        }
        if (paymentBankAccountID) {
            return (<WorkspaceExpensifyCardListPage_1.default cardsList={cardsList} fundID={defaultFundID} route={route}/>);
        }
        if (!paymentBankAccountID && !isLoading) {
            return <WorkspaceExpensifyCardPageEmptyState_1.default route={route}/>;
        }
    };
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={route.params.policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}>
            {renderContent()}
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceExpensifyCardPage.displayName = 'WorkspaceExpensifyCardPage';
exports.default = WorkspaceExpensifyCardPage;
