"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Expensicons_1 = require("@components/Icon/Expensicons");
var OptionRow_1 = require("@components/OptionRow");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var HeaderReactionList_1 = require("./HeaderReactionList");
var keyExtractor = function (item, index) { return "".concat(item.login, "+").concat(index); };
var getItemLayout = function (data, index) { return ({
    index: index,
    length: variables_1.default.listItemHeightNormal,
    offset: variables_1.default.listItemHeightNormal * index,
}); };
function BaseReactionList(_a) {
    var _b = _a.hasUserReacted, hasUserReacted = _b === void 0 ? false : _b, users = _a.users, _c = _a.isVisible, isVisible = _c === void 0 ? false : _c, emojiCodes = _a.emojiCodes, emojiCount = _a.emojiCount, emojiName = _a.emojiName, onClose = _a.onClose;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var _d = (0, useThemeStyles_1.default)(), hoveredComponentBG = _d.hoveredComponentBG, reactionListContainer = _d.reactionListContainer, reactionListContainerFixedWidth = _d.reactionListContainerFixedWidth, pv2 = _d.pv2;
    if (!isVisible) {
        return null;
    }
    /**
     * Given an emoji item object, render a component based on its type.
     * Items with the code "SPACER" return nothing and are used to fill rows up to 8
     * so that the sticky headers function properly
     *
     */
    var renderItem = function (_a) {
        var _b, _c, _d, _e, _f;
        var item = _a.item;
        return (<OptionRow_1.default boldStyle style={{ maxWidth: variables_1.default.mobileResponsiveWidthBreakpoint }} hoverStyle={hoveredComponentBG} onSelectRow={function () {
                onClose === null || onClose === void 0 ? void 0 : onClose();
                Navigation_1.default.setNavigationActionToMicrotaskQueue(function () {
                    Navigation_1.default.navigate(ROUTES_1.default.PROFILE.getRoute(item.accountID));
                });
            }} option={{
                reportID: String(item.accountID),
                text: expensify_common_1.Str.removeSMSDomain((_b = item.displayName) !== null && _b !== void 0 ? _b : ''),
                alternateText: expensify_common_1.Str.removeSMSDomain((_c = item.login) !== null && _c !== void 0 ? _c : ''),
                participantsList: [item],
                icons: [
                    {
                        id: item.accountID,
                        source: (_d = item.avatar) !== null && _d !== void 0 ? _d : Expensicons_1.FallbackAvatar,
                        name: (_e = item.login) !== null && _e !== void 0 ? _e : '',
                        type: CONST_1.default.ICON_TYPE_AVATAR,
                    },
                ],
                keyForList: (_f = item.login) !== null && _f !== void 0 ? _f : String(item.accountID),
            }}/>);
    };
    return (<>
            <HeaderReactionList_1.default emojiName={emojiName} emojiCodes={emojiCodes} emojiCount={emojiCount} hasUserReacted={hasUserReacted}/>
            <react_native_1.FlatList data={users} renderItem={renderItem} keyExtractor={keyExtractor} getItemLayout={getItemLayout} contentContainerStyle={pv2} style={[reactionListContainer, !shouldUseNarrowLayout && reactionListContainerFixedWidth]}/>
        </>);
}
BaseReactionList.displayName = 'BaseReactionList';
exports.default = BaseReactionList;
