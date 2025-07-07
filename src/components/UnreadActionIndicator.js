"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var Text_1 = require("./Text");
function UnreadActionIndicator(_a) {
    var _b;
    var reportActionID = _a.reportActionID, shouldHideThreadDividerLine = _a.shouldHideThreadDividerLine;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var containerStyle = shouldHideThreadDividerLine ? styles.topUnreadIndicatorContainer : styles.unreadIndicatorContainer;
    return (<react_native_1.View accessibilityLabel={translate('accessibilityHints.newMessageLineIndicator')} data-action-id={reportActionID} style={[containerStyle, styles.userSelectNone, styles.pointerEventsNone]} dataSet={_b = {}, _b[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _b}>
            <react_native_1.View style={styles.unreadIndicatorLine}/>
            <Text_1.default style={styles.unreadIndicatorText}>{translate('common.new')}</Text_1.default>
        </react_native_1.View>);
}
UnreadActionIndicator.displayName = 'UnreadActionIndicator';
exports.default = UnreadActionIndicator;
