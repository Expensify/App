"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable react/no-array-index-key */
var react_1 = require("react");
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ReportActionUtils = require("@libs/ReportActionsUtils");
function ExportIntegration(_a) {
    var action = _a.action;
    var styles = (0, useThemeStyles_1.default)();
    var fragments = ReportActionUtils.getExportIntegrationActionFragments(action);
    return (<react_native_1.View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.flexWrap]}>
            {fragments.map(function (fragment, index) {
            if (!fragment.url) {
                return (<Text_1.default key={index} style={[styles.chatItemMessage, styles.colorMuted]}>
                            {fragment.text}{' '}
                        </Text_1.default>);
            }
            return (<TextLink_1.default key={index} href={fragment.url}>
                        {fragment.text}{' '}
                    </TextLink_1.default>);
        })}
        </react_native_1.View>);
}
ExportIntegration.displayName = 'ExportIntegration';
exports.default = ExportIntegration;
