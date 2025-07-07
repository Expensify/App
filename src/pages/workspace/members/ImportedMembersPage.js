"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConfirmModal_1 = require("@components/ConfirmModal");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ImportSpreadsheetColumns_1 = require("@components/ImportSpreadsheetColumns");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useCloseImportPage_1 = require("@hooks/useCloseImportPage");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var Member_1 = require("@libs/actions/Policy/Member");
var importSpreadsheetUtils_1 = require("@libs/importSpreadsheetUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
function ImportedMembersPage(_a) {
    var _b, _c, _d, _e, _f, _g;
    var route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var _h = (0, useOnyx_1.default)(ONYXKEYS_1.default.IMPORTED_SPREADSHEET, { canBeMissing: true }), spreadsheet = _h[0], spreadsheetMetadata = _h[1];
    var _j = (0, react_1.useState)(false), isImporting = _j[0], setIsImporting = _j[1];
    var _k = (0, react_1.useState)(false), isValidationEnabled = _k[0], setIsValidationEnabled = _k[1];
    var setIsClosing = (0, useCloseImportPage_1.default)().setIsClosing;
    var policyID = route.params.policyID;
    var columnNames = (0, importSpreadsheetUtils_1.generateColumnNames)((_c = (_b = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.data) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0);
    var _l = (spreadsheet !== null && spreadsheet !== void 0 ? spreadsheet : {}).containsHeader, containsHeader = _l === void 0 ? true : _l;
    var columnRoles = [
        { text: translate('common.ignore'), value: CONST_1.default.CSV_IMPORT_COLUMNS.IGNORE },
        { text: translate('common.email'), value: CONST_1.default.CSV_IMPORT_COLUMNS.EMAIL, isRequired: true },
        { text: translate('common.role'), value: CONST_1.default.CSV_IMPORT_COLUMNS.ROLE },
    ];
    var requiredColumns = columnRoles.filter(function (role) { return role.isRequired; }).map(function (role) { return role; });
    // checks if all required columns are mapped and no column is mapped more than once
    // returns found errors or empty object if both conditions are met
    var validate = (0, react_1.useCallback)(function () {
        var _a;
        var columns = Object.values((_a = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.columns) !== null && _a !== void 0 ? _a : {});
        var errors = {};
        var missingRequiredColumns = requiredColumns.find(function (requiredColumn) { return !columns.includes(requiredColumn.value); });
        if (missingRequiredColumns) {
            errors.required = translate('spreadsheet.fieldNotMapped', { fieldName: missingRequiredColumns.text });
        }
        else {
            var duplicate = (0, importSpreadsheetUtils_1.findDuplicate)(columns);
            if (duplicate) {
                errors.duplicates = translate('spreadsheet.singleFieldMultipleColumns', { fieldName: duplicate });
            }
            else {
                errors = {};
            }
        }
        return errors;
    }, [requiredColumns, spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.columns, translate]);
    var importMembers = (0, react_1.useCallback)(function () {
        var _a;
        setIsValidationEnabled(true);
        var errors = validate();
        if (Object.keys(errors).length > 0) {
            return;
        }
        var columns = Object.values((_a = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.columns) !== null && _a !== void 0 ? _a : {});
        var membersEmailsColumn = columns.findIndex(function (column) { return column === CONST_1.default.CSV_IMPORT_COLUMNS.EMAIL; });
        var membersRolesColumn = columns.findIndex(function (column) { return column === CONST_1.default.CSV_IMPORT_COLUMNS.ROLE; });
        var membersEmails = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.data[membersEmailsColumn].map(function (email) { return email; });
        var membersRoles = membersRolesColumn !== -1 ? spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.data[membersRolesColumn].map(function (role) { return role; }) : [];
        var members = membersEmails === null || membersEmails === void 0 ? void 0 : membersEmails.slice(containsHeader ? 1 : 0).map(function (email, index) {
            var role = CONST_1.default.POLICY.ROLE.USER;
            if (membersRolesColumn !== -1 && (membersRoles === null || membersRoles === void 0 ? void 0 : membersRoles[containsHeader ? index + 1 : index])) {
                role = membersRoles === null || membersRoles === void 0 ? void 0 : membersRoles[containsHeader ? index + 1 : index];
            }
            return {
                email: email,
                role: role,
            };
        });
        if (members) {
            setIsImporting(true);
            (0, Member_1.importPolicyMembers)(policyID, members);
        }
    }, [validate, spreadsheet, containsHeader, policyID]);
    if (!spreadsheet && (0, isLoadingOnyxValue_1.default)(spreadsheetMetadata)) {
        return;
    }
    var spreadsheetColumns = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.data;
    if (!spreadsheetColumns) {
        return <NotFoundPage_1.default />;
    }
    var closeImportPageAndModal = function () {
        setIsClosing(true);
        setIsImporting(false);
        Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_MEMBERS.getRoute(policyID));
    };
    return (<ScreenWrapper_1.default testID={ImportedMembersPage.displayName} enableEdgeToEdgeBottomSafeAreaPadding>
            <HeaderWithBackButton_1.default title={translate('workspace.people.importMembers')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_MEMBERS_IMPORT.getRoute(policyID)); }}/>
            <ImportSpreadsheetColumns_1.default spreadsheetColumns={spreadsheetColumns} columnNames={columnNames} importFunction={importMembers} errors={isValidationEnabled ? validate() : undefined} columnRoles={columnRoles} isButtonLoading={isImporting} learnMoreLink={CONST_1.default.IMPORT_SPREADSHEET.MEMBERS_ARTICLE_LINK}/>

            <ConfirmModal_1.default isVisible={spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.shouldFinalModalBeOpened} title={(_e = (_d = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.importFinalModal) === null || _d === void 0 ? void 0 : _d.title) !== null && _e !== void 0 ? _e : ''} prompt={(_g = (_f = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.importFinalModal) === null || _f === void 0 ? void 0 : _f.prompt) !== null && _g !== void 0 ? _g : ''} onConfirm={closeImportPageAndModal} onCancel={closeImportPageAndModal} confirmText={translate('common.buttonConfirm')} shouldShowCancelButton={false} shouldHandleNavigationBack/>
        </ScreenWrapper_1.default>);
}
ImportedMembersPage.displayName = 'ImportedMembersPage';
exports.default = ImportedMembersPage;
