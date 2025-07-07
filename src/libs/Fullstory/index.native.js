"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FSPage = void 0;
exports.parseFSAttributes = parseFSAttributes;
exports.getFSAttributes = getFSAttributes;
exports.getChatFSAttributes = getChatFSAttributes;
var react_native_1 = require("@fullstory/react-native");
Object.defineProperty(exports, "FSPage", { enumerable: true, get: function () { return react_native_1.FSPage; } });
var expensify_common_1 = require("expensify-common");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var Environment = require("@src/libs/Environment/Environment");
/**
 * Fullstory React-Native lib adapter
 * Proxy function calls to React-Native lib
 * */
var FS = {
    /**
     * Initializes FullStory
     */
    init: function (value) {
        FS.consentAndIdentify(value);
    },
    /**
     * Sets the identity as anonymous using the FullStory library.
     */
    anonymize: function () { return react_native_1.default.anonymize(); },
    /**
     * Sets the identity consent status using the FullStory library.
     */
    consent: function (c) { return react_native_1.default.consent(c); },
    /**
     * Initializes the FullStory metadata with the provided metadata information.
     */
    consentAndIdentify: function (value) {
        // On the first subscribe for UserMetadata, this function will be called. We need
        // to confirm that we actually have any value here before proceeding.
        if (!(value === null || value === void 0 ? void 0 : value.accountID)) {
            return;
        }
        try {
            // We only use FullStory in production environment. We need to check this here
            // after the init function since this function is also called on updates for
            // UserMetadata onyx key.
            Environment.getEnvironment().then(function (envName) {
                var _a;
                var isTestEmail = value.email !== undefined && value.email.startsWith('fullstory') && value.email.endsWith(CONST_1.default.EMAIL.QA_DOMAIN);
                if ((CONST_1.default.ENVIRONMENT.PRODUCTION !== envName && !isTestEmail) || expensify_common_1.Str.extractEmailDomain((_a = value.email) !== null && _a !== void 0 ? _a : '') === CONST_1.default.EXPENSIFY_PARTNER_NAME) {
                    return;
                }
                react_native_1.default.restart();
                react_native_1.default.consent(true);
                FS.fsIdentify(value, envName);
            });
        }
        catch (e) {
            // error handler
        }
    },
    /**
     * Sets the FullStory user identity based on the provided metadata information.
     */
    fsIdentify: function (metadata, envName) {
        var localMetadata = metadata;
        localMetadata.environment = envName;
        react_native_1.default.identify(String(localMetadata.accountID), localMetadata);
    },
};
/**
 * Placeholder function for Mobile-Web compatibility.
 */
function parseFSAttributes() {
    // pass
}
/*
    prefix? if component name should be used as a prefix,
    in case data-test-id attribute usage,
    clean component name should be preserved in data-test-id.
*/
function getFSAttributes(name, mask, prefix) {
    if (!name && !prefix) {
        return "".concat(mask ? CONST_1.default.FULL_STORY.MASK : CONST_1.default.FULL_STORY.UNMASK);
    }
    // prefixed for Native apps should contain only component name
    if (prefix) {
        return name;
    }
    return "".concat(name, ",").concat(mask ? CONST_1.default.FULL_STORY.MASK : CONST_1.default.FULL_STORY.UNMASK);
}
function getChatFSAttributes(context, name, report) {
    if (!name) {
        return ['', ''];
    }
    if ((0, ReportUtils_1.isConciergeChatReport)(report)) {
        var formattedName_1 = "".concat(CONST_1.default.FULL_STORY.CONCIERGE, "-").concat(name);
        return ["".concat(formattedName_1), "".concat(CONST_1.default.FULL_STORY.UNMASK, ",").concat(formattedName_1)];
    }
    if ((0, ReportUtils_1.shouldUnmaskChat)(context, report)) {
        var formattedName_2 = "".concat(CONST_1.default.FULL_STORY.CUSTOMER, "-").concat(name);
        return ["".concat(formattedName_2), "".concat(CONST_1.default.FULL_STORY.UNMASK, ",").concat(formattedName_2)];
    }
    var formattedName = "".concat(CONST_1.default.FULL_STORY.OTHER, "-").concat(name);
    return ["".concat(formattedName), "".concat(CONST_1.default.FULL_STORY.MASK, ",").concat(formattedName)];
}
exports.default = FS;
