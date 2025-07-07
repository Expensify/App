"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_permissions_1 = require("react-native-permissions");
var useAppState_1 = require("@hooks/useAppState");
var index_1 = require("./index");
function useContactPermissions(_a) {
    var importAndSaveContacts = _a.importAndSaveContacts, setContacts = _a.setContacts, contactPermissionState = _a.contactPermissionState, setContactPermissionState = _a.setContactPermissionState;
    var checkPermissionAndUpdateContacts = (0, react_1.useCallback)(function () {
        return (0, index_1.getContactPermission)()
            .then(function (newStatus) {
            var isNewStatusGranted = newStatus === react_native_permissions_1.RESULTS.GRANTED || newStatus === react_native_permissions_1.RESULTS.LIMITED; // Permission is enabled, or just became enabled
            if (isNewStatusGranted) {
                importAndSaveContacts();
            }
            else {
                if (newStatus !== contactPermissionState) {
                    setContactPermissionState(newStatus);
                }
                setContacts([]);
            }
        })
            .catch(function (error) {
            // eslint-disable-next-line no-console
            console.error('Failed to check contact permission:', error);
        });
    }, [contactPermissionState, importAndSaveContacts, setContacts, setContactPermissionState]);
    var handleAppStateChange = (0, react_1.useCallback)(function (nextAppState) {
        if (nextAppState !== 'active') {
            return;
        }
        checkPermissionAndUpdateContacts();
    }, [checkPermissionAndUpdateContacts]);
    (0, useAppState_1.default)({ onAppStateChange: handleAppStateChange });
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        checkPermissionAndUpdateContacts();
    }, [checkPermissionAndUpdateContacts]));
}
exports.default = useContactPermissions;
