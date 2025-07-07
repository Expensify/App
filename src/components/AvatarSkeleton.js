"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_svg_1 = require("react-native-svg");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var CONST_1 = require("@src/CONST");
var SkeletonViewContentLoader_1 = require("./SkeletonViewContentLoader");
function AvatarSkeleton(_a) {
    var _b = _a.size, size = _b === void 0 ? CONST_1.default.AVATAR_SIZE.SMALL : _b;
    var theme = (0, useTheme_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var avatarSize = StyleUtils.getAvatarSize(size);
    var skeletonCircleRadius = avatarSize / 2;
    return (<SkeletonViewContentLoader_1.default animate height={avatarSize} width={avatarSize} backgroundColor={theme.skeletonLHNIn} foregroundColor={theme.skeletonLHNOut}>
            <react_native_svg_1.Circle cx={skeletonCircleRadius} cy={skeletonCircleRadius} r={skeletonCircleRadius}/>
        </SkeletonViewContentLoader_1.default>);
}
AvatarSkeleton.displayName = 'AvatarSkeleton';
exports.default = AvatarSkeleton;
