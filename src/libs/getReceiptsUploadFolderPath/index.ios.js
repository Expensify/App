"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_blob_util_1 = require("react-native-blob-util");
var CONST_1 = require("@src/CONST");
var getReceiptsUploadFolderPath = function () { return "".concat(react_native_blob_util_1.default.fs.dirs.DocumentDir).concat(CONST_1.default.RECEIPTS_UPLOAD_PATH); };
exports.default = getReceiptsUploadFolderPath;
