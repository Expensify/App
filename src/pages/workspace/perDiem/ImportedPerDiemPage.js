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
var PerDiem_1 = require("@libs/actions/Policy/PerDiem");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var importSpreadsheetUtils_1 = require("@libs/importSpreadsheetUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
function generatePerDiemUnits(perDiemDestination, perDiemSubRate, perDiemCurrency, perDiemAmount) {
    var _a, _b, _c, _d;
    var perDiemUnits = {};
    for (var i = 0; i < perDiemDestination.length; i++) {
        perDiemUnits[perDiemDestination[i]] = (_a = perDiemUnits[perDiemDestination[i]]) !== null && _a !== void 0 ? _a : {
            customUnitRateID: perDiemDestination.at(i),
            name: perDiemDestination.at(i),
            rate: 0,
            currency: perDiemCurrency.at(i),
            enabled: true,
            attributes: [],
            subRates: [],
        };
        (_b = perDiemUnits[perDiemDestination[i]].subRates) === null || _b === void 0 ? void 0 : _b.push({
            id: (0, PerDiem_1.generateCustomUnitID)(),
            name: (_c = perDiemSubRate.at(i)) !== null && _c !== void 0 ? _c : '',
            // Use Math.round to avoid floating point errors when converting decimal amounts to cents (e.g., 16.4 * 100 = 1639.9999...)
            rate: Math.round(((_d = Number(perDiemAmount.at(i))) !== null && _d !== void 0 ? _d : 0) * CONST_1.default.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET),
        });
    }
    return Object.values(perDiemUnits);
}
function ImportedPerDiemPage(_a) {
    var _b, _c, _d, _e, _f, _g;
    var route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var _h = (0, useOnyx_1.default)(ONYXKEYS_1.default.IMPORTED_SPREADSHEET, { canBeMissing: true }), spreadsheet = _h[0], spreadsheetMetadata = _h[1];
    var _j = (0, react_1.useState)(false), isImportingPerDiemRates = _j[0], setIsImportingPerDiemRates = _j[1];
    var _k = (spreadsheet !== null && spreadsheet !== void 0 ? spreadsheet : {}).containsHeader, containsHeader = _k === void 0 ? true : _k;
    var _l = (0, react_1.useState)(false), isValidationEnabled = _l[0], setIsValidationEnabled = _l[1];
    var policyID = route.params.policyID;
    var policy = (0, usePolicy_1.default)(policyID);
    var perDiemCustomUnit = (0, PolicyUtils_1.getPerDiemCustomUnit)(policy);
    var columnNames = (0, importSpreadsheetUtils_1.generateColumnNames)((_c = (_b = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.data) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0);
    var setIsClosing = (0, useCloseImportPage_1.default)().setIsClosing;
    var getColumnRoles = function () {
        var roles = [];
        roles.push({ text: translate('common.ignore'), value: CONST_1.default.CSV_IMPORT_COLUMNS.IGNORE }, { text: translate('common.destination'), value: CONST_1.default.CSV_IMPORT_COLUMNS.DESTINATION, isRequired: true }, { text: translate('common.subrate'), value: CONST_1.default.CSV_IMPORT_COLUMNS.SUBRATE, isRequired: true }, { text: translate('common.currency'), value: CONST_1.default.CSV_IMPORT_COLUMNS.CURRENCY, isRequired: true }, { text: translate('workspace.perDiem.amount'), value: CONST_1.default.CSV_IMPORT_COLUMNS.AMOUNT, isRequired: true });
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
            if (duplicateColumn) {
                errors.duplicates = translate('spreadsheet.singleFieldMultipleColumns', { fieldName: duplicateColumn.text });
            }
            else {
                errors = {};
            }
        }
        return errors;
    }, [requiredColumns, spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.columns, translate, columnRoles]);
    var importRates = (0, react_1.useCallback)(function () {
        var _a, _b, _c, _d, _e;
        setIsValidationEnabled(true);
        var errors = validate();
        if (Object.keys(errors).length > 0 || !(perDiemCustomUnit === null || perDiemCustomUnit === void 0 ? void 0 : perDiemCustomUnit.customUnitID)) {
            return;
        }
        var columns = Object.values((_a = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.columns) !== null && _a !== void 0 ? _a : {});
        var perDiemDestinationColumn = columns.findIndex(function (column) { return column === CONST_1.default.CSV_IMPORT_COLUMNS.DESTINATION; });
        var perDiemSubRateColumn = columns.findIndex(function (column) { return column === CONST_1.default.CSV_IMPORT_COLUMNS.SUBRATE; });
        var perDiemCurrencyColumn = columns.findIndex(function (column) { return column === CONST_1.default.CSV_IMPORT_COLUMNS.CURRENCY; });
        var perDiemAmountColumn = columns.findIndex(function (column) { return column === CONST_1.default.CSV_IMPORT_COLUMNS.AMOUNT; });
        var perDiemDestination = (_b = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.data[perDiemDestinationColumn].map(function (destination) { return destination; })) !== null && _b !== void 0 ? _b : [];
        var perDiemSubRate = (_c = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.data[perDiemSubRateColumn].map(function (subRate) { return subRate; })) !== null && _c !== void 0 ? _c : [];
        var perDiemCurrency = (_d = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.data[perDiemCurrencyColumn].map(function (currency) { return (0, CurrencyUtils_1.sanitizeCurrencyCode)(currency); })) !== null && _d !== void 0 ? _d : [];
        var perDiemAmount = (_e = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.data[perDiemAmountColumn].map(function (amount) { return amount; })) !== null && _e !== void 0 ? _e : [];
        var perDiemUnits = generatePerDiemUnits(perDiemDestination === null || perDiemDestination === void 0 ? void 0 : perDiemDestination.slice(containsHeader ? 1 : 0), perDiemSubRate === null || perDiemSubRate === void 0 ? void 0 : perDiemSubRate.slice(containsHeader ? 1 : 0), perDiemCurrency === null || perDiemCurrency === void 0 ? void 0 : perDiemCurrency.slice(containsHeader ? 1 : 0), perDiemAmount === null || perDiemAmount === void 0 ? void 0 : perDiemAmount.slice(containsHeader ? 1 : 0));
        var rowsLength = perDiemDestination.length - (containsHeader ? 1 : 0);
        if (perDiemUnits) {
            setIsImportingPerDiemRates(true);
            (0, PerDiem_1.importPerDiemRates)(policyID, perDiemCustomUnit.customUnitID, perDiemUnits, rowsLength);
        }
    }, [validate, spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.columns, spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.data, containsHeader, policyID, perDiemCustomUnit === null || perDiemCustomUnit === void 0 ? void 0 : perDiemCustomUnit.customUnitID]);
    if (!spreadsheet && (0, isLoadingOnyxValue_1.default)(spreadsheetMetadata)) {
        return;
    }
    var spreadsheetColumns = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.data;
    if (!spreadsheetColumns) {
        return <NotFoundPage_1.default />;
    }
    var closeImportPageAndModal = function () {
        setIsClosing(true);
        setIsImportingPerDiemRates(false);
        Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_PER_DIEM.getRoute(policyID));
    };
    return (<ScreenWrapper_1.default testID={ImportedPerDiemPage.displayName} enableEdgeToEdgeBottomSafeAreaPadding>
            <HeaderWithBackButton_1.default title={translate('workspace.perDiem.importPerDiemRates')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_PER_DIEM_IMPORT.getRoute(policyID)); }}/>
            <ImportSpreadsheetColumns_1.default spreadsheetColumns={spreadsheetColumns} columnNames={columnNames} importFunction={importRates} errors={isValidationEnabled ? validate() : undefined} columnRoles={columnRoles} isButtonLoading={isImportingPerDiemRates} learnMoreLink={CONST_1.default.IMPORT_SPREADSHEET.CATEGORIES_ARTICLE_LINK}/>

            <ConfirmModal_1.default isVisible={spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.shouldFinalModalBeOpened} title={(_e = (_d = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.importFinalModal) === null || _d === void 0 ? void 0 : _d.title) !== null && _e !== void 0 ? _e : ''} prompt={(_g = (_f = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.importFinalModal) === null || _f === void 0 ? void 0 : _f.prompt) !== null && _g !== void 0 ? _g : ''} onConfirm={closeImportPageAndModal} onCancel={closeImportPageAndModal} confirmText={translate('common.buttonConfirm')} shouldShowCancelButton={false}/>
        </ScreenWrapper_1.default>);
}
ImportedPerDiemPage.displayName = 'ImportedPerDiemPage';
exports.default = ImportedPerDiemPage;
