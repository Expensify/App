"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var Report_1 = require("@libs/actions/Report");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var withReportOrNotFound_1 = require("@pages/home/report/withReportOrNotFound");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function WriteCapabilityPage(_a) {
    var _b;
    var report = _a.report, policy = _a.policy;
    var route = (0, native_1.useRoute)();
    var translate = (0, useLocalize_1.default)().translate;
    var writeCapabilityOptions = Object.values(CONST_1.default.REPORT.WRITE_CAPABILITIES).map(function (value) {
        var _a;
        return ({
            value: value,
            text: translate("writeCapabilityPage.writeCapability.".concat(value)),
            keyForList: value,
            isSelected: value === ((_a = report === null || report === void 0 ? void 0 : report.writeCapability) !== null && _a !== void 0 ? _a : CONST_1.default.REPORT.WRITE_CAPABILITIES.ALL),
        });
    });
    var isReportArchived = (0, useReportIsArchived_1.default)(report.reportID);
    var isAbleToEdit = (0, ReportUtils_1.canEditWriteCapability)(report, policy, isReportArchived);
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(ROUTES_1.default.REPORT_SETTINGS.getRoute(report.reportID, route.params.backTo));
    }, [report.reportID, route.params.backTo]);
    var updateWriteCapability = (0, react_1.useCallback)(function (newValue) {
        (0, Report_1.updateWriteCapability)(report, newValue);
        goBack();
    }, [report, goBack]);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} testID={WriteCapabilityPage.displayName}>
            <FullPageNotFoundView_1.default shouldShow={!isAbleToEdit}>
                <HeaderWithBackButton_1.default title={translate('writeCapabilityPage.label')} shouldShowBackButton onBackButtonPress={goBack}/>
                <SelectionList_1.default sections={[{ data: writeCapabilityOptions }]} ListItem={RadioListItem_1.default} onSelectRow={function (option) { return updateWriteCapability(option.value); }} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={(_b = writeCapabilityOptions.find(function (locale) { return locale.isSelected; })) === null || _b === void 0 ? void 0 : _b.keyForList}/>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
WriteCapabilityPage.displayName = 'WriteCapabilityPage';
exports.default = (0, withReportOrNotFound_1.default)()(WriteCapabilityPage);
