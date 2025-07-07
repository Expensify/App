"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
var react_native_onyx_1 = require("react-native-onyx");
var Log_1 = require("@libs/Log");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
/**
 * This migration moves pendingChatMembers from the report object to reportMetadata
 */
function default_1() {
    return new Promise(function (resolve) {
        var connection = react_native_onyx_1.default.connect({
            key: ONYXKEYS_1.default.COLLECTION.REPORT,
            waitForCollectionCallback: true,
            callback: function (reports) {
                react_native_onyx_1.default.disconnect(connection);
                if (!reports || (0, EmptyObject_1.isEmptyObject)(reports)) {
                    Log_1.default.info('[Migrate Onyx] Skipping migration PendingMembersToMetadata because there are no reports');
                    return resolve();
                }
                var promises = [];
                Object.entries(reports).forEach(function (_a) {
                    var reportID = _a[0], report = _a[1];
                    if ((report === null || report === void 0 ? void 0 : report.pendingChatMembers) === undefined) {
                        return;
                    }
                    promises.push(Promise.all([
                        // @ts-expect-error pendingChatMembers is not a valid property of Report anymore
                        // eslint-disable-next-line rulesdir/prefer-actions-set-data
                        react_native_onyx_1.default.merge(reportID, { pendingChatMembers: null }),
                        // eslint-disable-next-line rulesdir/prefer-actions-set-data
                        react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(report.reportID), { pendingChatMembers: report.pendingChatMembers }),
                    ]).then(function () {
                        Log_1.default.info("[Migrate Onyx] Successfully moved pendingChatMembers to reportMetadata for ".concat(reportID));
                    }));
                });
                if (promises.length === 0) {
                    Log_1.default.info('[Migrate Onyx] Skipping migration PendingMembersToMetadata because there are no reports with pendingChatMembers');
                    return resolve();
                }
                Promise.all(promises).then(function () { return resolve(); });
            },
        });
    });
}
