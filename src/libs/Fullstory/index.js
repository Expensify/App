"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FSPage = void 0;
exports.parseFSAttributes = parseFSAttributes;
exports.getFSAttributes = getFSAttributes;
exports.getChatFSAttributes = getChatFSAttributes;
var browser_1 = require("@fullstory/browser");
var expensify_common_1 = require("expensify-common");
var ReportUtils_1 = require("@libs/ReportUtils");
var Session = require("@userActions/Session");
var CONST_1 = require("@src/CONST");
var Environment = require("@src/libs/Environment/Environment");
/**
 * Extract values from non-scraped at build time attribute WEB_PROP_ATTR,
 * reevaluate "fs-class".
 */
function parseFSAttributes() {
    var _a;
    (_a = window === null || window === void 0 ? void 0 : window.document) === null || _a === void 0 ? void 0 : _a.querySelectorAll("[".concat(CONST_1.default.FULL_STORY.WEB_PROP_ATTR, "]")).forEach(function (o) {
        var _a, _b;
        var attr = (_a = o.getAttribute(CONST_1.default.FULL_STORY.WEB_PROP_ATTR)) !== null && _a !== void 0 ? _a : '';
        if (!/fs-/gim.test(attr)) {
            return;
        }
        var fsAttrs = (_b = attr.match(/fs-[a-zA-Z0-9_-]+/g)) !== null && _b !== void 0 ? _b : [];
        o.setAttribute('fs-class', fsAttrs.join(','));
        var cleanedAttrs = attr;
        fsAttrs.forEach(function (fsAttr) {
            cleanedAttrs = cleanedAttrs.replace(fsAttr, '');
        });
        cleanedAttrs = cleanedAttrs
            .replace(/,+/g, ',')
            .replace(/\s*,\s*/g, ',')
            .replace(/^,+|,+$/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        if (cleanedAttrs) {
            o.setAttribute(CONST_1.default.FULL_STORY.WEB_PROP_ATTR, cleanedAttrs);
        }
        else {
            o.removeAttribute(CONST_1.default.FULL_STORY.WEB_PROP_ATTR);
        }
    });
}
/*
    prefix? if component name should be used as a prefix,
    in case data-test-id attribute usage,
    clean component name should be preserved in data-test-id.
*/
function getFSAttributes(name, mask, prefix) {
    if (!name) {
        return "".concat(mask ? CONST_1.default.FULL_STORY.MASK : CONST_1.default.FULL_STORY.UNMASK);
    }
    if (prefix) {
        return "".concat(name, ",").concat(mask ? CONST_1.default.FULL_STORY.MASK : CONST_1.default.FULL_STORY.UNMASK);
    }
    return "".concat(name);
}
function getChatFSAttributes(context, name, report) {
    if (!name) {
        return ['', ''];
    }
    if ((0, ReportUtils_1.isConciergeChatReport)(report)) {
        var formattedName_1 = "".concat(CONST_1.default.FULL_STORY.CONCIERGE, "-").concat(name);
        return ["".concat(formattedName_1, ",").concat(CONST_1.default.FULL_STORY.UNMASK), "".concat(formattedName_1)];
    }
    if ((0, ReportUtils_1.shouldUnmaskChat)(context, report)) {
        var formattedName_2 = "".concat(CONST_1.default.FULL_STORY.CUSTOMER, "-").concat(name);
        return ["".concat(formattedName_2, ",").concat(CONST_1.default.FULL_STORY.UNMASK), "".concat(formattedName_2)];
    }
    var formattedName = "".concat(CONST_1.default.FULL_STORY.OTHER, "-").concat(name);
    return ["".concat(formattedName, ",").concat(CONST_1.default.FULL_STORY.MASK), "".concat(formattedName)];
}
// Placeholder Browser API does not support Manual Page definition
var FSPage = /** @class */ (function () {
    function FSPage(name, properties) {
        this.pageName = name;
        this.properties = properties;
    }
    FSPage.prototype.start = function () {
        parseFSAttributes();
    };
    return FSPage;
}());
exports.FSPage = FSPage;
/**
 * Web does not use Fullstory React-Native lib
 * Proxy function calls to Browser Snippet instance
 * */
var FS = {
    /**
     * Executes a function when the FullStory library is ready, either by initialization or by observing the start event.
     */
    onReady: function () {
        return new Promise(function (resolve) {
            if (!(0, browser_1.isInitialized)()) {
                (0, browser_1.init)({ orgId: 'o-1WN56P-na1' }, resolve);
                // FS init function might have a race condition with the head snippet. If the head snipped is loaded first,
                // then the init function will not call the resolve function, and we'll never identify the user logging in,
                // and we need to call resolve manually. We're adding a 1s timeout to make sure the init function has enough
                // time to call the resolve function in case it ran successfully.
                setTimeout(resolve, 1000);
            }
            else {
                (0, browser_1.FullStory)(CONST_1.default.FULL_STORY.OBSERVE, { type: 'start', callback: resolve });
            }
        });
    },
    /**
     * Sets the identity as anonymous using the FullStory library.
     */
    anonymize: function () { return (0, browser_1.FullStory)(CONST_1.default.FULL_STORY.SET_IDENTITY, { anonymous: true }); },
    /**
     * Sets the identity consent status using the FullStory library.
     */
    consent: function (c) { return (0, browser_1.FullStory)(CONST_1.default.FULL_STORY.SET_IDENTITY, { consent: c }); },
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
            Environment.getEnvironment().then(function (envName) {
                var _a;
                var isTestEmail = value.email !== undefined && value.email.startsWith('fullstory') && value.email.endsWith(CONST_1.default.EMAIL.QA_DOMAIN);
                if ((CONST_1.default.ENVIRONMENT.PRODUCTION !== envName && !isTestEmail) ||
                    expensify_common_1.Str.extractEmailDomain((_a = value.email) !== null && _a !== void 0 ? _a : '') === CONST_1.default.EXPENSIFY_PARTNER_NAME ||
                    Session.isSupportAuthToken()) {
                    // On web, if we started FS at some point in a browser, it will run forever. So let's shut it down if we don't want it to run.
                    if ((0, browser_1.isInitialized)()) {
                        (0, browser_1.FullStory)(CONST_1.default.FULL_STORY.SHUTDOWN);
                    }
                    return;
                }
                // If Fullstory was already initialized, we might have shutdown the session. So let's
                // restart it before identifying the user.
                if ((0, browser_1.isInitialized)()) {
                    (0, browser_1.FullStory)(CONST_1.default.FULL_STORY.RESTART);
                }
                FS.onReady().then(function () {
                    FS.consent(true);
                    var localMetadata = value;
                    localMetadata.environment = envName;
                    FS.fsIdentify(localMetadata);
                });
            });
        }
        catch (e) {
            // error handler
        }
    },
    /**
     * Sets the FullStory user identity based on the provided metadata information.
     * If the metadata does not contain an email, the user identity is anonymized.
     * If the metadata contains an accountID, the user identity is defined with it.
     */
    fsIdentify: function (metadata) {
        (0, browser_1.FullStory)(CONST_1.default.FULL_STORY.SET_IDENTITY, {
            uid: String(metadata.accountID),
            properties: metadata,
        });
    },
    /**
     * Init function, created so we're consistent with the native file
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    init: function (_value) { },
};
exports.default = FS;
