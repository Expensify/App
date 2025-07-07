"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jszip_1 = require("jszip");
var react_1 = require("react");
var react_native_blob_util_1 = require("react-native-blob-util");
var react_native_fs_1 = require("react-native-fs");
var useOnyx_1 = require("@hooks/useOnyx");
var ExportOnyxState_1 = require("@libs/ExportOnyxState");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var BaseRecordTroubleshootDataToolMenu_1 = require("./BaseRecordTroubleshootDataToolMenu");
function RecordTroubleshootDataToolMenu() {
    var _a = (0, react_1.useState)(), file = _a[0], setFile = _a[1];
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.SHOULD_MASK_ONYX_STATE, { canBeMissing: true })[0], shouldMaskOnyxState = _b === void 0 ? true : _b;
    var zipRef = (0, react_1.useRef)(new jszip_1.default());
    var createAndSaveFile = function (logs) {
        var newFileName = (0, FileUtils_1.appendTimeToFileName)('logs.txt');
        var zipFileName = 'troubleshoot.zip';
        var tempZipPath = "".concat(react_native_blob_util_1.default.fs.dirs.CacheDir, "/").concat(zipFileName);
        zipRef.current.file(newFileName, JSON.stringify(logs, null, 2));
        return ExportOnyxState_1.default.readFromOnyxDatabase()
            .then(function (value) {
            var dataToShare = JSON.stringify(ExportOnyxState_1.default.maskOnyxState(value, shouldMaskOnyxState));
            zipRef.current.file(CONST_1.default.DEFAULT_ONYX_DUMP_FILE_NAME, dataToShare);
            return zipRef.current.generateAsync({ type: 'base64' });
        })
            .then(function (base64zip) {
            return react_native_blob_util_1.default.fs.writeFile(tempZipPath, base64zip, 'base64').then(function () {
                return react_native_blob_util_1.default.MediaCollection.copyToMediaStore({
                    name: zipFileName,
                    // parentFolder: 'Download',
                    parentFolder: '',
                    mimeType: 'application/zip',
                }, 'Download', tempZipPath);
            });
        })
            .then(function (path) {
            return react_native_blob_util_1.default.fs.stat(path).then(function (_a) {
                var size = _a.size;
                setFile({
                    path: path,
                    newFileName: zipFileName,
                    size: size,
                });
            });
        })
            .catch(function (error) {
            console.error('Failed to write ZIP file:', error);
        })
            .finally(function () {
            zipRef.current = new jszip_1.default(); // Reset the zipRef for future use
        });
    };
    return (<BaseRecordTroubleshootDataToolMenu_1.default file={file} onEnableLogging={function () { return setFile(undefined); }} onDisableLogging={createAndSaveFile} pathToBeUsed={react_native_fs_1.default.DownloadDirectoryPath} showShareButton zipRef={zipRef} displayPath={CONST_1.default.DOWNLOADS_PATH}/>);
}
exports.default = RecordTroubleshootDataToolMenu;
