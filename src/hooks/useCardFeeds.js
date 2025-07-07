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
var react_1 = require("react");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useOnyx_1 = require("./useOnyx");
var useWorkspaceAccountID_1 = require("./useWorkspaceAccountID");
/**
 * This is a custom hook that combines workspace and domain card feeds for a given policy.
 *
 * This hook:
 * - Gets all available feeds (ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER) from Onyx.
 * - Extracts and compiles card feeds data including only feeds where the `preferredPolicy` matches the `policyID`.
 * - Merges a workspace feed with relevant domain feeds.
 *
 * @param policyID - The workspace policyID to filter and construct card feeds for.
 * @returns -
 *   A tuple containing:
 *     1. Card feeds specific to the given policyID (or `undefined` if unavailable).
 *     2. The result metadata from the Onyx collection fetch.
 */
var useCardFeeds = function (policyID) {
    var workspaceAccountID = (0, useWorkspaceAccountID_1.default)(policyID);
    var _a = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER, { canBeMissing: true }), allFeeds = _a[0], allFeedsResult = _a[1];
    var workspaceFeeds = (0, react_1.useMemo)(function () {
        var _a;
        if (!policyID || !allFeeds) {
            return undefined;
        }
        var defaultFeed = allFeeds === null || allFeeds === void 0 ? void 0 : allFeeds["".concat(ONYXKEYS_1.default.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER).concat(workspaceAccountID)];
        var _b = (_a = defaultFeed === null || defaultFeed === void 0 ? void 0 : defaultFeed.settings) !== null && _a !== void 0 ? _a : {}, _c = _b.companyCards, companyCards = _c === void 0 ? {} : _c, _d = _b.companyCardNicknames, companyCardNicknames = _d === void 0 ? {} : _d, _e = _b.oAuthAccountDetails, oAuthAccountDetails = _e === void 0 ? {} : _e;
        var result = {
            settings: {
                companyCards: __assign({}, companyCards),
                companyCardNicknames: __assign({}, companyCardNicknames),
                oAuthAccountDetails: __assign({}, oAuthAccountDetails),
            },
            isLoading: defaultFeed === null || defaultFeed === void 0 ? void 0 : defaultFeed.isLoading,
        };
        return Object.entries(allFeeds).reduce(function (acc, _a) {
            var _b;
            var onyxKey = _a[0], feed = _a[1];
            if (!((_b = feed === null || feed === void 0 ? void 0 : feed.settings) === null || _b === void 0 ? void 0 : _b.companyCards)) {
                return acc;
            }
            Object.entries(feed.settings.companyCards).forEach(function (_a) {
                var _b, _c;
                var key = _a[0], feedSettings = _a[1];
                var feedName = key;
                var feedOAuthAccountDetails = (_b = feed.settings.oAuthAccountDetails) === null || _b === void 0 ? void 0 : _b[feedName];
                var feedCompanyCardNicknames = (_c = feed.settings.companyCardNicknames) === null || _c === void 0 ? void 0 : _c[feedName];
                if (feedSettings.preferredPolicy !== policyID || acc.settings.companyCards[feedName]) {
                    return;
                }
                var domainID = onyxKey.split('_').at(-1);
                acc.settings.companyCards[feedName] = __assign(__assign({}, feedSettings), { domainID: domainID ? Number(domainID) : undefined });
                if (feedOAuthAccountDetails) {
                    acc.settings.oAuthAccountDetails[feedName] = feedOAuthAccountDetails;
                }
                if (feedCompanyCardNicknames) {
                    acc.settings.companyCardNicknames[feedName] = feedCompanyCardNicknames;
                }
            });
            return acc;
        }, result);
    }, [allFeeds, policyID, workspaceAccountID]);
    return [workspaceFeeds, allFeedsResult];
};
exports.default = useCardFeeds;
