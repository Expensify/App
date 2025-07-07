"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var picker_1 = require("@react-native-documents/picker");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_blob_util_1 = require("react-native-blob-util");
var useLocalize_1 = require("@hooks/useLocalize");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
/**
 * The data returned from `show` is different on web and mobile,
 * use this function to ensure the data will be handled properly.
 */
var getDataForUpload = function (fileData) {
    var _a, _b;
    var fileName = (_a = fileData.name) !== null && _a !== void 0 ? _a : 'spreadsheet';
    var fileResult = {
        name: (0, FileUtils_1.cleanFileName)(fileName),
        type: (_b = fileData.type) !== null && _b !== void 0 ? _b : undefined,
        uri: fileData.uri,
        size: fileData.size,
    };
    if (fileResult.size) {
        return Promise.resolve(fileResult);
    }
    return react_native_blob_util_1.default.fs.stat(fileData.uri.replace('file://', '')).then(function (stats) {
        fileResult.size = stats.size;
        return fileResult;
    });
};
function FilePicker(_a) {
    var _this = this;
    var children = _a.children;
    var completeFileSelection = (0, react_1.useRef)(function () { });
    var onCanceled = (0, react_1.useRef)(function () { });
    var translate = (0, useLocalize_1.default)().translate;
    /**
     * A generic handling for file picker errors
     */
    var showGeneralAlert = (0, react_1.useCallback)(function (message) {
        if (message === void 0) { message = translate('filePicker.errorWhileSelectingFile'); }
        react_native_1.Alert.alert(translate('filePicker.fileError'), message);
    }, [translate]);
    /**
     * Validates and completes file selection
     *
     * @param fileData The file data received from the picker
     */
    var validateAndCompleteFileSelection = (0, react_1.useCallback)(function (fileData) {
        if (!fileData) {
            onCanceled.current();
            return;
        }
        return getDataForUpload(fileData)
            .then(function (result) {
            completeFileSelection.current(result);
        })
            .catch(function (error) {
            showGeneralAlert(error.message);
            throw error;
        });
    }, [showGeneralAlert]);
    /**
     * Handles the file picker result and sends the selected file to the caller
     *
     * @param files The array of DocumentPickerResponse
     */
    // eslint-disable-next-line @lwc/lwc/no-async-await
    var pickFile = function () { return __awaiter(_this, void 0, void 0, function () {
        var file, localCopy;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, picker_1.pick)({
                        type: [picker_1.types.allFiles],
                    })];
                case 1:
                    file = (_c.sent())[0];
                    return [4 /*yield*/, (0, picker_1.keepLocalCopy)({
                            files: [
                                {
                                    uri: file.uri,
                                    fileName: (_a = file.name) !== null && _a !== void 0 ? _a : 'spreadsheet',
                                },
                            ],
                            destination: 'cachesDirectory',
                        })];
                case 2:
                    localCopy = (_c.sent())[0];
                    if (localCopy.status !== 'success') {
                        throw new Error("Couldn't create local file copy");
                    }
                    return [2 /*return*/, {
                            name: (0, FileUtils_1.cleanFileName)((_b = file.name) !== null && _b !== void 0 ? _b : 'spreadsheet'),
                            type: file.type,
                            uri: localCopy.localUri,
                            size: file.size,
                        }];
            }
        });
    }); };
    /**
     * Opens the file picker
     *
     * @param onPickedHandler A callback that will be called with the selected file
     * @param onCanceledHandler A callback that will be called if the file is canceled
     */
    // eslint-disable-next-line @lwc/lwc/no-async-await
    var open = function (onPickedHandler, onCanceledHandler) {
        if (onCanceledHandler === void 0) { onCanceledHandler = function () { }; }
        completeFileSelection.current = onPickedHandler;
        onCanceled.current = onCanceledHandler;
        pickFile()
            .catch(function (error) {
            if (JSON.stringify(error).includes('OPERATION_CANCELED')) {
                onCanceled.current();
                return Promise.resolve();
            }
            showGeneralAlert(error.message);
            throw error;
        })
            .then(validateAndCompleteFileSelection)
            .catch(console.error);
    };
    /**
     * Call the `children` render prop with the interface defined in propTypes
     */
    var renderChildren = function () {
        return children({
            openPicker: function (_a) {
                var onPicked = _a.onPicked, newOnCanceled = _a.onCanceled;
                return open(onPicked, newOnCanceled);
            },
        });
    };
    // eslint-disable-next-line react-compiler/react-compiler
    return <>{renderChildren()}</>;
}
FilePicker.displayName = 'FilePicker';
exports.default = FilePicker;
