"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
var common_1 = require("./common");
var readFromOnyxDatabase = function () {
    return new Promise(function (resolve) {
        var db;
        var openRequest = indexedDB.open(CONST_1.default.DEFAULT_DB_NAME);
        openRequest.onsuccess = function () {
            db = openRequest.result;
            var transaction = db.transaction(CONST_1.default.DEFAULT_TABLE_NAME);
            var objectStore = transaction.objectStore(CONST_1.default.DEFAULT_TABLE_NAME);
            var cursor = objectStore.openCursor();
            var queryResult = {};
            cursor.onerror = function () {
                console.error('Error reading cursor');
            };
            cursor.onsuccess = function (event) {
                var result = event.target.result;
                if (result) {
                    queryResult[result.primaryKey] = result.value;
                    result.continue();
                }
                else {
                    // no results mean the cursor has reached the end of the data
                    resolve(queryResult);
                }
            };
        };
    });
};
var shareAsFile = function (fileContent) {
    var element = document.createElement('a');
    element.setAttribute('href', "data:text/plain;charset=utf-8,".concat(encodeURIComponent(fileContent)));
    element.setAttribute('download', CONST_1.default.DEFAULT_ONYX_DUMP_FILE_NAME);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};
var ExportOnyxState = {
    maskOnyxState: common_1.maskOnyxState,
    readFromOnyxDatabase: readFromOnyxDatabase,
    shareAsFile: shareAsFile,
};
exports.default = ExportOnyxState;
