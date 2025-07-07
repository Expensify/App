"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
function HelpDiagnosticData(_a) {
    var styles = _a.styles, route = _a.route, children = _a.children, isExactMatch = _a.isExactMatch;
    var diagnosticTitle = isExactMatch ? 'Help content found for route:' : 'Missing help content for route:';
    return (<>
            {!!children && (<>
                    {children}
                    <react_native_1.View style={[styles.sectionDividerLine, styles.mv5]}/>
                </>)}
            <Text_1.default style={[styles.textLabelSupportingNormal, styles.mb4]}>Diagnostic data (visible only on staging)</Text_1.default>
            <Text_1.default style={[styles.textHeadlineH1, styles.mb4]}>{diagnosticTitle}</Text_1.default>
            <Text_1.default style={styles.textNormal}>{route}</Text_1.default>
        </>);
}
exports.default = HelpDiagnosticData;
