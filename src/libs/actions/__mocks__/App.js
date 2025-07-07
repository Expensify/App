"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEYS_TO_PRESERVE = exports.updateLastVisitedPath = exports.createWorkspaceWithPolicyDraftAndNavigateToIt = exports.savePolicyDraftByNewWorkspace = exports.finalReconnectAppAfterActivatingReliableUpdates = exports.beginDeepLinkRedirectAfterTransition = exports.beginDeepLinkRedirect = exports.handleRestrictedEvent = exports.confirmReadyToOpenApp = exports.reconnectApp = exports.openApp = exports.redirectThirdPartyDesktopSignIn = exports.setUpPoliciesAndNavigate = exports.setSidebarLoaded = exports.setLocaleAndNavigate = exports.setLocale = exports.mockValues = exports.getMissingOnyxUpdates = void 0;
var OnyxUpdates = require("@userActions/OnyxUpdates");
var createProxyForObject_1 = require("@src/utils/createProxyForObject");
jest.mock('@libs/actions/OnyxUpdates');
jest.mock('@libs/actions/OnyxUpdateManager/utils/applyUpdates');
var AppImplementation = jest.requireActual('@libs/actions/App');
var setLocale = AppImplementation.setLocale, setLocaleAndNavigate = AppImplementation.setLocaleAndNavigate, setSidebarLoaded = AppImplementation.setSidebarLoaded, setUpPoliciesAndNavigate = AppImplementation.setUpPoliciesAndNavigate, redirectThirdPartyDesktopSignIn = AppImplementation.redirectThirdPartyDesktopSignIn, openApp = AppImplementation.openApp, reconnectApp = AppImplementation.reconnectApp, confirmReadyToOpenApp = AppImplementation.confirmReadyToOpenApp, handleRestrictedEvent = AppImplementation.handleRestrictedEvent, beginDeepLinkRedirect = AppImplementation.beginDeepLinkRedirect, beginDeepLinkRedirectAfterTransition = AppImplementation.beginDeepLinkRedirectAfterTransition, finalReconnectAppAfterActivatingReliableUpdates = AppImplementation.finalReconnectAppAfterActivatingReliableUpdates, savePolicyDraftByNewWorkspace = AppImplementation.savePolicyDraftByNewWorkspace, createWorkspaceWithPolicyDraftAndNavigateToIt = AppImplementation.createWorkspaceWithPolicyDraftAndNavigateToIt, updateLastVisitedPath = AppImplementation.updateLastVisitedPath, KEYS_TO_PRESERVE = AppImplementation.KEYS_TO_PRESERVE;
exports.setLocale = setLocale;
exports.setLocaleAndNavigate = setLocaleAndNavigate;
exports.setSidebarLoaded = setSidebarLoaded;
exports.setUpPoliciesAndNavigate = setUpPoliciesAndNavigate;
exports.redirectThirdPartyDesktopSignIn = redirectThirdPartyDesktopSignIn;
exports.openApp = openApp;
exports.reconnectApp = reconnectApp;
exports.confirmReadyToOpenApp = confirmReadyToOpenApp;
exports.handleRestrictedEvent = handleRestrictedEvent;
exports.beginDeepLinkRedirect = beginDeepLinkRedirect;
exports.beginDeepLinkRedirectAfterTransition = beginDeepLinkRedirectAfterTransition;
exports.finalReconnectAppAfterActivatingReliableUpdates = finalReconnectAppAfterActivatingReliableUpdates;
exports.savePolicyDraftByNewWorkspace = savePolicyDraftByNewWorkspace;
exports.createWorkspaceWithPolicyDraftAndNavigateToIt = createWorkspaceWithPolicyDraftAndNavigateToIt;
exports.updateLastVisitedPath = updateLastVisitedPath;
exports.KEYS_TO_PRESERVE = KEYS_TO_PRESERVE;
var mockValues = {
    missingOnyxUpdatesToBeApplied: undefined,
};
var mockValuesProxy = (0, createProxyForObject_1.default)(mockValues);
exports.mockValues = mockValuesProxy;
var getMissingOnyxUpdates = jest.fn(function (updateIDFrom, updateIDTo) {
    var _a;
    var updates = (_a = mockValuesProxy.missingOnyxUpdatesToBeApplied) !== null && _a !== void 0 ? _a : [];
    if (updates.length === 0) {
        for (var i = updateIDFrom + 1; i <= updateIDTo; i++) {
            updates.push({
                lastUpdateID: i,
                previousUpdateID: i - 1,
            });
        }
    }
    var chain = Promise.resolve();
    updates.forEach(function (update) {
        chain = chain.then(function () {
            if (!OnyxUpdates.doesClientNeedToBeUpdated({ previousUpdateID: Number(update.previousUpdateID) })) {
                return OnyxUpdates.apply(update).then(function () { return undefined; });
            }
            OnyxUpdates.saveUpdateInformation(update);
            return Promise.resolve();
        });
    });
    return chain;
});
exports.getMissingOnyxUpdates = getMissingOnyxUpdates;
