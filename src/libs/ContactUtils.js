"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
var OptionsListUtils_1 = require("./OptionsListUtils");
var RandomAvatarUtils_1 = require("./RandomAvatarUtils");
function sortEmailObjects(emails) {
    if (!(emails === null || emails === void 0 ? void 0 : emails.length)) {
        return [];
    }
    var expensifyDomain = CONST_1.default.EMAIL.EXPENSIFY_EMAIL_DOMAIN.toLowerCase();
    var filteredEmails = [];
    for (var _i = 0, emails_1 = emails; _i < emails_1.length; _i++) {
        var email = emails_1[_i];
        if (email === null || email === void 0 ? void 0 : email.value) {
            filteredEmails.push(email.value);
        }
    }
    return filteredEmails.sort(function (a, b) {
        var isExpensifyA = a.toLowerCase().includes(expensifyDomain);
        var isExpensifyB = b.toLowerCase().includes(expensifyDomain);
        // Prioritize Expensify emails, then sort alphabetically
        return isExpensifyA !== isExpensifyB ? Number(isExpensifyB) - Number(isExpensifyA) : a.localeCompare(b);
    });
}
var getContacts = function (deviceContacts) {
    return deviceContacts
        .map(function (contact) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        var email = (_c = (_b = sortEmailObjects((_a = contact === null || contact === void 0 ? void 0 : contact.emailAddresses) !== null && _a !== void 0 ? _a : [])) === null || _b === void 0 ? void 0 : _b.at(0)) !== null && _c !== void 0 ? _c : '';
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        var avatarSource = (_d = ((contact === null || contact === void 0 ? void 0 : contact.imageData) || RandomAvatarUtils_1.default.getAvatarForContact("".concat(contact === null || contact === void 0 ? void 0 : contact.firstName).concat(email).concat(contact === null || contact === void 0 ? void 0 : contact.lastName)))) !== null && _d !== void 0 ? _d : '';
        var phoneNumber = (_g = (_f = (_e = contact.phoneNumbers) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.value) !== null && _g !== void 0 ? _g : '';
        var firstName = (_h = contact === null || contact === void 0 ? void 0 : contact.firstName) !== null && _h !== void 0 ? _h : '';
        var lastName = (_j = contact === null || contact === void 0 ? void 0 : contact.lastName) !== null && _j !== void 0 ? _j : '';
        return (0, OptionsListUtils_1.getUserToInviteContactOption)({
            selectedOptions: [],
            optionsToExclude: [],
            searchValue: email || phoneNumber || firstName || '',
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phoneNumber,
            avatar: avatarSource,
        });
    })
        .filter(function (contact) { return contact !== null; });
};
exports.default = getContacts;
