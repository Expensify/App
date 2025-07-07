"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReady = exports.isClientTheLeader = exports.init = void 0;
/**
 * When you have many tabs in one browser, the data of Onyx is shared between all of them. Since we persist write requests in Onyx, we need to ensure that
 * only one tab is processing those saved requests or we would be duplicating data (or creating errors).
 * This file ensures exactly that by tracking all the clientIDs connected, storing the most recent one last and it considers that last clientID the "leader".
 */
var expensify_common_1 = require("expensify-common");
var react_native_onyx_1 = require("react-native-onyx");
var index_website_1 = require("@libs/Browser/index.website");
var ActiveClients_1 = require("@userActions/ActiveClients");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var clientID = expensify_common_1.Str.guid();
var maxClients = 20;
var activeClients = [];
var resolveSavedSelfPromise;
var savedSelfPromise = new Promise(function (resolve) {
    resolveSavedSelfPromise = resolve;
});
var beforeunloadListenerAdded = false;
/**
 * Determines when the client is ready. We need to wait both till we saved our ID in onyx AND the init method was called
 */
var isReady = function () { return savedSelfPromise; };
exports.isReady = isReady;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.ACTIVE_CLIENTS,
    callback: function (val) {
        if (!val) {
            return;
        }
        activeClients = val;
        // Remove from the beginning of the list any clients that are past the limit, to avoid having thousands of them
        var removed = false;
        while (activeClients.length >= maxClients) {
            activeClients.shift();
            removed = true;
        }
        // Save the clients back to onyx, if they changed
        if (removed) {
            (0, ActiveClients_1.setActiveClients)(activeClients);
        }
    },
});
var isPromotingNewLeader = false;
/**
 * The last GUID is the most recent GUID, so that should be the leader
 */
var isClientTheLeader = function () {
    /**
     * When a new leader is being promoted, there is a brief period during which the current leader's clientID
     * is removed from the activeClients list due to asynchronous operations, but the new leader has not officially
     * taken over yet. This can result in a situation where, upon page refresh, multiple leaders are being reported.
     * This early return statement here will prevent that from happening by maintaining the current leader as
     * the 'active leader' until the other leader is fully promoted.
     */
    if (isPromotingNewLeader) {
        return true;
    }
    var lastActiveClient = activeClients.length && activeClients.at(-1);
    return lastActiveClient === clientID;
};
exports.isClientTheLeader = isClientTheLeader;
var cleanUpClientId = function () {
    isPromotingNewLeader = isClientTheLeader();
    activeClients = activeClients.filter(function (id) { return id !== clientID; });
    (0, ActiveClients_1.setActiveClients)(activeClients);
};
var removeBeforeUnloadListener = function () {
    if (!beforeunloadListenerAdded) {
        return;
    }
    beforeunloadListenerAdded = false;
    window.removeEventListener('beforeunload', cleanUpClientId);
};
/**
 * Add our client ID to the list of active IDs.
 * We want to ensure we have no duplicates and that the activeClient gets added at the end of the array (see isClientTheLeader)
 */
var init = function () {
    removeBeforeUnloadListener();
    activeClients = activeClients.filter(function (id) { return id !== clientID; });
    activeClients.push(clientID);
    (0, ActiveClients_1.setActiveClients)(activeClients).then(resolveSavedSelfPromise);
    beforeunloadListenerAdded = true;
    window.addEventListener('beforeunload', function () {
        // When we open route in desktop, beforeunload is fired unexpectedly here.
        // So we should return early in this case to prevent cleaning the clientID
        if ((0, index_website_1.isOpeningRouteInDesktop)()) {
            (0, index_website_1.resetIsOpeningRouteInDesktop)();
            return;
        }
        cleanUpClientId();
    });
};
exports.init = init;
