"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nitro_utils_1 = require("@expensify/nitro-utils");
var react_native_permissions_1 = require("react-native-permissions");
var ContactPermission_1 = require("@libs/ContactPermission");
function contactImport() {
    var permissionStatus = react_native_permissions_1.RESULTS.UNAVAILABLE;
    return (0, ContactPermission_1.getContactPermission)()
        .then(function (response) {
        permissionStatus = response;
        if (response !== react_native_permissions_1.RESULTS.GRANTED && response !== react_native_permissions_1.RESULTS.LIMITED) {
            return [];
        }
        return nitro_utils_1.ContactsNitroModule.getAll([nitro_utils_1.CONTACT_FIELDS.FIRST_NAME, nitro_utils_1.CONTACT_FIELDS.LAST_NAME, nitro_utils_1.CONTACT_FIELDS.PHONE_NUMBERS, nitro_utils_1.CONTACT_FIELDS.EMAIL_ADDRESSES, nitro_utils_1.CONTACT_FIELDS.IMAGE_DATA]);
    })
        .then(function (deviceContacts) { return ({
        contactList: Array.isArray(deviceContacts) ? deviceContacts : [],
        permissionStatus: permissionStatus,
    }); })
        .catch(function (error) {
        console.error('Error importing contacts:', error);
        return {
            contactList: [],
            permissionStatus: permissionStatus,
        };
    });
}
exports.default = contactImport;
