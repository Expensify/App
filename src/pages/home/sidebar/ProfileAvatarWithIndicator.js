"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var AvatarWithIndicator_1 = require("@components/AvatarWithIndicator");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function ProfileAvatarWithIndicator(_a) {
    var _b;
    var _c = _a.isSelected, isSelected = _c === void 0 ? false : _c, containerStyles = _a.containerStyles;
    var styles = (0, useThemeStyles_1.default)();
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var _d = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_APP)[0], isLoading = _d === void 0 ? true : _d;
    return (<OfflineWithFeedback_1.default pendingAction={(_b = currentUserPersonalDetails.pendingFields) === null || _b === void 0 ? void 0 : _b.avatar} style={containerStyles}>
            <react_native_1.View style={[styles.pRelative]}>
                <react_native_1.View style={[isSelected && styles.selectedAvatarBorder, styles.pAbsolute]}/>
                <AvatarWithIndicator_1.default source={currentUserPersonalDetails.avatar} accountID={currentUserPersonalDetails.accountID} fallbackIcon={currentUserPersonalDetails.fallbackIcon} isLoading={!!(isLoading && !currentUserPersonalDetails.avatar)}/>
            </react_native_1.View>
        </OfflineWithFeedback_1.default>);
}
ProfileAvatarWithIndicator.displayName = 'ProfileAvatarWithIndicator';
exports.default = ProfileAvatarWithIndicator;
