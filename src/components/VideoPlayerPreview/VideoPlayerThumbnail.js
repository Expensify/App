"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var AttachmentDeletedIndicator_1 = require("@components/AttachmentDeletedIndicator");
var Icon_1 = require("@components/Icon");
var Expensicons_1 = require("@components/Icon/Expensicons");
var Image_1 = require("@components/Image");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var ShowContextMenuContext_1 = require("@components/ShowContextMenuContext");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ControlSelection_1 = require("@libs/ControlSelection");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var ReportUtils_1 = require("@libs/ReportUtils");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
function VideoPlayerThumbnail(_a) {
    var thumbnailUrl = _a.thumbnailUrl, onPress = _a.onPress, accessibilityLabel = _a.accessibilityLabel, isDeleted = _a.isDeleted;
    var styles = (0, useThemeStyles_1.default)();
    return (<react_native_1.View style={styles.flex1}>
            {!!thumbnailUrl && (<react_native_1.View style={[styles.flex1, { borderRadius: variables_1.default.componentBorderRadiusNormal }, styles.overflowHidden]}>
                    <Image_1.default source={{ uri: thumbnailUrl }} style={styles.flex1} 
        // The auth header is required except for static images on Cloudfront, which makes them fail to load
        isAuthTokenRequired={!CONST_1.default.CLOUDFRONT_DOMAIN_REGEX.test(thumbnailUrl)}/>
                </react_native_1.View>)}
            {!isDeleted ? (<ShowContextMenuContext_1.ShowContextMenuContext.Consumer>
                    {function (_a) {
                var anchor = _a.anchor, report = _a.report, isReportArchived = _a.isReportArchived, action = _a.action, checkIfContextMenuActive = _a.checkIfContextMenuActive, isDisabled = _a.isDisabled, onShowContextMenu = _a.onShowContextMenu, shouldDisplayContextMenu = _a.shouldDisplayContextMenu;
                return (<PressableWithoutFeedback_1.default style={[styles.videoThumbnailContainer]} accessibilityLabel={accessibilityLabel} accessibilityRole={CONST_1.default.ROLE.BUTTON} onPress={onPress} onPressIn={function () { return (0, DeviceCapabilities_1.canUseTouchScreen)() && ControlSelection_1.default.block(); }} onPressOut={function () { return ControlSelection_1.default.unblock(); }} onLongPress={function (event) {
                        if (isDisabled || !shouldDisplayContextMenu) {
                            return;
                        }
                        onShowContextMenu(function () {
                            (0, ShowContextMenuContext_1.showContextMenuForReport)(event, anchor, report === null || report === void 0 ? void 0 : report.reportID, action, checkIfContextMenuActive, (0, ReportUtils_1.isArchivedNonExpenseReport)(report, isReportArchived));
                        });
                    }} shouldUseHapticsOnLongPress>
                            <react_native_1.View style={[styles.videoThumbnailPlayButton]}>
                                <Icon_1.default src={Expensicons_1.Play} fill="white" width={variables_1.default.iconSizeXLarge} height={variables_1.default.iconSizeXLarge}/>
                            </react_native_1.View>
                        </PressableWithoutFeedback_1.default>);
            }}
                </ShowContextMenuContext_1.ShowContextMenuContext.Consumer>) : (<AttachmentDeletedIndicator_1.default containerStyles={{ borderRadius: variables_1.default.componentBorderRadiusNormal }}/>)}
        </react_native_1.View>);
}
VideoPlayerThumbnail.displayName = 'VideoPlayerThumbnail';
exports.default = VideoPlayerThumbnail;
