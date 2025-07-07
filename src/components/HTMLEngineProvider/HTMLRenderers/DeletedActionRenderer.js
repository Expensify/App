"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_render_html_1 = require("react-native-render-html");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Text_1 = require("@components/Text");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
function DeletedActionRenderer(_a) {
    var tnode = _a.tnode;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var htmlAttribs = tnode.attributes;
    var reversedTransactionValue = htmlAttribs[CONST_1.default.REVERSED_TRANSACTION_ATTRIBUTE];
    var hiddenMessageValue = htmlAttribs[CONST_1.default.HIDDEN_MESSAGE_ATTRIBUTE];
    var getIcon = function () {
        if (reversedTransactionValue === 'true') {
            return Expensicons.ArrowsLeftRight;
        }
        if (hiddenMessageValue === 'true') {
            return Expensicons.EyeDisabled;
        }
        return Expensicons.Trashcan;
    };
    return (<react_native_1.View style={[styles.p4, styles.mt1, styles.appBG, styles.border, { borderColor: theme.border }, styles.flexRow, styles.justifyContentCenter, styles.alignItemsCenter, styles.gap2]}>
            <Icon_1.default width={variables_1.default.iconSizeMedium} height={variables_1.default.iconSizeMedium} fill={theme.icon} src={getIcon()}/>
            <react_native_render_html_1.TNodeChildrenRenderer tnode={tnode} renderChild={function (props) {
            var _a, _b;
            var firstChild = (_b = (_a = props === null || props === void 0 ? void 0 : props.childTnode) === null || _a === void 0 ? void 0 : _a.children) === null || _b === void 0 ? void 0 : _b.at(0);
            var data = firstChild && 'data' in firstChild ? firstChild.data : null;
            if (typeof data === 'string') {
                return (<Text_1.default key={data} style={(styles.textLabelSupporting, styles.textStrong)}>
                                {data}
                            </Text_1.default>);
            }
            return props.childElement;
        }}/>
        </react_native_1.View>);
}
DeletedActionRenderer.displayName = 'DeletedActionRenderer';
exports.default = DeletedActionRenderer;
