"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jszip_1 = require("jszip");
var react_1 = require("react");
var useOnyx_1 = require("@hooks/useOnyx");
var ExportOnyxState_1 = require("@libs/ExportOnyxState");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var BaseRecordTroubleshootDataToolMenu_1 = require("./BaseRecordTroubleshootDataToolMenu");
function RecordTroubleshootDataToolMenu() {
    var _a = (0, react_1.useState)(undefined), file = _a[0], setFile = _a[1];
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.SHOULD_MASK_ONYX_STATE, { canBeMissing: true })[0], shouldMaskOnyxState = _b === void 0 ? true : _b;
    var zipRef = (0, react_1.useRef)(new jszip_1.default());
    var onDisableLogging = function (logs) {
        var data = JSON.stringify(logs, null, 2);
        var newFileName = (0, FileUtils_1.appendTimeToFileName)('logs.txt');
        zipRef.current.file(newFileName, data);
        return ExportOnyxState_1.default.readFromOnyxDatabase()
            .then(function (value) {
            var dataToShare = JSON.stringify(ExportOnyxState_1.default.maskOnyxState(value, shouldMaskOnyxState));
            zipRef.current.file(CONST_1.default.DEFAULT_ONYX_DUMP_FILE_NAME, dataToShare);
        })
            .then(function () {
            setFile({
                path: './logs',
                newFileName: 'logs',
                size: data.length,
            });
        });
    };
    var hideShareButton = function () {
        setFile(undefined);
    };
    var onDownloadZip = function () {
        var _a;
        if (!((_a = zipRef.current) === null || _a === void 0 ? void 0 : _a.files)) {
            return;
        }
        zipRef.current.generateAsync({ type: 'blob' }).then(function (zipBlob) {
            var zipUrl = URL.createObjectURL(zipBlob);
            var link = document.createElement('a');
            link.href = zipUrl;
            link.download = 'troubleshoot.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            zipRef.current = new jszip_1.default();
        });
    };
    return (<BaseRecordTroubleshootDataToolMenu_1.default zipRef={zipRef} file={file} onDisableLogging={onDisableLogging} onEnableLogging={hideShareButton} pathToBeUsed="" onDownloadZip={onDownloadZip} showDownloadButton/>);
}
RecordTroubleshootDataToolMenu.displayName = 'RecordTroubleshootDataToolMenu';
exports.default = RecordTroubleshootDataToolMenu;
