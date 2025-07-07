"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ProfileAvatarWithIndicator_1 = require("./ProfileAvatarWithIndicator");
function AvatarWithOptionalStatus(_a) {
    var _b = _a.emojiStatus, emojiStatus = _b === void 0 ? '' : _b, _c = _a.isSelected, isSelected = _c === void 0 ? false : _c, containerStyle = _a.containerStyle;
    var styles = (0, useThemeStyles_1.default)();
    return (<react_native_1.View style={[styles.sidebarStatusAvatarContainer, containerStyle]}>
            <ProfileAvatarWithIndicator_1.default isSelected={isSelected}/>
            <react_native_1.View style={styles.sidebarStatusAvatar}>
                <react_native_1.View>
                    <Text_1.default style={styles.emojiStatusLHN} numberOfLines={1}>
                        {emojiStatus}
                    </Text_1.default>
                </react_native_1.View>
            </react_native_1.View>
        </react_native_1.View>);
}
AvatarWithOptionalStatus.displayName = 'AvatarWithOptionalStatus';
exports.default = AvatarWithOptionalStatus;
