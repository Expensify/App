"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var Text_1 = require("@components/Text");
var useDefaultFundID_1 = require("@hooks/useDefaultFundID");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Card_1 = require("@libs/actions/Card");
var Navigation_1 = require("@navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function WorkspaceSettlementFrequencyPage(_a) {
    var _b, _c;
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = (_b = route.params) === null || _b === void 0 ? void 0 : _b.policyID;
    var defaultFundID = (0, useDefaultFundID_1.default)(policyID);
    var cardSettings = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS).concat(defaultFundID))[0];
    var shouldShowMonthlyOption = (_c = cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings.isMonthlySettlementAllowed) !== null && _c !== void 0 ? _c : false;
    var selectedFrequency = (cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings.monthlySettlementDate) ? CONST_1.default.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY : CONST_1.default.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY;
    var isSettlementFrequencyBlocked = !shouldShowMonthlyOption && selectedFrequency === CONST_1.default.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY;
    var data = (0, react_1.useMemo)(function () {
        var options = [];
        options.push({
            value: CONST_1.default.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY,
            text: translate('workspace.expensifyCard.frequency.daily'),
            keyForList: CONST_1.default.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY,
            isSelected: selectedFrequency === CONST_1.default.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY,
        });
        if (shouldShowMonthlyOption) {
            options.push({
                value: CONST_1.default.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY,
                text: translate('workspace.expensifyCard.frequency.monthly'),
                keyForList: CONST_1.default.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY,
                isSelected: selectedFrequency === CONST_1.default.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY,
            });
        }
        return options;
    }, [translate, shouldShowMonthlyOption, selectedFrequency]);
    var updateSettlementFrequency = function (value) {
        (0, Card_1.updateSettlementFrequency)(defaultFundID, value, cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings.monthlySettlementDate);
    };
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} shouldBeBlocked={isSettlementFrequencyBlocked} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}>
            <ScreenWrapper_1.default testID={WorkspaceSettlementFrequencyPage.displayName} enableEdgeToEdgeBottomSafeAreaPadding shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('workspace.expensifyCard.settlementFrequency')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD_SETTINGS.getRoute(policyID)); }}/>
                <Text_1.default style={[styles.mh5, styles.mv4]}>{translate('workspace.expensifyCard.settlementFrequencyDescription')}</Text_1.default>
                <SelectionList_1.default sections={[{ data: data }]} ListItem={RadioListItem_1.default} onSelectRow={function (_a) {
        var value = _a.value;
        return updateSettlementFrequency(value);
    }} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={selectedFrequency} addBottomSafeAreaPadding/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceSettlementFrequencyPage.displayName = 'WorkspaceSettlementFrequencyPage';
exports.default = WorkspaceSettlementFrequencyPage;
