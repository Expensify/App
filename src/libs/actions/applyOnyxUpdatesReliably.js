"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = applyOnyxUpdatesReliably;
var Log_1 = require("@libs/Log");
var SequentialQueue = require("@libs/Network/SequentialQueue");
var CONST_1 = require("@src/CONST");
var OnyxUpdateManager_1 = require("./OnyxUpdateManager");
var OnyxUpdates_1 = require("./OnyxUpdates");
/**
 * Checks for and handles gaps of onyx updates between the client and the given server updates before applying them
 *
 * This is in it's own lib to fix a dependency cycle from OnyxUpdateManager
 *
 * @param updates
 * @param shouldRunSync
 * @returns
 */
function applyOnyxUpdatesReliably(updates, _a) {
    var _b;
    var _c = _a === void 0 ? {} : _a, _d = _c.shouldRunSync, shouldRunSync = _d === void 0 ? false : _d, clientLastUpdateID = _c.clientLastUpdateID;
    var fetchMissingUpdates = function () {
        Log_1.default.info('[applyOnyxUpdatesReliably] Fetching missing updates');
        // If we got here, that means we are missing some updates on our local storage. To
        // guarantee that we're not fetching more updates before our local data is up to date,
        // let's stop the sequential queue from running until we're done catching up.
        SequentialQueue.pause();
        if (shouldRunSync) {
            (0, OnyxUpdateManager_1.handleMissingOnyxUpdates)(updates, clientLastUpdateID);
        }
        else {
            (0, OnyxUpdates_1.saveUpdateInformation)(updates);
        }
    };
    // If a pendingLastUpdateID is was provided, it means that the backend didn't send updates because the payload was too big.
    // In this case, we need to fetch the missing updates up to the pendingLastUpdateID.
    if (updates.shouldFetchPendingUpdates) {
        fetchMissingUpdates();
        return;
    }
    var previousUpdateID = (_b = Number(updates.previousUpdateID)) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    if (!(0, OnyxUpdates_1.doesClientNeedToBeUpdated)({ previousUpdateID: previousUpdateID, clientLastUpdateID: clientLastUpdateID })) {
        (0, OnyxUpdates_1.apply)(updates);
        return;
    }
    fetchMissingUpdates();
}
