"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
function getDownloadFolderPathSuffixForIOS(environment) {
    var folderSuffix = '';
    switch (environment) {
        case CONST_1.default.ENVIRONMENT.PRODUCTION:
            folderSuffix = '';
            break;
        case CONST_1.default.ENVIRONMENT.ADHOC:
            folderSuffix = CONST_1.default.ENVIRONMENT_SUFFIX.ADHOC;
            break;
        case CONST_1.default.ENVIRONMENT.DEV:
            folderSuffix = CONST_1.default.ENVIRONMENT_SUFFIX.DEV;
            break;
        default:
            folderSuffix = '';
            break;
    }
    return folderSuffix;
}
exports.default = getDownloadFolderPathSuffixForIOS;
