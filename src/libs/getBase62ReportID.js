"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getBase62ReportID;
/**
 * Take an integer reportID and convert it to a string representing a Base-62 report ID.
 *
 * This is in it's own module to prevent a dependency cycle between libs/ReportUtils.ts and libs/ReportActionUtils.ts
 *
 * @return string The reportID in base 62-format, always 12 characters beginning with `R`.
 */
function getBase62ReportID(reportID) {
    var alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var result = '';
    var remainder = reportID;
    while (remainder > 0) {
        var currentVal = remainder % 62;
        result = alphabet[currentVal] + result;
        remainder = Math.floor(remainder / 62);
    }
    return "R".concat(result.padStart(11, '0'));
}
