"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var SearchUIUtils_1 = require("@libs/SearchUIUtils");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ActionCell_1 = require("./ActionCell");
var UserInfoCellsWithArrow_1 = require("./UserInfoCellsWithArrow");
function UserInfoAndActionButtonRow(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    var item = _a.item, handleActionButtonPress = _a.handleActionButtonPress, shouldShowUserInfo = _a.shouldShowUserInfo;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var hasFromSender = !!(item === null || item === void 0 ? void 0 : item.from) && !!((_b = item === null || item === void 0 ? void 0 : item.from) === null || _b === void 0 ? void 0 : _b.accountID) && !!((_c = item === null || item === void 0 ? void 0 : item.from) === null || _c === void 0 ? void 0 : _c.displayName);
    var hasToRecipient = !!(item === null || item === void 0 ? void 0 : item.to) && !!((_d = item === null || item === void 0 ? void 0 : item.to) === null || _d === void 0 ? void 0 : _d.accountID) && !!((_e = item === null || item === void 0 ? void 0 : item.to) === null || _e === void 0 ? void 0 : _e.displayName);
    var participantFromDisplayName = (_j = (_g = (_f = item === null || item === void 0 ? void 0 : item.from) === null || _f === void 0 ? void 0 : _f.displayName) !== null && _g !== void 0 ? _g : (_h = item === null || item === void 0 ? void 0 : item.from) === null || _h === void 0 ? void 0 : _h.login) !== null && _j !== void 0 ? _j : translate('common.hidden');
    var participantToDisplayName = (_o = (_l = (_k = item === null || item === void 0 ? void 0 : item.to) === null || _k === void 0 ? void 0 : _k.displayName) !== null && _l !== void 0 ? _l : (_m = item === null || item === void 0 ? void 0 : item.to) === null || _m === void 0 ? void 0 : _m.login) !== null && _o !== void 0 ? _o : translate('common.hidden');
    var shouldShowToRecipient = hasFromSender && hasToRecipient && !!((_p = item === null || item === void 0 ? void 0 : item.to) === null || _p === void 0 ? void 0 : _p.accountID) && !!(0, SearchUIUtils_1.isCorrectSearchUserName)(participantToDisplayName);
    return (<react_native_1.View style={[styles.pt0, styles.flexRow, styles.alignItemsCenter, shouldShowUserInfo ? styles.justifyContentBetween : styles.justifyContentEnd, styles.gap2, styles.ph3]}>
            <react_native_1.View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                {shouldShowUserInfo && (<UserInfoCellsWithArrow_1.default shouldShowToRecipient={shouldShowToRecipient} participantFrom={item === null || item === void 0 ? void 0 : item.from} participantFromDisplayName={participantFromDisplayName} participantToDisplayName={participantToDisplayName} participantTo={item === null || item === void 0 ? void 0 : item.to} avatarSize={CONST_1.default.AVATAR_SIZE.MID_SUBSCRIPT} infoCellsTextStyle={__assign(__assign({}, styles.textMicroBold), { lineHeight: 14 })} infoCellsAvatarStyle={styles.pr1} fromRecipientStyle={!shouldShowToRecipient ? styles.mw100 : {}}/>)}
            </react_native_1.View>
            <react_native_1.View style={[{ width: variables_1.default.w80 }, styles.alignItemsEnd]}>
                <ActionCell_1.default action={item.action} goToItem={handleActionButtonPress} isSelected={item.isSelected} isLoading={item.isActionLoading}/>
            </react_native_1.View>
        </react_native_1.View>);
}
exports.default = UserInfoAndActionButtonRow;
