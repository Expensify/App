"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_fs_1 = require("react-native-fs");
var react_native_nitro_sqlite_1 = require("react-native-nitro-sqlite");
var react_native_share_1 = require("react-native-share");
var CONST_1 = require("@src/CONST");
var common_1 = require("./common");
var readFromOnyxDatabase = function () {
    return new Promise(function (resolve) {
        var db = (0, react_native_nitro_sqlite_1.open)({ name: CONST_1.default.DEFAULT_DB_NAME });
        var query = "SELECT * FROM ".concat(CONST_1.default.DEFAULT_TABLE_NAME);
        db.executeAsync(query, []).then(function (_a) {
            var _b;
            var rows = _a.rows;
            var result = 
            // eslint-disable-next-line no-underscore-dangle
            (_b = rows === null || rows === void 0 ? void 0 : rows._array.reduce(function (acc, row) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                acc[row === null || row === void 0 ? void 0 : row.record_key] = JSON.parse(row === null || row === void 0 ? void 0 : row.valueJSON);
                return acc;
            }, {})) !== null && _b !== void 0 ? _b : {};
            resolve(result);
        });
    });
};
var shareAsFile = function (fileContent) {
    try {
        // Define new filename and path for the app info file
        var infoFileName = CONST_1.default.DEFAULT_ONYX_DUMP_FILE_NAME;
        var infoFilePath = "".concat(react_native_fs_1.default.DocumentDirectoryPath, "/").concat(infoFileName);
        var actualInfoFile_1 = "file://".concat(infoFilePath);
        react_native_fs_1.default.writeFile(infoFilePath, fileContent, 'utf8').then(function () {
            react_native_share_1.default.open({
                url: actualInfoFile_1,
                failOnCancel: false,
            });
        });
    }
    catch (error) {
        console.error('Error renaming and sharing file:', error);
    }
};
var ExportOnyxState = {
    maskOnyxState: common_1.maskOnyxState,
    readFromOnyxDatabase: readFromOnyxDatabase,
    shareAsFile: shareAsFile,
};
exports.default = ExportOnyxState;
