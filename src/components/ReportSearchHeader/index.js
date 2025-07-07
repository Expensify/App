"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var AvatarWithDisplayName_1 = require("@components/AvatarWithDisplayName");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function ReportSearchHeader(_a) {
    var report = _a.report, policy = _a.policy, style = _a.style, transactions = _a.transactions, avatarBorderColor = _a.avatarBorderColor;
    var styles = (0, useThemeStyles_1.default)();
    var middleContent = (0, react_1.useMemo)(function () {
        return (<AvatarWithDisplayName_1.default report={report} policy={policy} transactions={transactions} shouldUseCustomSearchTitleName shouldEnableDetailPageNavigation={false} shouldEnableAvatarNavigation={false} avatarBorderColor={avatarBorderColor}/>);
    }, [report, policy, transactions, avatarBorderColor]);
    return (<react_native_1.View dataSet={{ dragArea: false }} style={[style, styles.reportSearchHeaderBar]}>
            <react_native_1.View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.justifyContentBetween, styles.overflowHidden]}>{middleContent}</react_native_1.View>
        </react_native_1.View>);
}
ReportSearchHeader.displayName = 'ReportSearchHeader';
exports.default = ReportSearchHeader;
