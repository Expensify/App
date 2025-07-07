"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var Report_1 = require("@userActions/Report");
var Session_1 = require("@userActions/Session");
var CONST_1 = require("@src/CONST");
var withReportAndReportActionOrNotFound_1 = require("./home/report/withReportAndReportActionOrNotFound");
/**
 * Get the reportID for the associated chatReport
 */
function getReportID(route) {
    return route.params.reportID.toString();
}
function FlagCommentPage(_a) {
    var parentReportAction = _a.parentReportAction, route = _a.route, report = _a.report, parentReport = _a.parentReport, reportAction = _a.reportAction;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isReportArchived = (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID);
    var severities = [
        {
            severity: CONST_1.default.MODERATION.FLAG_SEVERITY_SPAM,
            name: translate('moderation.spam'),
            icon: Expensicons.FlagLevelOne,
            description: translate('moderation.spamDescription'),
            furtherDetails: translate('moderation.levelOneResult'),
            furtherDetailsIcon: Expensicons.FlagLevelOne,
        },
        {
            severity: CONST_1.default.MODERATION.FLAG_SEVERITY_INCONSIDERATE,
            name: translate('moderation.inconsiderate'),
            icon: Expensicons.FlagLevelOne,
            description: translate('moderation.inconsiderateDescription'),
            furtherDetails: translate('moderation.levelOneResult'),
            furtherDetailsIcon: Expensicons.FlagLevelOne,
        },
        {
            severity: CONST_1.default.MODERATION.FLAG_SEVERITY_INTIMIDATION,
            name: translate('moderation.intimidation'),
            icon: Expensicons.FlagLevelTwo,
            description: translate('moderation.intimidationDescription'),
            furtherDetails: translate('moderation.levelTwoResult'),
            furtherDetailsIcon: Expensicons.FlagLevelTwo,
        },
        {
            severity: CONST_1.default.MODERATION.FLAG_SEVERITY_BULLYING,
            name: translate('moderation.bullying'),
            icon: Expensicons.FlagLevelTwo,
            description: translate('moderation.bullyingDescription'),
            furtherDetails: translate('moderation.levelTwoResult'),
            furtherDetailsIcon: Expensicons.FlagLevelTwo,
        },
        {
            severity: CONST_1.default.MODERATION.FLAG_SEVERITY_HARASSMENT,
            name: translate('moderation.harassment'),
            icon: Expensicons.FlagLevelThree,
            description: translate('moderation.harassmentDescription'),
            furtherDetails: translate('moderation.levelThreeResult'),
            furtherDetailsIcon: Expensicons.FlagLevelThree,
        },
        {
            severity: CONST_1.default.MODERATION.FLAG_SEVERITY_ASSAULT,
            name: translate('moderation.assault'),
            icon: Expensicons.FlagLevelThree,
            description: translate('moderation.assaultDescription'),
            furtherDetails: translate('moderation.levelThreeResult'),
            furtherDetailsIcon: Expensicons.FlagLevelThree,
        },
    ];
    var flagComment = function (severity) {
        var reportID = getReportID(route);
        // Handle threads if needed
        if ((0, ReportUtils_1.isChatThread)(report) && (reportAction === null || reportAction === void 0 ? void 0 : reportAction.reportActionID) === (parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.reportActionID)) {
            reportID = parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID;
        }
        if (reportAction && (0, ReportUtils_1.canFlagReportAction)(reportAction, reportID)) {
            (0, Report_1.flagComment)(reportID, reportAction, severity);
        }
        Navigation_1.default.dismissModal();
    };
    var severityMenuItems = severities.map(function (item) { return (<MenuItem_1.default key={"".concat(item.severity)} shouldShowRightIcon title={item.name} description={item.description} onPress={(0, Session_1.callFunctionIfActionIsAllowed)(function () { return flagComment(item.severity); })} style={[styles.pt2, styles.pb4, styles.ph5, styles.flexRow]} furtherDetails={item.furtherDetails} furtherDetailsIcon={item.furtherDetailsIcon}/>); });
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} testID={FlagCommentPage.displayName}>
            {function (_a) {
            var safeAreaPaddingBottomStyle = _a.safeAreaPaddingBottomStyle;
            return (<FullPageNotFoundView_1.default shouldShow={!(0, ReportUtils_1.shouldShowFlagComment)(reportAction, report, isReportArchived)}>
                    <HeaderWithBackButton_1.default title={translate('reportActionContextMenu.flagAsOffensive')} onBackButtonPress={function () { return Navigation_1.default.goBack(route.params.backTo); }}/>
                    <ScrollView_1.default contentContainerStyle={safeAreaPaddingBottomStyle} style={styles.settingsPageBackground}>
                        <react_native_1.View style={styles.pageWrapper}>
                            <react_native_1.View style={styles.settingsPageBody}>
                                <Text_1.default style={styles.webViewStyles.baseFontStyle}>{translate('moderation.flagDescription')}</Text_1.default>
                            </react_native_1.View>
                        </react_native_1.View>
                        <Text_1.default style={[styles.ph5, styles.textLabelSupporting, styles.mb1]}>{translate('moderation.chooseAReason')}</Text_1.default>
                        {severityMenuItems}
                    </ScrollView_1.default>
                </FullPageNotFoundView_1.default>);
        }}
        </ScreenWrapper_1.default>);
}
FlagCommentPage.displayName = 'FlagCommentPage';
exports.default = (0, withReportAndReportActionOrNotFound_1.default)(FlagCommentPage);
