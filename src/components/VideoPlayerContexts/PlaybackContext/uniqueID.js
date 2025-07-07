"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var uniqueIDForVideoWithoutReportRef = {
    value: 1,
};
/**
 * Generates unique identifiers for videos without a report. The IDs are globally unique and incrementally sequenced for distinct values.
 * Each ID is prefixed by "NO_REPORT_ID_" followed by an incrementing number.
 *
 * Example of using the function without destructuring to maintain references and ensure unique and sequential IDs:
 * ```
 * const idGenerator = uniqueIDForVideoWithoutReport();
 * console.log(idGenerator.fakeReportID);  // "NO_REPORT_ID_1"
 * console.log(idGenerator.fakeReportID);  // "NO_REPORT_ID_2"
 * ```
 *
 * If only a single unique ID is needed, destructuring can be used during invocation to directly access the ID:
 * ```
 * const { fakeReportID } = uniqueIDForVideoWithoutReport();
 * console.log(fakeReportID);  // "NO_REPORT_ID_1"
 * console.log(fakeReportID);  // "NO_REPORT_ID_1"
 * ```
 *
 * Note:
 * - It's important to avoid destructuring the return value if maintaining a single incrementing sequence of IDs across multiple accesses is needed.
 * - Destructuring results in a fixed value and loses the reference to the objects getter, this should be done only if a single ID is required.
 *
 * @returns An object containing a getter `fakeReportID` that can be used to access unique, sequential IDs.
 */
function uniqueIDForVideoWithoutReport() {
    return {
        get fakeReportID() {
            return "NO_REPORT_ID_".concat(uniqueIDForVideoWithoutReportRef.value++);
        },
    };
}
exports.default = uniqueIDForVideoWithoutReport;
