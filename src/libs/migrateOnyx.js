"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
var Log_1 = require("./Log");
var KeyReportActionsDraftByReportActionID_1 = require("./migrations/KeyReportActionsDraftByReportActionID");
var MoveIsOptimisticReportToMetadata_1 = require("./migrations/MoveIsOptimisticReportToMetadata");
var NVPMigration_1 = require("./migrations/NVPMigration");
var PendingMembersToMetadata_1 = require("./migrations/PendingMembersToMetadata");
var PronounsMigration_1 = require("./migrations/PronounsMigration");
var RemoveEmptyReportActionsDrafts_1 = require("./migrations/RemoveEmptyReportActionsDrafts");
var RenameCardIsVirtual_1 = require("./migrations/RenameCardIsVirtual");
var RenameReceiptFilename_1 = require("./migrations/RenameReceiptFilename");
var TransactionBackupsToCollection_1 = require("./migrations/TransactionBackupsToCollection");
function default_1() {
    var startTime = Date.now();
    Log_1.default.info('[Migrate Onyx] start');
    return new Promise(function (resolve) {
        // Add all migrations to an array so they are executed in order
        var migrationPromises = [
            RenameCardIsVirtual_1.default,
            RenameReceiptFilename_1.default,
            KeyReportActionsDraftByReportActionID_1.default,
            TransactionBackupsToCollection_1.default,
            RemoveEmptyReportActionsDrafts_1.default,
            NVPMigration_1.default,
            PronounsMigration_1.default,
            MoveIsOptimisticReportToMetadata_1.default,
            PendingMembersToMetadata_1.default,
        ];
        // Reduce all promises down to a single promise. All promises run in a linear fashion, waiting for the
        // previous promise to finish before moving onto the next one.
        /* eslint-disable arrow-body-style */
        migrationPromises
            .reduce(function (previousPromise, migrationPromise) {
            return previousPromise.then(function () {
                return migrationPromise();
            });
        }, Promise.resolve())
            // Once all migrations are done, resolve the main promise
            .then(function () {
            var timeElapsed = Date.now() - startTime;
            Log_1.default.info("[Migrate Onyx] finished in ".concat(timeElapsed, "ms"));
            resolve();
        });
    });
}
