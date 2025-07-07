"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConfirmationPage_1 = require("@components/ConfirmationPage");
var ConfirmModal_1 = require("@components/ConfirmModal");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Illustrations = require("@components/Icon/Illustrations");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var UserListItem_1 = require("@components/SelectionList/UserListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Report_1 = require("@libs/actions/Report");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function ReportDetailsExportPage(_a) {
    var _b, _c;
    var route = _a.route;
    var connectionName = (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.connectionName;
    var reportID = route.params.reportID;
    var backTo = route.params.backTo;
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID))[0];
    var reportActions = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID))[0];
    var policyID = report === null || report === void 0 ? void 0 : report.policyID;
    var translate = (0, useLocalize_1.default)().translate;
    var _d = (0, react_1.useState)(null), modalStatus = _d[0], setModalStatus = _d[1];
    var styles = (0, useThemeStyles_1.default)();
    var iconToDisplay = (0, ReportUtils_1.getIntegrationIcon)(connectionName);
    var canBeExported = (0, ReportUtils_1.canBeExported)(report);
    var isExported = (0, ReportUtils_1.isExported)(reportActions);
    var confirmExport = (0, react_1.useCallback)(function (type) {
        if (type === void 0) { type = modalStatus; }
        if (type === CONST_1.default.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION) {
            (0, Report_1.exportToIntegration)(reportID, connectionName);
        }
        else if (type === CONST_1.default.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED) {
            (0, Report_1.markAsManuallyExported)(reportID, connectionName);
        }
        setModalStatus(null);
        Navigation_1.default.dismissModal();
    }, [connectionName, modalStatus, reportID]);
    var exportSelectorOptions = [
        {
            value: CONST_1.default.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION,
            text: translate('workspace.common.exportIntegrationSelected', { connectionName: connectionName }),
            icons: [
                {
                    source: iconToDisplay !== null && iconToDisplay !== void 0 ? iconToDisplay : '',
                    type: CONST_1.default.ICON_TYPE_AVATAR,
                },
            ],
            isDisabled: !canBeExported,
        },
        {
            value: CONST_1.default.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED,
            text: translate('workspace.common.markAsEntered'),
            icons: [
                {
                    source: iconToDisplay !== null && iconToDisplay !== void 0 ? iconToDisplay : '',
                    type: CONST_1.default.ICON_TYPE_AVATAR,
                },
            ],
            isDisabled: !canBeExported,
        },
    ];
    if (!canBeExported) {
        return (<ScreenWrapper_1.default testID={ReportDetailsExportPage.displayName}>
                <HeaderWithBackButton_1.default title={translate('common.export')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.REPORT_WITH_ID_DETAILS.getRoute(reportID, backTo)); }}/>
                <ConfirmationPage_1.default illustration={Illustrations.LaptopWithSecondScreenAndHourglass} heading={translate('workspace.export.notReadyHeading')} description={translate('workspace.export.notReadyDescription')} shouldShowButton buttonText={translate('common.buttonConfirm')} onButtonPress={function () { return Navigation_1.default.goBack(); }} illustrationStyle={{ width: 233, height: 162 }} containerStyle={styles.flex1}/>
            </ScreenWrapper_1.default>);
    }
    return (<>
            <SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={ReportDetailsExportPage.displayName} sections={[{ data: exportSelectorOptions }]} listItem={UserListItem_1.default} shouldBeBlocked={false} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.REPORT_WITH_ID_DETAILS.getRoute(reportID, backTo)); }} title="common.export" connectionName={connectionName} onSelectRow={function (_a) {
            var value = _a.value;
            if (isExported) {
                setModalStatus(value);
            }
            else {
                confirmExport(value);
            }
        }}/>
            <ConfirmModal_1.default title={translate('workspace.exportAgainModal.title')} onConfirm={confirmExport} onCancel={function () { return setModalStatus(null); }} prompt={translate('workspace.exportAgainModal.description', { reportName: (_c = report === null || report === void 0 ? void 0 : report.reportName) !== null && _c !== void 0 ? _c : '', connectionName: connectionName })} confirmText={translate('workspace.exportAgainModal.confirmText')} cancelText={translate('workspace.exportAgainModal.cancelText')} isVisible={!!modalStatus}/>
        </>);
}
ReportDetailsExportPage.displayName = 'ReportDetailsExportPage';
exports.default = ReportDetailsExportPage;
