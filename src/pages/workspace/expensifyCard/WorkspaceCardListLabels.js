"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWorkspaceAccountID_1 = require("@hooks/useWorkspaceAccountID");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var WorkspaceCardsListLabel_1 = require("./WorkspaceCardsListLabel");
function WorkspaceCardListLabels(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var policyID = _a.policyID, cardSettings = _a.cardSettings;
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _l = (0, useResponsiveLayout_1.default)(), isMediumScreenWidth = _l.isMediumScreenWidth, isSmallScreenWidth = _l.isSmallScreenWidth;
    var styles = (0, useThemeStyles_1.default)();
    var workspaceAccountID = (0, useWorkspaceAccountID_1.default)(policyID);
    var cardManualBilling = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.PRIVATE_EXPENSIFY_CARD_MANUAL_BILLING).concat(workspaceAccountID), { canBeMissing: true })[0];
    var shouldShowSettlementButtonOrDate = !!(cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings.isMonthlySettlementAllowed) || cardManualBilling;
    var isLessThanMediumScreen = isMediumScreenWidth || isSmallScreenWidth;
    if (!isLessThanMediumScreen) {
        return (<react_native_1.View style={[styles.flexRow, styles.mt5, styles.mh5, styles.pr4]}>
                <WorkspaceCardsListLabel_1.default type={CONST_1.default.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE} value={(_b = cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings[CONST_1.default.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE]) !== null && _b !== void 0 ? _b : 0}/>
                <WorkspaceCardsListLabel_1.default type={CONST_1.default.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT} value={(_c = cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings[CONST_1.default.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT]) !== null && _c !== void 0 ? _c : 0}/>
                <WorkspaceCardsListLabel_1.default type={CONST_1.default.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK} value={(_d = cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings[CONST_1.default.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK]) !== null && _d !== void 0 ? _d : 0}/>
            </react_native_1.View>);
    }
    return shouldShowSettlementButtonOrDate ? (<react_native_1.View style={[styles.flexColumn, styles.mt5, styles.mh5, styles.pr4]}>
            <WorkspaceCardsListLabel_1.default type={CONST_1.default.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE} value={(_e = cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings[CONST_1.default.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE]) !== null && _e !== void 0 ? _e : 0}/>
            <react_native_1.View style={[styles.flexRow, !isLessThanMediumScreen ? styles.flex2 : styles.mt5]}>
                <WorkspaceCardsListLabel_1.default type={CONST_1.default.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT} value={(_f = cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings[CONST_1.default.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT]) !== null && _f !== void 0 ? _f : 0}/>
                <WorkspaceCardsListLabel_1.default type={CONST_1.default.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK} value={(_g = cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings[CONST_1.default.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK]) !== null && _g !== void 0 ? _g : 0}/>
            </react_native_1.View>
        </react_native_1.View>) : (<react_native_1.View style={[styles.flexColumn, styles.mt5, styles.mh5, styles.pr4]}>
            <react_native_1.View style={[styles.flexRow, isLessThanMediumScreen && styles.mb5]}>
                <WorkspaceCardsListLabel_1.default type={CONST_1.default.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE} value={(_h = cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings[CONST_1.default.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE]) !== null && _h !== void 0 ? _h : 0}/>
                <WorkspaceCardsListLabel_1.default type={CONST_1.default.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT} value={(_j = cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings[CONST_1.default.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT]) !== null && _j !== void 0 ? _j : 0}/>
            </react_native_1.View>
            <WorkspaceCardsListLabel_1.default type={CONST_1.default.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK} value={(_k = cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings[CONST_1.default.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK]) !== null && _k !== void 0 ? _k : 0}/>
        </react_native_1.View>);
}
WorkspaceCardListLabels.displayName = 'WorkspaceCardListLabels';
exports.default = WorkspaceCardListLabels;
