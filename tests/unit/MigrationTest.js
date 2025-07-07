"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
var react_native_onyx_1 = require("react-native-onyx");
var Log_1 = require("@src/libs/Log");
var KeyReportActionsDraftByReportActionID_1 = require("@src/libs/migrations/KeyReportActionsDraftByReportActionID");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
jest.mock('@src/libs/getPlatform');
var LogSpy;
describe('Migrations', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({ keys: ONYXKEYS_1.default });
        LogSpy = jest.spyOn(Log_1.default, 'info');
        Log_1.default.serverLoggingCallback = function () { return Promise.resolve({ requestID: '123' }); };
        return (0, waitForBatchedUpdates_1.default)();
    });
    beforeEach(function () {
        jest.clearAllMocks();
        react_native_onyx_1.default.clear();
        return (0, waitForBatchedUpdates_1.default)();
    });
    describe('KeyReportActionsDraftByReportActionID', function () {
        it("Should work even if there's no reportActionsDrafts data in Onyx", function () {
            return (0, KeyReportActionsDraftByReportActionID_1.default)().then(function () {
                return expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] Skipped migration KeyReportActionsDraftByReportActionID because there were no reportActionsDrafts');
            });
        });
        it('Should move individual draft to a draft collection of report', function () {
            var setQueries = {};
            setQueries["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS, "1_1")] = 'a';
            setQueries["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS, "1_2")] = 'b';
            setQueries["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS, "2")] = { 3: 'c' };
            setQueries["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS, "2_4")] = 'd';
            return react_native_onyx_1.default.multiSet(setQueries)
                .then(KeyReportActionsDraftByReportActionID_1.default)
                .then(function () {
                var connection = react_native_onyx_1.default.connect({
                    key: ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS,
                    waitForCollectionCallback: true,
                    callback: function (allReportActionsDrafts) {
                        react_native_onyx_1.default.disconnect(connection);
                        var expectedReportActionDraft1 = {
                            1: 'a',
                            2: 'b',
                        };
                        var expectedReportActionDraft2 = {
                            3: 'c',
                            4: 'd',
                        };
                        expect(allReportActionsDrafts === null || allReportActionsDrafts === void 0 ? void 0 : allReportActionsDrafts["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS, "1_1")]).toBeUndefined();
                        expect(allReportActionsDrafts === null || allReportActionsDrafts === void 0 ? void 0 : allReportActionsDrafts["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS, "1_2")]).toBeUndefined();
                        expect(allReportActionsDrafts === null || allReportActionsDrafts === void 0 ? void 0 : allReportActionsDrafts["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS, "2_4")]).toBeUndefined();
                        expect(allReportActionsDrafts === null || allReportActionsDrafts === void 0 ? void 0 : allReportActionsDrafts["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS, "1")]).toMatchObject(expectedReportActionDraft1);
                        expect(allReportActionsDrafts === null || allReportActionsDrafts === void 0 ? void 0 : allReportActionsDrafts["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS, "2")]).toMatchObject(expectedReportActionDraft2);
                    },
                });
            });
        });
        it('Should skip if nothing to migrate', function () {
            var setQueries = {};
            setQueries["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS, "2")] = {};
            return react_native_onyx_1.default.multiSet(setQueries)
                .then(KeyReportActionsDraftByReportActionID_1.default)
                .then(function () {
                expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] Skipped migration KeyReportActionsDraftByReportActionID because there are no actions drafts to migrate');
                var connection = react_native_onyx_1.default.connect({
                    key: ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS,
                    waitForCollectionCallback: true,
                    callback: function (allReportActions) {
                        react_native_onyx_1.default.disconnect(connection);
                        var expectedReportActionDraft = {};
                        expect(allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS, "1_1")]).toBeUndefined();
                        expect(allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS, "1_2")]).toBeUndefined();
                        expect(allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS, "2_4")]).toBeUndefined();
                        expect(allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS, "2")]).toMatchObject(expectedReportActionDraft);
                    },
                });
            });
        });
        it("Shouldn't move empty individual draft to a draft collection of report", function () {
            var setQueries = {};
            setQueries["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS, "1_1")] = '';
            setQueries["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS, "1")] = {};
            return react_native_onyx_1.default.multiSet(setQueries)
                .then(KeyReportActionsDraftByReportActionID_1.default)
                .then(function () {
                var connection = react_native_onyx_1.default.connect({
                    key: ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS,
                    waitForCollectionCallback: true,
                    callback: function (allReportActionsDrafts) {
                        react_native_onyx_1.default.disconnect(connection);
                        expect(allReportActionsDrafts === null || allReportActionsDrafts === void 0 ? void 0 : allReportActionsDrafts["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS, "1_1")]).toBeUndefined();
                    },
                });
            });
        });
    });
});
