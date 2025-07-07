"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Avatar_1 = require("@components/Avatar");
var Text_1 = require("@components/Text");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var PersonalDetailsUtils = require("@libs/PersonalDetailsUtils");
var UserUtils_1 = require("@libs/UserUtils");
var CONST_1 = require("@src/CONST");
function WorkspaceCompanyCardsListRow(_a) {
    var _b;
    var cardholder = _a.cardholder, name = _a.name, cardNumber = _a.cardNumber;
    var styles = (0, useThemeStyles_1.default)();
    var cardholderName = (0, react_1.useMemo)(function () { return PersonalDetailsUtils.getDisplayNameOrDefault(cardholder); }, [cardholder]);
    return (<react_native_1.View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.br3, styles.p4]}>
            <react_native_1.View style={[styles.flexRow, styles.gap3, styles.alignItemsCenter, styles.flex3]}>
                <Avatar_1.default source={(_b = cardholder === null || cardholder === void 0 ? void 0 : cardholder.avatar) !== null && _b !== void 0 ? _b : (0, UserUtils_1.getDefaultAvatarURL)(cardholder === null || cardholder === void 0 ? void 0 : cardholder.accountID)} avatarID={cardholder === null || cardholder === void 0 ? void 0 : cardholder.accountID} type={CONST_1.default.ICON_TYPE_AVATAR} size={CONST_1.default.AVATAR_SIZE.DEFAULT}/>
                <react_native_1.View style={[styles.flex1, styles.pr2]}>
                    <Text_1.default numberOfLines={1} style={[styles.optionDisplayName, styles.textStrong, styles.pre]}>
                        {cardholderName}
                    </Text_1.default>
                    <Text_1.default numberOfLines={1} style={[styles.textLabelSupporting, styles.lh16]}>
                        {name}
                    </Text_1.default>
                </react_native_1.View>
            </react_native_1.View>
            <react_native_1.View style={[styles.flex1, styles.alignItemsEnd]}>
                <Text_1.default numberOfLines={1} style={[styles.textLabelSupporting, styles.lh16]}>
                    {cardNumber}
                </Text_1.default>
            </react_native_1.View>
        </react_native_1.View>);
}
WorkspaceCompanyCardsListRow.displayName = 'WorkspaceCompanyCardsListRow';
exports.default = WorkspaceCompanyCardsListRow;
