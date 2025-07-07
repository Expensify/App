"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Report = require("@libs/actions/Report");
var Navigation_1 = require("@navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var NotFoundPage_1 = require("./ErrorPage/NotFoundPage");
var withReportOrNotFound_1 = require("./home/report/withReportOrNotFound");
function ReportParticipantRoleSelectionPage(_a) {
    var _b, _c, _d, _e, _f;
    var report = _a.report, route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var accountID = (_c = Number((_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.accountID)) !== null && _c !== void 0 ? _c : -1;
    var backTo = ROUTES_1.default.REPORT_PARTICIPANTS_DETAILS.getRoute((_d = report === null || report === void 0 ? void 0 : report.reportID) !== null && _d !== void 0 ? _d : '-1', accountID, route.params.backTo);
    var member = (_e = report.participants) === null || _e === void 0 ? void 0 : _e[accountID];
    if (!member) {
        return <NotFoundPage_1.default />;
    }
    var items = [
        {
            value: CONST_1.default.REPORT.ROLE.ADMIN,
            text: translate('common.admin'),
            isSelected: (member === null || member === void 0 ? void 0 : member.role) === CONST_1.default.REPORT.ROLE.ADMIN,
            keyForList: CONST_1.default.REPORT.ROLE.ADMIN,
        },
        {
            value: CONST_1.default.REPORT.ROLE.MEMBER,
            text: translate('common.member'),
            isSelected: (member === null || member === void 0 ? void 0 : member.role) === CONST_1.default.REPORT.ROLE.MEMBER,
            keyForList: CONST_1.default.REPORT.ROLE.MEMBER,
        },
    ];
    var changeRole = function (_a) {
        var value = _a.value;
        Report.updateGroupChatMemberRoles(report.reportID, [accountID], value);
        Navigation_1.default.goBack(backTo);
    };
    return (<ScreenWrapper_1.default testID={ReportParticipantRoleSelectionPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('common.role')} onBackButtonPress={function () { return Navigation_1.default.goBack(backTo); }}/>
            <react_native_1.View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                <SelectionList_1.default sections={[{ data: items }]} ListItem={RadioListItem_1.default} onSelectRow={changeRole} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={(_f = items.find(function (item) { return item.isSelected; })) === null || _f === void 0 ? void 0 : _f.keyForList}/>
            </react_native_1.View>
        </ScreenWrapper_1.default>);
}
ReportParticipantRoleSelectionPage.displayName = 'ReportParticipantRoleSelectionPage';
exports.default = (0, withReportOrNotFound_1.default)()(ReportParticipantRoleSelectionPage);
