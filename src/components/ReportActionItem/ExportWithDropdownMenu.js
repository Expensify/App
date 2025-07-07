"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var ButtonWithDropdownMenu_1 = require("@components/ButtonWithDropdownMenu");
var ConfirmModal_1 = require("@components/ConfirmModal");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Policy_1 = require("@libs/actions/Policy/Policy");
var Report_1 = require("@libs/actions/Report");
var ReportUtils_1 = require("@libs/ReportUtils");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function ExportWithDropdownMenu(_a) {
    var _b;
    var report = _a.report, reportActions = _a.reportActions, connectionName = _a.connectionName, _c = _a.dropdownAnchorAlignment, dropdownAnchorAlignment = _c === void 0 ? {
        horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
        vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
    } : _c, wrapperStyle = _a.wrapperStyle;
    var reportID = report === null || report === void 0 ? void 0 : report.reportID;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var _d = (0, react_1.useState)(null), modalStatus = _d[0], setModalStatus = _d[1];
    var exportMethods = (0, useOnyx_1.default)(ONYXKEYS_1.default.LAST_EXPORT_METHOD, { canBeMissing: true })[0];
    var iconToDisplay = (0, ReportUtils_1.getIntegrationIcon)(connectionName);
    var canBeExported = (0, ReportUtils_1.canBeExported)(report);
    var isExported = (0, ReportUtils_1.isExported)(reportActions);
    var flattenedWrapperStyle = react_native_1.StyleSheet.flatten([styles.flex1, wrapperStyle]);
    var dropdownOptions = (0, react_1.useMemo)(function () {
        var optionTemplate = {
            icon: iconToDisplay,
            disabled: !canBeExported,
            displayInDefaultIconColor: true,
            iconWidth: variables_1.default.iconSizeMenuItem,
            iconHeight: variables_1.default.iconSizeMenuItem,
            additionalIconStyles: styles.integrationIcon,
        };
        var options = [
            __assign({ value: CONST_1.default.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION, text: translate('workspace.common.exportIntegrationSelected', { connectionName: connectionName }) }, optionTemplate),
            __assign({ value: CONST_1.default.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED, text: translate('workspace.common.markAsEntered') }, optionTemplate),
        ];
        var exportMethod = (report === null || report === void 0 ? void 0 : report.policyID) ? exportMethods === null || exportMethods === void 0 ? void 0 : exportMethods[report.policyID] : null;
        if (exportMethod) {
            options.sort(function (method) { return (method.value === exportMethod ? -1 : 0); });
        }
        return options;
        // We do not include exportMethods not to re-render the component when the preferred export method changes
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [canBeExported, iconToDisplay, connectionName, report === null || report === void 0 ? void 0 : report.policyID, translate]);
    var confirmExport = (0, react_1.useCallback)(function () {
        setModalStatus(null);
        if (!reportID) {
            return;
        }
        if (modalStatus === CONST_1.default.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION) {
            (0, Report_1.exportToIntegration)(reportID, connectionName);
        }
        else if (modalStatus === CONST_1.default.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED) {
            (0, Report_1.markAsManuallyExported)(reportID, connectionName);
        }
    }, [connectionName, modalStatus, reportID]);
    var savePreferredExportMethod = function (value) {
        if (!(report === null || report === void 0 ? void 0 : report.policyID)) {
            return;
        }
        (0, Policy_1.savePreferredExportMethod)(report === null || report === void 0 ? void 0 : report.policyID, value);
    };
    return (<>
            <ButtonWithDropdownMenu_1.default success pressOnEnter shouldAlwaysShowDropdownMenu anchorAlignment={dropdownAnchorAlignment} onPress={function (_, value) {
            if (isExported) {
                setModalStatus(value);
                return;
            }
            if (!reportID) {
                return;
            }
            if (value === CONST_1.default.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION) {
                (0, Report_1.exportToIntegration)(reportID, connectionName);
            }
            else if (value === CONST_1.default.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED) {
                (0, Report_1.markAsManuallyExported)(reportID, connectionName);
            }
        }} onOptionSelected={function (_a) {
        var value = _a.value;
        return savePreferredExportMethod(value);
    }} options={dropdownOptions} style={[shouldUseNarrowLayout && styles.flexGrow1]} wrapperStyle={flattenedWrapperStyle} buttonSize={CONST_1.default.DROPDOWN_BUTTON_SIZE.MEDIUM}/>
            <ConfirmModal_1.default title={translate('workspace.exportAgainModal.title')} onConfirm={confirmExport} onCancel={function () { return setModalStatus(null); }} prompt={translate('workspace.exportAgainModal.description', { connectionName: connectionName, reportName: (_b = report === null || report === void 0 ? void 0 : report.reportName) !== null && _b !== void 0 ? _b : '' })} confirmText={translate('workspace.exportAgainModal.confirmText')} cancelText={translate('workspace.exportAgainModal.cancelText')} isVisible={!!modalStatus}/>
        </>);
}
exports.default = ExportWithDropdownMenu;
