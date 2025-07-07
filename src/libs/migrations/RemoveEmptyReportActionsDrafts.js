"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
var isEmpty_1 = require("lodash/isEmpty");
var react_native_onyx_1 = require("react-native-onyx");
var Log_1 = require("@libs/Log");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
/**
 * This migration removes empty drafts from reportActionsDrafts, which was previously used to mark a draft as being non-existent (e.g. upon cancel).
 */
function default_1() {
    return new Promise(function (resolve) {
        var connection = react_native_onyx_1.default.connect({
            key: ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS,
            waitForCollectionCallback: true,
            callback: function (allReportActionsDrafts) {
                react_native_onyx_1.default.disconnect(connection);
                if (!allReportActionsDrafts) {
                    Log_1.default.info('[Migrate Onyx] Skipped migration RemoveEmptyReportActionsDrafts because there were no reportActionsDrafts');
                    return resolve();
                }
                var newReportActionsDrafts = {};
                Object.entries(allReportActionsDrafts).forEach(function (_a) {
                    var onyxKey = _a[0], reportActionDrafts = _a[1];
                    var newReportActionsDraftsForReport = {};
                    // Whether there is at least one draft in this report that has to be migrated
                    var hasUnmigratedDraft = false;
                    if (reportActionDrafts) {
                        Object.entries(reportActionDrafts).forEach(function (_a) {
                            var reportActionID = _a[0], reportActionDraft = _a[1];
                            // If the draft is a string, it means it hasn't been migrated yet
                            if (typeof reportActionDraft === 'string') {
                                hasUnmigratedDraft = true;
                                Log_1.default.info("[Migrate Onyx] Migrating draft for report action ".concat(reportActionID));
                                if ((0, isEmpty_1.default)(reportActionDraft)) {
                                    Log_1.default.info("[Migrate Onyx] Removing draft for report action ".concat(reportActionID));
                                    return;
                                }
                                newReportActionsDraftsForReport[reportActionID] = { message: reportActionDraft };
                            }
                            else {
                                // We've already migrated this draft, so keep the existing value
                                newReportActionsDraftsForReport[reportActionID] = reportActionDraft;
                            }
                        });
                    }
                    if ((0, EmptyObject_1.isEmptyObject)(newReportActionsDraftsForReport)) {
                        Log_1.default.info('[Migrate Onyx] NO REMAINING');
                        // Clear if there are no drafts remaining
                        newReportActionsDrafts[onyxKey] = null;
                    }
                    else if (hasUnmigratedDraft) {
                        // Only migrate if there are unmigrated drafts, there's no need to overwrite this onyx key with the same data
                        newReportActionsDrafts[onyxKey] = newReportActionsDraftsForReport;
                    }
                });
                if ((0, EmptyObject_1.isEmptyObject)(newReportActionsDrafts)) {
                    Log_1.default.info('[Migrate Onyx] Skipped migration RemoveEmptyReportActionsDrafts because there are no actions drafts to migrate');
                    return resolve();
                }
                Log_1.default.info("[Migrate Onyx] Updating drafts for ".concat(Object.keys(newReportActionsDrafts).length, " reports"));
                react_native_onyx_1.default.multiSet(newReportActionsDrafts).then(function () {
                    Log_1.default.info('[Migrate Onyx] Ran migration RemoveEmptyReportActionsDrafts successfully');
                    resolve();
                });
            },
        });
    });
}
