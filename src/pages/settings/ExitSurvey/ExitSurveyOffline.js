"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Illustrations_1 = require("@components/Icon/Illustrations");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
function ExitSurveyOffline() {
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    return (<react_native_1.View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
            <Icon_1.default width={variables_1.default.modalTopIconWidth} height={variables_1.default.modalTopIconHeight} src={Illustrations_1.ToddBehindCloud}/>
            <Text_1.default style={[styles.headerAnonymousFooter, styles.textAlignCenter]}>{translate('exitSurvey.offlineTitle')}</Text_1.default>
            <Text_1.default style={[styles.mt2, styles.textAlignCenter]}>{translate('exitSurvey.offline')}</Text_1.default>
        </react_native_1.View>);
}
ExitSurveyOffline.displayName = 'ExitSurveyOffline';
exports.default = (0, react_1.memo)(ExitSurveyOffline);
