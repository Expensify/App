"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var SidebarUtils_1 = require("@libs/SidebarUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var RenderHTML_1 = require("./RenderHTML");
var Text_1 = require("./Text");
var UserDetailsTooltip_1 = require("./UserDetailsTooltip");
function ReportWelcomeText(_a) {
    var _b, _c, _d, _e;
    var report = _a.report, policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: false })[0];
    var isPolicyExpenseChat = (0, ReportUtils_1.isPolicyExpenseChat)(report);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var reportMetadata = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat((report === null || report === void 0 ? void 0 : report.reportID) || undefined), { canBeMissing: true })[0];
    var isReportArchived = (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID);
    var isArchivedRoom = (0, ReportUtils_1.isArchivedNonExpenseReport)(report, isReportArchived);
    var isChatRoom = (0, ReportUtils_1.isChatRoom)(report);
    var isSelfDM = (0, ReportUtils_1.isSelfDM)(report);
    var isInvoiceRoom = (0, ReportUtils_1.isInvoiceRoom)(report);
    var isSystemChat = (0, ReportUtils_1.isSystemChat)(report);
    var isAdminRoom = (0, ReportUtils_1.isAdminRoom)(report);
    var isDefault = !(isChatRoom || isPolicyExpenseChat || isSelfDM || isInvoiceRoom || isSystemChat);
    var participantAccountIDs = (0, ReportUtils_1.getParticipantsAccountIDsForDisplay)(report, undefined, true, true, reportMetadata);
    var isMultipleParticipant = participantAccountIDs.length > 1;
    var displayNamesWithTooltips = (0, ReportUtils_1.getDisplayNamesWithTooltips)((0, OptionsListUtils_1.getPersonalDetailsForAccountIDs)(participantAccountIDs, personalDetails), isMultipleParticipant);
    var welcomeMessage = SidebarUtils_1.default.getWelcomeMessage(report, policy, isReportArchived);
    var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, policy, participantAccountIDs);
    var policyName = (0, ReportUtils_1.getPolicyName)({ report: report });
    var filteredOptions = moneyRequestOptions.filter(function (item) { return item !== CONST_1.default.IOU.TYPE.INVOICE; });
    var additionalText = filteredOptions
        .map(function (item, index) {
        return "".concat(index === filteredOptions.length - 1 && index > 0 ? "".concat(translate('common.or'), " ") : '').concat(translate(item === 'submit' ? "reportActionsView.create" : "reportActionsView.iouTypes.".concat(item)));
    })
        .join(', ');
    var reportName = (0, ReportUtils_1.getReportName)(report);
    var shouldShowUsePlusButtonText = moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.PAY) ||
        moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.SUBMIT) ||
        moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.TRACK) ||
        moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.SPLIT);
    var navigateToReport = function () {
        if (!(report === null || report === void 0 ? void 0 : report.reportID)) {
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID_DETAILS.getRoute(report.reportID, Navigation_1.default.getReportRHPActiveRoute()));
    };
    var welcomeHeroText = (0, react_1.useMemo)(function () {
        if (isInvoiceRoom) {
            return translate('reportActionsView.sayHello');
        }
        if (isChatRoom) {
            return translate('reportActionsView.welcomeToRoom', { roomName: reportName });
        }
        if (isSelfDM) {
            return translate('reportActionsView.yourSpace');
        }
        if (isSystemChat) {
            return reportName;
        }
        if (isPolicyExpenseChat) {
            return translate('reportActionsView.welcomeToRoom', { roomName: policyName });
        }
        return translate('reportActionsView.sayHello');
    }, [isChatRoom, isInvoiceRoom, isPolicyExpenseChat, isSelfDM, isSystemChat, translate, policyName, reportName]);
    return (<>
            <react_native_1.View>
                <Text_1.default style={[styles.textHero]}>{welcomeHeroText}</Text_1.default>
            </react_native_1.View>
            <react_native_1.View style={[styles.mt3, styles.mw100]}>
                {isPolicyExpenseChat &&
            ((welcomeMessage === null || welcomeMessage === void 0 ? void 0 : welcomeMessage.messageHtml) ? (<react_native_1.View style={[styles.renderHTML, styles.cursorText]}>
                            <RenderHTML_1.default html={welcomeMessage.messageHtml}/>
                        </react_native_1.View>) : (<Text_1.default>
                            <Text_1.default>{welcomeMessage.phrase1}</Text_1.default>
                            <Text_1.default style={[styles.textStrong]}>{(0, ReportUtils_1.getDisplayNameForParticipant)({ accountID: report === null || report === void 0 ? void 0 : report.ownerAccountID })}</Text_1.default>
                            <Text_1.default>{welcomeMessage.phrase2}</Text_1.default>
                            <Text_1.default style={[styles.textStrong]}>{(0, ReportUtils_1.getPolicyName)({ report: report })}</Text_1.default>
                            <Text_1.default>{welcomeMessage.phrase3}</Text_1.default>
                        </Text_1.default>))}
                {isInvoiceRoom &&
            !isArchivedRoom &&
            ((welcomeMessage === null || welcomeMessage === void 0 ? void 0 : welcomeMessage.messageHtml) ? (<react_native_1.View style={[styles.renderHTML, styles.cursorText]}>
                            <RenderHTML_1.default html={welcomeMessage.messageHtml}/>
                        </react_native_1.View>) : (<Text_1.default>
                            <Text_1.default>{welcomeMessage.phrase1}</Text_1.default>
                            <Text_1.default>
                                {((_b = report === null || report === void 0 ? void 0 : report.invoiceReceiver) === null || _b === void 0 ? void 0 : _b.type) === CONST_1.default.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL ? (<Text_1.default style={[styles.textStrong]}>{(0, ReportUtils_1.getDisplayNameForParticipant)({ accountID: (_c = report === null || report === void 0 ? void 0 : report.invoiceReceiver) === null || _c === void 0 ? void 0 : _c.accountID })}</Text_1.default>) : (
                // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
                // eslint-disable-next-line deprecation/deprecation
                <Text_1.default style={[styles.textStrong]}>{(_e = (0, PolicyUtils_1.getPolicy)((_d = report === null || report === void 0 ? void 0 : report.invoiceReceiver) === null || _d === void 0 ? void 0 : _d.policyID)) === null || _e === void 0 ? void 0 : _e.name}</Text_1.default>)}
                            </Text_1.default>
                            <Text_1.default>{" ".concat(translate('common.and'), " ")}</Text_1.default>
                            <Text_1.default style={[styles.textStrong]}>{(0, ReportUtils_1.getPolicyName)({ report: report })}</Text_1.default>
                            <Text_1.default>{welcomeMessage.phrase2}</Text_1.default>
                        </Text_1.default>))}
                {isChatRoom &&
            ((!isInvoiceRoom && !isAdminRoom) || isArchivedRoom) &&
            ((welcomeMessage === null || welcomeMessage === void 0 ? void 0 : welcomeMessage.messageHtml) ? (<react_native_1.View style={styles.renderHTML}>
                            <RenderHTML_1.default html={welcomeMessage.messageHtml}/>
                        </react_native_1.View>) : (<Text_1.default>
                            <Text_1.default>{welcomeMessage.phrase1}</Text_1.default>
                            {welcomeMessage.showReportName && (<Text_1.default style={[styles.textStrong]} onPress={navigateToReport} suppressHighlighting>
                                    {(0, ReportUtils_1.getReportName)(report)}
                                </Text_1.default>)}
                            {welcomeMessage.phrase2 !== undefined && <Text_1.default>{welcomeMessage.phrase2}</Text_1.default>}
                        </Text_1.default>))}
                {isChatRoom && isAdminRoom && !isArchivedRoom && (<Text_1.default>
                        <Text_1.default>{welcomeMessage.phrase1}</Text_1.default>
                        {welcomeMessage.phrase2 !== undefined && <Text_1.default style={styles.textStrong}>{welcomeMessage.phrase2}</Text_1.default>}
                        {welcomeMessage.phrase3 !== undefined && <Text_1.default>{welcomeMessage.phrase3}</Text_1.default>}
                        {welcomeMessage.phrase4 !== undefined && <Text_1.default>{welcomeMessage.phrase4}</Text_1.default>}
                    </Text_1.default>)}
                {isSelfDM && (<Text_1.default>
                        <Text_1.default>{welcomeMessage.phrase1}</Text_1.default>
                        {shouldShowUsePlusButtonText && <Text_1.default>{translate('reportActionsView.usePlusButton', { additionalText: additionalText })}</Text_1.default>}
                    </Text_1.default>)}
                {isSystemChat && (<Text_1.default>
                        <Text_1.default>{welcomeMessage.phrase1}</Text_1.default>
                    </Text_1.default>)}
                {isDefault && displayNamesWithTooltips.length > 0 && (<Text_1.default>
                        <Text_1.default>{welcomeMessage.phrase1}</Text_1.default>
                        {displayNamesWithTooltips.map(function (_a, index) {
                var displayName = _a.displayName, accountID = _a.accountID;
                return (
                // eslint-disable-next-line react/no-array-index-key
                <Text_1.default key={"".concat(displayName).concat(index)}>
                                <UserDetailsTooltip_1.default accountID={accountID}>
                                    {(0, ReportUtils_1.isOptimisticPersonalDetail)(accountID) ? (<Text_1.default style={[styles.textStrong]}>{displayName}</Text_1.default>) : (<Text_1.default style={[styles.textStrong]} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.PROFILE.getRoute(accountID, Navigation_1.default.getActiveRoute())); }} suppressHighlighting>
                                            {displayName}
                                        </Text_1.default>)}
                                </UserDetailsTooltip_1.default>
                                {index === displayNamesWithTooltips.length - 1 && <Text_1.default>.</Text_1.default>}
                                {index === displayNamesWithTooltips.length - 2 && <Text_1.default>{" ".concat(translate('common.and'), " ")}</Text_1.default>}
                                {index < displayNamesWithTooltips.length - 2 && <Text_1.default>, </Text_1.default>}
                            </Text_1.default>);
            })}
                        {shouldShowUsePlusButtonText && <Text_1.default>{translate('reportActionsView.usePlusButton', { additionalText: additionalText })}</Text_1.default>}
                        {(0, ReportUtils_1.isConciergeChatReport)(report) && <Text_1.default>{translate('reportActionsView.askConcierge')}</Text_1.default>}
                    </Text_1.default>)}
            </react_native_1.View>
        </>);
}
ReportWelcomeText.displayName = 'ReportWelcomeText';
exports.default = ReportWelcomeText;
