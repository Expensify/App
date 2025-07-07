"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Text_1 = require("@components/Text");
var UserDetailsTooltip_1 = require("@components/UserDetailsTooltip");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function DisplayNamesTooltipItem(_a) {
    var _b = _a.index, index = _b === void 0 ? 0 : _b, _c = _a.getTooltipShiftX, getTooltipShiftX = _c === void 0 ? function () { return 0; } : _c, _d = _a.accountID, accountID = _d === void 0 ? 0 : _d, _e = _a.avatar, avatar = _e === void 0 ? '' : _e, _f = _a.login, login = _f === void 0 ? '' : _f, _g = _a.displayName, displayName = _g === void 0 ? '' : _g, _h = _a.textStyles, textStyles = _h === void 0 ? [] : _h, _j = _a.childRefs, childRefs = _j === void 0 ? { current: [] } : _j;
    var styles = (0, useThemeStyles_1.default)();
    var tooltipIndexBridge = (0, react_1.useCallback)(function () { return getTooltipShiftX(index); }, [getTooltipShiftX, index]);
    return (<UserDetailsTooltip_1.default key={index} accountID={accountID} fallbackUserDetails={{
            avatar: avatar,
            login: login,
            displayName: displayName,
        }} shiftHorizontal={tooltipIndexBridge}>
            {/* We need to get the refs to all the names which will be used to correct the horizontal position of the tooltip */}
            <Text_1.default eslint-disable-next-line no-param-reassign ref={function (el) {
            var _a;
            if (!((_a = childRefs.current) === null || _a === void 0 ? void 0 : _a.at(index)) || !el) {
                return;
            }
            // eslint-disable-next-line react-compiler/react-compiler, no-param-reassign
            childRefs.current[index] = el;
        }} style={[textStyles, styles.pre]}>
                {displayName}
            </Text_1.default>
        </UserDetailsTooltip_1.default>);
}
DisplayNamesTooltipItem.displayName = 'DisplayNamesTooltipItem';
exports.default = DisplayNamesTooltipItem;
