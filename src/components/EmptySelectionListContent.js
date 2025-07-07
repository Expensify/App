"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var BlockingView_1 = require("./BlockingViews/BlockingView");
var Illustrations = require("./Icon/Illustrations");
var ScrollView_1 = require("./ScrollView");
var Text_1 = require("./Text");
var CONTENT_TYPES = [CONST_1.default.IOU.TYPE.CREATE, CONST_1.default.IOU.TYPE.SUBMIT];
function isContentType(contentType) {
    return CONTENT_TYPES.includes(contentType);
}
function EmptySelectionListContent(_a) {
    var contentType = _a.contentType;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    if (!isContentType(contentType)) {
        return null;
    }
    var translationKeyContentType = CONST_1.default.IOU.TYPE.CREATE;
    var EmptySubtitle = <Text_1.default style={[styles.textAlignCenter]}>{translate("emptyList.".concat(translationKeyContentType, ".subtitleText"))}</Text_1.default>;
    return (<ScrollView_1.default contentContainerStyle={[styles.flexGrow1]}>
            <react_native_1.View style={[styles.flex1, styles.overflowHidden, styles.minHeight65]}>
                <BlockingView_1.default icon={Illustrations.ToddWithPhones} iconWidth={variables_1.default.emptySelectionListIconWidth} iconHeight={variables_1.default.emptySelectionListIconHeight} title={translate("emptyList.".concat(translationKeyContentType, ".title"))} shouldShowLink={false} CustomSubtitle={EmptySubtitle} containerStyle={[styles.mb8, styles.ph15]}/>
            </react_native_1.View>
        </ScrollView_1.default>);
}
EmptySelectionListContent.displayName = 'EmptySelectionListContent';
exports.default = EmptySelectionListContent;
