"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var PersistedRequests = require("../../src/libs/actions/PersistedRequests");
var ONYXKEYS_1 = require("../../src/ONYXKEYS");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var wrapOnyxWithWaitForBatchedUpdates_1 = require("../utils/wrapOnyxWithWaitForBatchedUpdates");
var request = {
    command: 'OpenReport',
    successData: [{ key: 'reportMetadata_1', onyxMethod: 'merge', value: {} }],
    failureData: [{ key: 'reportMetadata_2', onyxMethod: 'merge', value: {} }],
    requestID: 1,
};
beforeAll(function () {
    return react_native_onyx_1.default.init({
        keys: ONYXKEYS_1.default,
        evictableKeys: [ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS],
    });
});
beforeEach(function () {
    (0, wrapOnyxWithWaitForBatchedUpdates_1.default)(react_native_onyx_1.default);
    PersistedRequests.clear();
    PersistedRequests.save(request);
});
afterEach(function () {
    PersistedRequests.clear();
    react_native_onyx_1.default.clear();
});
describe('PersistedRequests', function () {
    it('save a request without conflicts', function () {
        PersistedRequests.save(request);
        expect(PersistedRequests.getAll().length).toBe(2);
    });
    it('remove a request from the PersistedRequests array', function () {
        PersistedRequests.endRequestAndRemoveFromQueue(request);
        expect(PersistedRequests.getAll().length).toBe(0);
    });
    it('when process the next request, queue should be empty', function () {
        var nextRequest = PersistedRequests.processNextRequest();
        expect(PersistedRequests.getAll().length).toBe(0);
        expect(nextRequest).toEqual(request);
    });
    it('when onyx persist the request, it should remove from the list the ongoing request', function () {
        expect(PersistedRequests.getAll().length).toBe(1);
        var request2 = {
            command: 'AddComment',
            successData: [{ key: 'reportMetadata_3', onyxMethod: 'merge', value: {} }],
            failureData: [{ key: 'reportMetadata_4', onyxMethod: 'merge', value: {} }],
            requestID: 2,
        };
        PersistedRequests.save(request2);
        PersistedRequests.processNextRequest();
        return (0, waitForBatchedUpdates_1.default)().then(function () {
            expect(PersistedRequests.getAll().length).toBe(1);
            expect(PersistedRequests.getAll().at(0)).toEqual(request2);
        });
    });
    it('update the request at the given index with new data', function () {
        var newRequest = {
            command: 'OpenReport',
            successData: [{ key: 'reportMetadata_1', onyxMethod: 'set', value: {} }],
            failureData: [{ key: 'reportMetadata_2', onyxMethod: 'set', value: {} }],
            requestID: 3,
        };
        PersistedRequests.update(0, newRequest);
        expect(PersistedRequests.getAll().at(0)).toEqual(newRequest);
    });
    it('update the ongoing request with new data', function () {
        var newRequest = {
            command: 'OpenReport',
            successData: [{ key: 'reportMetadata_1', onyxMethod: 'set', value: {} }],
            failureData: [{ key: 'reportMetadata_2', onyxMethod: 'set', value: {} }],
            requestID: 4,
        };
        PersistedRequests.updateOngoingRequest(newRequest);
        expect(PersistedRequests.getOngoingRequest()).toEqual(newRequest);
    });
    it('when removing a request should update the persistedRequests queue and clear the ongoing request', function () {
        PersistedRequests.processNextRequest();
        expect(PersistedRequests.getOngoingRequest()).toEqual(request);
        PersistedRequests.endRequestAndRemoveFromQueue(request);
        expect(PersistedRequests.getOngoingRequest()).toBeNull();
        expect(PersistedRequests.getAll().length).toBe(0);
    });
});
