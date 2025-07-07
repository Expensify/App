"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jszip_1 = require("jszip");
var react_1 = require("react");
var react_native_blob_util_1 = require("react-native-blob-util");
var react_native_fs_1 = require("react-native-fs");
var useEnvironment_1 = require("@hooks/useEnvironment");
var useOnyx_1 = require("@hooks/useOnyx");
var ExportOnyxState_1 = require("@libs/ExportOnyxState");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
var getDownloadFolderPathSuffixForIOS_1 = require("@libs/getDownloadFolderPathSuffixForIOS");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var BaseRecordTroubleshootDataToolMenu_1 = require("./BaseRecordTroubleshootDataToolMenu");
function RecordTroubleshootDataToolMenu() {
    var environment = (0, useEnvironment_1.default)().environment;
    var _a = (0, react_1.useState)(), file = _a[0], setFile = _a[1];
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.SHOULD_MASK_ONYX_STATE, { canBeMissing: true })[0], shouldMaskOnyxState = _b === void 0 ? true : _b;
    var zipRef = (0, react_1.useRef)(new jszip_1.default());
    var createFile = function (logs) {
        var newFileName = (0, FileUtils_1.appendTimeToFileName)('logs.txt');
        zipRef.current.file(newFileName, JSON.stringify(logs, null, 2));
        var dir = react_native_blob_util_1.default.fs.dirs.DocumentDir;
        var zipFileName = 'troubleshoot.zip';
        return ExportOnyxState_1.default.readFromOnyxDatabase()
            .then(function (value) {
            var dataToShare = JSON.stringify(ExportOnyxState_1.default.maskOnyxState(value, shouldMaskOnyxState));
            return zipRef.current.file(CONST_1.default.DEFAULT_ONYX_DUMP_FILE_NAME, dataToShare);
        })
            .then(function () {
            return zipRef.current
                .generateAsync({ type: 'base64' })
                .then(function (base64zip) {
                var zipPath = "".concat(dir, "/").concat(zipFileName);
                return react_native_blob_util_1.default.fs.writeFile(zipPath, base64zip, 'base64').then(function () {
                    return react_native_blob_util_1.default.fs.stat(zipPath).then(function (_a) {
                        var size = _a.size;
                        return ({
                            path: zipPath,
                            newFileName: zipFileName,
                            size: size,
                        });
                    });
                });
            })
                .then(function (localZipFile) {
                return setFile(localZipFile);
            })
                .catch(function (err) {
                console.error('Failed to write ZIP file:', err);
            })
                .finally(function () {
                zipRef.current = new jszip_1.default(); // Reset the zipRef for future use
            });
        });
    };
    return (<BaseRecordTroubleshootDataToolMenu_1.default file={file} onEnableLogging={function () { return setFile(undefined); }} onDisableLogging={createFile} pathToBeUsed={react_native_fs_1.default.DocumentDirectoryPath} showShareButton zipRef={zipRef} displayPath={"".concat(CONST_1.default.NEW_EXPENSIFY_PATH).concat((0, getDownloadFolderPathSuffixForIOS_1.default)(environment))}/>);
}
exports.default = RecordTroubleshootDataToolMenu;
