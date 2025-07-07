"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSpreadsheetData = setSpreadsheetData;
exports.setColumnName = setColumnName;
exports.closeImportPage = closeImportPage;
exports.setContainsHeader = setContainsHeader;
var react_native_onyx_1 = require("react-native-onyx");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function setSpreadsheetData(data, fileURI, fileType, fileName, isImportingMultiLevelTags) {
    var _a, _b, _c;
    if (!Array.isArray(data) || !Array.isArray(data.at(0))) {
        return Promise.reject(new Error('Invalid data format'));
    }
    var transposedData = (_a = data.at(0)) === null || _a === void 0 ? void 0 : _a.map(function (_, colIndex) { return data.map(function (row) { var _a; return (_a = row.at(colIndex)) !== null && _a !== void 0 ? _a : ''; }); });
    var columnNames = (_c = (_b = data.at(0)) === null || _b === void 0 ? void 0 : _b.reduce(function (acc, _, colIndex) {
        acc[colIndex] = CONST_1.default.CSV_IMPORT_COLUMNS.IGNORE;
        return acc;
    }, {})) !== null && _c !== void 0 ? _c : {};
    return react_native_onyx_1.default.set(ONYXKEYS_1.default.IMPORTED_SPREADSHEET, { data: transposedData, columns: columnNames, fileURI: fileURI, fileType: fileType, fileName: fileName, isImportingMultiLevelTags: isImportingMultiLevelTags });
}
function setColumnName(columnIndex, columnName) {
    var _a;
    return react_native_onyx_1.default.merge(ONYXKEYS_1.default.IMPORTED_SPREADSHEET, { columns: (_a = {}, _a[columnIndex] = columnName, _a) });
}
function setContainsHeader(containsHeader) {
    return react_native_onyx_1.default.merge(ONYXKEYS_1.default.IMPORTED_SPREADSHEET, { containsHeader: containsHeader });
}
function closeImportPage() {
    return react_native_onyx_1.default.merge(ONYXKEYS_1.default.IMPORTED_SPREADSHEET, { data: null, columns: null, shouldFinalModalBeOpened: false, importFinalModal: null });
}
