"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Pressable_1 = require("@components/Pressable");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ReportUtils_1 = require("@libs/ReportUtils");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
function ThreadDivider(_a) {
    var _b;
    var ancestor = _a.ancestor, _c = _a.isLinkDisabled, isLinkDisabled = _c === void 0 ? false : _c;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isInNarrowPaneModal = (0, useResponsiveLayout_1.default)().isInNarrowPaneModal;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    return (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.ml5, styles.mt3, styles.mb1, styles.userSelectNone]} dataSet={_b = {}, _b[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _b}>
            {isLinkDisabled ? (<>
                    <Icon_1.default src={Expensicons.Thread} fill={theme.icon} width={variables_1.default.iconSizeExtraSmall} height={variables_1.default.iconSizeExtraSmall}/>
                    <Text_1.default style={[styles.threadDividerText, styles.textSupporting, styles.ml1, styles.userSelectNone]}>{translate('threads.thread')}</Text_1.default>
                </>) : (<Pressable_1.PressableWithoutFeedback onPress={function () { return (0, ReportUtils_1.navigateToLinkedReportAction)(ancestor, isInNarrowPaneModal, (0, ReportUtils_1.canUserPerformWriteAction)(ancestor.report), isOffline); }} accessibilityLabel={translate('threads.thread')} role={CONST_1.default.ROLE.BUTTON} style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
                    <Icon_1.default src={Expensicons.Thread} fill={theme.link} width={variables_1.default.iconSizeExtraSmall} height={variables_1.default.iconSizeExtraSmall}/>
                    <Text_1.default style={[styles.threadDividerText, styles.link]}>{translate('threads.thread')}</Text_1.default>
                </Pressable_1.PressableWithoutFeedback>)}
            {!ancestor.shouldDisplayNewMarker && <react_native_1.View style={[styles.threadDividerLine]}/>}
        </react_native_1.View>);
}
ThreadDivider.displayName = 'ThreadDivider';
exports.default = ThreadDivider;
