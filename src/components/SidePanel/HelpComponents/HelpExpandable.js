"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
function HelpExpandable(_a) {
    var children = _a.children, styles = _a.styles, containerStyle = _a.containerStyle, isExpanded = _a.isExpanded, setIsExpanded = _a.setIsExpanded;
    return (<react_native_1.View style={containerStyle}>
            {isExpanded ? (children) : (<Text_1.default style={styles.link} onPress={setIsExpanded}>
                    Show more
                </Text_1.default>)}
        </react_native_1.View>);
}
HelpExpandable.displayName = 'ExpandableHelp';
exports.default = HelpExpandable;
