"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ImportOnyxState;
var react_1 = require("react");
var react_native_blob_util_1 = require("react-native-blob-util");
var useOnyx_1 = require("@hooks/useOnyx");
var App_1 = require("@libs/actions/App");
var Network_1 = require("@libs/actions/Network");
var PersistedRequests_1 = require("@libs/actions/PersistedRequests");
var ImportOnyxStateUtils_1 = require("@libs/ImportOnyxStateUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var BaseImportOnyxState_1 = require("./BaseImportOnyxState");
function readOnyxFile(fileUri) {
    var filePath = decodeURIComponent(fileUri.replace('file://', ''));
    return react_native_blob_util_1.default.fs.exists(filePath).then(function (exists) {
        if (!exists) {
            throw new Error('File does not exist');
        }
        return react_native_blob_util_1.default.fs.readFile(filePath, 'utf8');
    });
}
function ImportOnyxState(_a) {
    var setIsLoading = _a.setIsLoading;
    var _b = (0, react_1.useState)(false), isErrorModalVisible = _b[0], setIsErrorModalVisible = _b[1];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var handleFileRead = function (file) {
        if (!file.uri) {
            return;
        }
        setIsLoading(true);
        readOnyxFile(file.uri)
            .then(function (fileContent) {
            (0, PersistedRequests_1.rollbackOngoingRequest)();
            var transformedState = (0, ImportOnyxStateUtils_1.cleanAndTransformState)(fileContent);
            var currentUserSessionCopy = __assign({}, session);
            (0, App_1.setPreservedUserSession)(currentUserSessionCopy);
            (0, Network_1.setShouldForceOffline)(true);
            return (0, ImportOnyxStateUtils_1.importState)(transformedState);
        })
            .then(function () {
            (0, App_1.setIsUsingImportedState)(true);
            Navigation_1.default.navigate(ROUTES_1.default.HOME);
        })
            .catch(function (error) {
            console.error('Error importing state:', error);
            setIsErrorModalVisible(true);
        })
            .finally(function () {
            setIsLoading(false);
        });
    };
    return (<BaseImportOnyxState_1.default onFileRead={handleFileRead} isErrorModalVisible={isErrorModalVisible} setIsErrorModalVisible={setIsErrorModalVisible}/>);
}
