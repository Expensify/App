"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Avatar_1 = require("@components/Avatar");
var Expensicons_1 = require("@components/Icon/Expensicons");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CurrencyUtils = require("@libs/CurrencyUtils");
var PersonalDetailsUtils = require("@libs/PersonalDetailsUtils");
var CONST_1 = require("@src/CONST");
function WorkspaceCardListRow(_a) {
    var _b;
    var limit = _a.limit, cardholder = _a.cardholder, lastFourPAN = _a.lastFourPAN, name = _a.name, currency = _a.currency, isVirtual = _a.isVirtual;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var cardholderName = (0, react_1.useMemo)(function () { return PersonalDetailsUtils.getDisplayNameOrDefault(cardholder); }, [cardholder]);
    var cardType = isVirtual ? translate('workspace.expensifyCard.virtual') : translate('workspace.expensifyCard.physical');
    return (<react_native_1.View style={[styles.flexRow, styles.gap3, styles.br3, styles.p4]}>
            <react_native_1.View style={[styles.flexRow, styles.flex4, styles.gap3, styles.alignItemsCenter]}>
                <Avatar_1.default source={(_b = cardholder === null || cardholder === void 0 ? void 0 : cardholder.avatar) !== null && _b !== void 0 ? _b : Expensicons_1.FallbackAvatar} avatarID={cardholder === null || cardholder === void 0 ? void 0 : cardholder.accountID} type={CONST_1.default.ICON_TYPE_AVATAR} size={CONST_1.default.AVATAR_SIZE.DEFAULT}/>
                <react_native_1.View style={[styles.flex1, styles.h100]}>
                    <Text_1.default numberOfLines={1} style={[styles.optionDisplayName, styles.textStrong, styles.pre]}>
                        {cardholderName}
                    </Text_1.default>
                    <Text_1.default numberOfLines={1} style={[styles.textLabelSupporting, styles.lh16]}>
                        {name}
                    </Text_1.default>
                </react_native_1.View>
            </react_native_1.View>
            {!shouldUseNarrowLayout && (<react_native_1.View style={[styles.flexRow, styles.gap2, styles.flex1, styles.alignItemsCenter, styles.justifyContentStart]}>
                    <Text_1.default numberOfLines={1} style={[styles.textNormalThemeText, styles.lh16]}>
                        {cardType}
                    </Text_1.default>
                </react_native_1.View>)}
            <react_native_1.View style={[
            styles.flexRow,
            styles.gap2,
            shouldUseNarrowLayout ? styles.flex2 : styles.flex1,
            shouldUseNarrowLayout ? styles.alignItemsStart : styles.alignItemsCenter,
            shouldUseNarrowLayout ? styles.justifyContentCenter : styles.justifyContentStart,
        ]}>
                <Text_1.default numberOfLines={1} style={[styles.textNormalThemeText]}>
                    {lastFourPAN}
                </Text_1.default>
            </react_native_1.View>
            <react_native_1.View style={[
            !shouldUseNarrowLayout ? styles.flexRow : styles.flexColumn,
            shouldUseNarrowLayout ? styles.flex3 : styles.flex1,
            !shouldUseNarrowLayout && styles.gap2,
            !shouldUseNarrowLayout ? styles.alignItemsCenter : styles.alignItemsEnd,
            shouldUseNarrowLayout ? styles.justifyContentStart : styles.justifyContentEnd,
        ]}>
                <Text_1.default numberOfLines={1} style={[styles.textNormalThemeText]}>
                    {CurrencyUtils.convertToShortDisplayString(limit, currency)}
                </Text_1.default>
                {shouldUseNarrowLayout && (<Text_1.default numberOfLines={1} style={[styles.textLabelSupporting, styles.lh16]}>
                        {cardType}
                    </Text_1.default>)}
            </react_native_1.View>
        </react_native_1.View>);
}
WorkspaceCardListRow.displayName = 'WorkspaceCardListRow';
exports.default = WorkspaceCardListRow;
