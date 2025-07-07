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
exports.default = default_1;
var react_native_onyx_1 = require("react-native-onyx");
var Log_1 = require("@libs/Log");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
/**
 * This migration updates reportActionsDrafts data to be keyed by reportActionID.
 *
 * Before: reportActionsDrafts_reportID_reportActionID: value
 * After: reportActionsDrafts_reportID: {[reportActionID]: value}
 */
function default_1() {
    return new Promise(function (resolve) {
        var connection = react_native_onyx_1.default.connect({
            key: ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS,
            waitForCollectionCallback: true,
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            callback: function (allReportActionsDrafts) {
                react_native_onyx_1.default.disconnect(connection);
                if (!allReportActionsDrafts) {
                    Log_1.default.info('[Migrate Onyx] Skipped migration KeyReportActionsDraftByReportActionID because there were no reportActionsDrafts');
                    return resolve();
                }
                var newReportActionsDrafts = {};
                Object.entries(allReportActionsDrafts).forEach(function (_a) {
                    var _b;
                    var _c;
                    var onyxKey = _a[0], reportActionDraft = _a[1];
                    if (typeof reportActionDraft !== 'string') {
                        return;
                    }
                    newReportActionsDrafts[onyxKey] = null;
                    if ((0, EmptyObject_1.isEmptyObject)(reportActionDraft)) {
                        return;
                    }
                    var reportActionID = onyxKey.split('_').pop();
                    var newOnyxKey = onyxKey.replace("_".concat(reportActionID), '');
                    if (!reportActionID) {
                        return;
                    }
                    // If newReportActionsDrafts[newOnyxKey] isn't set, fall back on the migrated draft if there is one
                    var currentActionsDrafts = (_c = newReportActionsDrafts[newOnyxKey]) !== null && _c !== void 0 ? _c : allReportActionsDrafts[newOnyxKey];
                    newReportActionsDrafts[newOnyxKey] = __assign(__assign({}, currentActionsDrafts), (_b = {}, _b[reportActionID] = reportActionDraft, _b));
                });
                if ((0, EmptyObject_1.isEmptyObject)(newReportActionsDrafts)) {
                    Log_1.default.info('[Migrate Onyx] Skipped migration KeyReportActionsDraftByReportActionID because there are no actions drafts to migrate');
                    return resolve();
                }
                Log_1.default.info("[Migrate Onyx] Re-keying reportActionsDrafts by reportActionID for ".concat(Object.keys(newReportActionsDrafts).length, " actions drafts"));
                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                return react_native_onyx_1.default.multiSet(newReportActionsDrafts).then(resolve);
            },
        });
    });
}
