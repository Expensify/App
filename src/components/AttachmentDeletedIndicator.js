"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useNetwork_1 = require("@hooks/useNetwork");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
function AttachmentDeletedIndicator(_a) {
    var containerStyles = _a.containerStyles;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    if (!isOffline) {
        return null;
    }
    return (<>
            <react_native_1.View style={[
            styles.pAbsolute,
            styles.alignItemsCenter,
            styles.justifyContentCenter,
            styles.highlightBG,
            styles.deletedIndicatorOverlay,
            styles.deletedAttachmentIndicator,
            containerStyles,
        ]}/>
            <react_native_1.View style={[styles.pAbsolute, styles.deletedAttachmentIndicator, styles.alignItemsCenter, styles.justifyContentCenter, containerStyles]}>
                <Icon_1.default fill={theme.icon} src={Expensicons.Trashcan} width={variables_1.default.iconSizeSuperLarge} height={variables_1.default.iconSizeSuperLarge}/>
            </react_native_1.View>
        </>);
}
AttachmentDeletedIndicator.displayName = 'AttachmentDeletedIndicator';
exports.default = AttachmentDeletedIndicator;
