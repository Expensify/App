"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
var HelpDiagnosticData_1 = require("./HelpComponents/HelpDiagnosticData");
var HelpExpandable_1 = require("./HelpComponents/HelpExpandable");
var helpContentMap_1 = require("./HelpContent/helpContentMap");
function getHelpContent(styles, route, isProduction, expandedIndex, setExpandedIndex) {
    var _a;
    var routeParts = route.split('/');
    var helpContentComponents = [];
    var activeHelpContent = helpContentMap_1.default;
    var isExactMatch = true;
    for (var _i = 0, routeParts_1 = routeParts; _i < routeParts_1.length; _i++) {
        var part = routeParts_1[_i];
        if ((_a = activeHelpContent === null || activeHelpContent === void 0 ? void 0 : activeHelpContent.children) === null || _a === void 0 ? void 0 : _a[part]) {
            activeHelpContent = activeHelpContent.children[part];
            if (activeHelpContent.content) {
                helpContentComponents.push(activeHelpContent.content);
            }
        }
        else {
            if (helpContentComponents.length === 0) {
                // eslint-disable-next-line react/no-unescaped-entities
                helpContentComponents.push(function () { return <Text_1.default style={styles.textHeadlineH1}>We couldn't find any help content for this route.</Text_1.default>; });
            }
            isExactMatch = false;
            break;
        }
    }
    var content = helpContentComponents
        .reverse()
        .slice(0, expandedIndex + 2)
        .map(function (HelpContentNode, index) {
        return (
        // eslint-disable-next-line react/no-array-index-key
        <react_1.default.Fragment key={"help-content-".concat(index)}>
                    {index > 0 && <react_native_1.View style={[styles.sectionDividerLine, styles.mv5]}/>}
                    <HelpExpandable_1.default styles={styles} isExpanded={index <= expandedIndex} setIsExpanded={function () { return setExpandedIndex(index); }}>
                        <HelpContentNode styles={styles}/>
                    </HelpExpandable_1.default>
                </react_1.default.Fragment>);
    });
    if (isProduction) {
        return content;
    }
    return (<HelpDiagnosticData_1.default key={"help-diagnostic-data-".concat(route)} styles={styles} route={route} isExactMatch={isExactMatch}>
            {content}
        </HelpDiagnosticData_1.default>);
}
exports.default = getHelpContent;
