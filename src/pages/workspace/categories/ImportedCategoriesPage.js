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
var usePolicy_1 = require("@hooks/usePolicy");
var Category_1 = require("@libs/actions/Policy/Category");
var importSpreadsheetUtils_1 = require("@libs/importSpreadsheetUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
function ImportedCategoriesPage(_a) {
    var _b, _c, _d, _e, _f, _g;
    var route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var _h = (0, useOnyx_1.default)(ONYXKEYS_1.default.IMPORTED_SPREADSHEET, { canBeMissing: true }), spreadsheet = _h[0], spreadsheetMetadata = _h[1];
    var _j = (0, react_1.useState)(false), isImportingCategories = _j[0], setIsImportingCategories = _j[1];
    var _k = (spreadsheet !== null && spreadsheet !== void 0 ? spreadsheet : {}).containsHeader, containsHeader = _k === void 0 ? true : _k;
    var _l = (0, react_1.useState)(false), isValidationEnabled = _l[0], setIsValidationEnabled = _l[1];
    var policyID = route.params.policyID;
    var backTo = route.params.backTo;
    var policyCategories = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(policyID), { canBeMissing: true })[0];
    var setIsClosing = (0, useCloseImportPage_1.default)().setIsClosing;
    var policy = (0, usePolicy_1.default)(policyID);
    var columnNames = (0, importSpreadsheetUtils_1.generateColumnNames)((_c = (_b = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.data) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0);
    var isQuickSettingsFlow = route.name === SCREENS_1.default.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_IMPORTED;
    var getColumnRoles = function () {
        var roles = [];
        roles.push({ text: translate('common.ignore'), value: CONST_1.default.CSV_IMPORT_COLUMNS.IGNORE }, { text: translate('common.name'), value: CONST_1.default.CSV_IMPORT_COLUMNS.NAME, isRequired: true }, { text: translate('common.enabled'), value: CONST_1.default.CSV_IMPORT_COLUMNS.ENABLED, isRequired: true });
        if ((0, PolicyUtils_1.isControlPolicy)(policy)) {
            roles.push({ text: translate('workspace.categories.glCode'), value: CONST_1.default.CSV_IMPORT_COLUMNS.GL_CODE });
        }
        return roles;
    };
    var columnRoles = getColumnRoles();
    var requiredColumns = columnRoles.filter(function (role) { return role.isRequired; }).map(function (role) { return role; });
    var validate = (0, react_1.useCallback)(function () {
        var _a;
        var columns = Object.values((_a = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.columns) !== null && _a !== void 0 ? _a : {});
        var errors = {};
        var missingRequiredColumns = requiredColumns.find(function (requiredColumn) { return !columns.includes(requiredColumn.value); });
        if (missingRequiredColumns) {
            errors.required = translate('spreadsheet.fieldNotMapped', { fieldName: missingRequiredColumns.text });
        }
        else {
            var duplicate_1 = (0, importSpreadsheetUtils_1.findDuplicate)(columns);
            var duplicateColumn = columnRoles.find(function (role) { return role.value === duplicate_1; });
            var categoriesNamesColumn = columns.findIndex(function (column) { return column === CONST_1.default.CSV_IMPORT_COLUMNS.NAME; });
            var categoriesNames = categoriesNamesColumn !== -1 ? spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.data[categoriesNamesColumn] : [];
            var containsEmptyName = categoriesNames === null || categoriesNames === void 0 ? void 0 : categoriesNames.some(function (name, index) { return (!containsHeader || index > 0) && !(name === null || name === void 0 ? void 0 : name.toString().trim()); });
            if (duplicateColumn) {
                errors.duplicates = translate('spreadsheet.singleFieldMultipleColumns', { fieldName: duplicateColumn.text });
            }
            else if (containsEmptyName) {
                errors.emptyNames = translate('spreadsheet.emptyMappedField', { fieldName: translate('common.name') });
            }
            else {
                errors = {};
            }
        }
        return errors;
    }, [spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.columns, spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.data, requiredColumns, translate, columnRoles, containsHeader]);
    var importCategories = (0, react_1.useCallback)(function () {
        var _a;
        setIsValidationEnabled(true);
        var errors = validate();
        if (Object.keys(errors).length > 0) {
            return;
        }
        var columns = Object.values((_a = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.columns) !== null && _a !== void 0 ? _a : {});
        var categoriesNamesColumn = columns.findIndex(function (column) { return column === CONST_1.default.CSV_IMPORT_COLUMNS.NAME; });
        var categoriesGLCodeColumn = columns.findIndex(function (column) { return column === CONST_1.default.CSV_IMPORT_COLUMNS.GL_CODE; });
        var categoriesEnabledColumn = columns.findIndex(function (column) { return column === CONST_1.default.CSV_IMPORT_COLUMNS.ENABLED; });
        var categoriesNames = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.data[categoriesNamesColumn].map(function (name) { return name; });
        var categoriesEnabled = categoriesEnabledColumn !== -1 ? spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.data[categoriesEnabledColumn].map(function (enabled) { return enabled; }) : [];
        var categoriesGLCode = categoriesGLCodeColumn !== -1 ? spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.data[categoriesGLCodeColumn].map(function (glCode) { return glCode; }) : [];
        var categories = categoriesNames === null || categoriesNames === void 0 ? void 0 : categoriesNames.slice(containsHeader ? 1 : 0).map(function (name, index) {
            var _a, _b;
            var categoryAlreadyExists = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[name];
            var existingGLCodeOrDefault = (_a = categoryAlreadyExists === null || categoryAlreadyExists === void 0 ? void 0 : categoryAlreadyExists['GL Code']) !== null && _a !== void 0 ? _a : '';
            return {
                name: name,
                enabled: categoriesEnabledColumn !== -1 ? (categoriesEnabled === null || categoriesEnabled === void 0 ? void 0 : categoriesEnabled[containsHeader ? index + 1 : index]) === 'true' : true,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'GL Code': categoriesGLCodeColumn !== -1 ? ((_b = categoriesGLCode === null || categoriesGLCode === void 0 ? void 0 : categoriesGLCode[containsHeader ? index + 1 : index]) !== null && _b !== void 0 ? _b : '') : existingGLCodeOrDefault,
            };
        });
        if (categories) {
            setIsImportingCategories(true);
            (0, Category_1.importPolicyCategories)(policyID, categories);
        }
    }, [validate, spreadsheet, containsHeader, policyID, policyCategories]);
    var hasAccountingConnections = (0, PolicyUtils_1.hasAccountingConnections)(policy);
    if (!spreadsheet && (0, isLoadingOnyxValue_1.default)(spreadsheetMetadata)) {
        return;
    }
    var spreadsheetColumns = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.data;
    if (hasAccountingConnections || !spreadsheetColumns) {
        return <NotFoundPage_1.default />;
    }
    var closeImportPageAndModal = function () {
        setIsClosing(true);
        setIsImportingCategories(false);
        Navigation_1.default.goBack(isQuickSettingsFlow ? ROUTES_1.default.SETTINGS_CATEGORIES_ROOT.getRoute(policyID, backTo) : ROUTES_1.default.WORKSPACE_CATEGORIES.getRoute(policyID));
    };
    return (<ScreenWrapper_1.default testID={ImportedCategoriesPage.displayName} enableEdgeToEdgeBottomSafeAreaPadding>
            <HeaderWithBackButton_1.default title={translate('workspace.categories.importCategories')} onBackButtonPress={function () {
            return Navigation_1.default.goBack(isQuickSettingsFlow ? ROUTES_1.default.SETTINGS_CATEGORIES_IMPORT.getRoute(policyID, backTo) : ROUTES_1.default.WORKSPACE_CATEGORIES_IMPORT.getRoute(policyID));
        }}/>
            <ImportSpreadsheetColumns_1.default spreadsheetColumns={spreadsheetColumns} columnNames={columnNames} importFunction={importCategories} errors={isValidationEnabled ? validate() : undefined} columnRoles={columnRoles} isButtonLoading={isImportingCategories} learnMoreLink={CONST_1.default.IMPORT_SPREADSHEET.CATEGORIES_ARTICLE_LINK}/>

            <ConfirmModal_1.default isVisible={spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.shouldFinalModalBeOpened} title={(_e = (_d = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.importFinalModal) === null || _d === void 0 ? void 0 : _d.title) !== null && _e !== void 0 ? _e : ''} prompt={(_g = (_f = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.importFinalModal) === null || _f === void 0 ? void 0 : _f.prompt) !== null && _g !== void 0 ? _g : ''} onConfirm={closeImportPageAndModal} onCancel={closeImportPageAndModal} confirmText={translate('common.buttonConfirm')} shouldShowCancelButton={false} shouldHandleNavigationBack/>
        </ScreenWrapper_1.default>);
}
ImportedCategoriesPage.displayName = 'ImportedCategoriesPage';
exports.default = ImportedCategoriesPage;
