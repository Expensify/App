"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var UserUtils = require("@libs/UserUtils");
var CONST_1 = require("@src/CONST");
var Avatar_1 = require("./Avatar");
var AvatarSkeleton_1 = require("./AvatarSkeleton");
var Expensicons = require("./Icon/Expensicons");
var Indicator_1 = require("./Indicator");
var Tooltip_1 = require("./Tooltip");
function AvatarWithIndicator(_a) {
    var source = _a.source, accountID = _a.accountID, _b = _a.tooltipText, tooltipText = _b === void 0 ? '' : _b, _c = _a.fallbackIcon, fallbackIcon = _c === void 0 ? Expensicons.FallbackAvatar : _c, _d = _a.isLoading, isLoading = _d === void 0 ? true : _d;
    var styles = (0, useThemeStyles_1.default)();
    return (<Tooltip_1.default text={tooltipText}>
            <react_native_1.View style={[styles.sidebarAvatar]}>
                {isLoading ? (<AvatarSkeleton_1.default />) : (<>
                        <Avatar_1.default size={CONST_1.default.AVATAR_SIZE.SMALL} source={UserUtils.getSmallSizeAvatar(source, accountID)} fallbackIcon={fallbackIcon} avatarID={accountID} type={CONST_1.default.ICON_TYPE_AVATAR}/>
                        <Indicator_1.default />
                    </>)}
            </react_native_1.View>
        </Tooltip_1.default>);
}
AvatarWithIndicator.displayName = 'AvatarWithIndicator';
exports.default = AvatarWithIndicator;
