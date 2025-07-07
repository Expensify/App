"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HTMLEngineUtils = require("@components/HTMLEngineProvider/htmlEngineUtils");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var ShowContextMenuContext_1 = require("@components/ShowContextMenuContext");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
function PreRenderer(_a) {
    var TDefaultRenderer = _a.TDefaultRenderer, onPressIn = _a.onPressIn, onPressOut = _a.onPressOut, onLongPress = _a.onLongPress, defaultRendererProps = __rest(_a, ["TDefaultRenderer", "onPressIn", "onPressOut", "onLongPress"]);
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isLast = defaultRendererProps.renderIndex === defaultRendererProps.renderLength - 1;
    var isChildOfTaskTitle = HTMLEngineUtils.isChildOfTaskTitle(defaultRendererProps.tnode);
    var isInsideTaskTitle = HTMLEngineUtils.isChildOfTaskTitle(defaultRendererProps.tnode);
    var fontSize = StyleUtils.getCodeFontSize(false, isInsideTaskTitle);
    if (isChildOfTaskTitle) {
        return (<TDefaultRenderer 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...defaultRendererProps} style={styles.taskTitleMenuItem}/>);
    }
    return (<react_native_1.View style={isLast ? styles.mt2 : styles.mv2}>
            <ShowContextMenuContext_1.ShowContextMenuContext.Consumer>
                {function (_a) {
            var onShowContextMenu = _a.onShowContextMenu, anchor = _a.anchor, report = _a.report, isReportArchived = _a.isReportArchived, action = _a.action, checkIfContextMenuActive = _a.checkIfContextMenuActive, isDisabled = _a.isDisabled, shouldDisplayContextMenu = _a.shouldDisplayContextMenu;
            return (<PressableWithoutFeedback_1.default onPress={onPressIn !== null && onPressIn !== void 0 ? onPressIn : (function () { })} onPressIn={onPressIn} onPressOut={onPressOut} onLongPress={function (event) {
                    onShowContextMenu(function () {
                        if (isDisabled || !shouldDisplayContextMenu) {
                            return;
                        }
                        return (0, ShowContextMenuContext_1.showContextMenuForReport)(event, anchor, report === null || report === void 0 ? void 0 : report.reportID, action, checkIfContextMenuActive, (0, ReportUtils_1.isArchivedNonExpenseReport)(report, isReportArchived));
                    });
                }} shouldUseHapticsOnLongPress role={CONST_1.default.ROLE.PRESENTATION} accessibilityLabel={translate('accessibilityHints.preStyledText')}>
                        <react_native_1.View>
                            <Text_1.default style={{ fontSize: fontSize }}>
                                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                                <TDefaultRenderer {...defaultRendererProps}/>
                            </Text_1.default>
                        </react_native_1.View>
                    </PressableWithoutFeedback_1.default>);
        }}
            </ShowContextMenuContext_1.ShowContextMenuContext.Consumer>
        </react_native_1.View>);
}
PreRenderer.displayName = 'PreRenderer';
exports.default = PreRenderer;
