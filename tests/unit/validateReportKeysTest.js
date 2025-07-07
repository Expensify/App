"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var whitelistedReportKeys_1 = require("@src/types/utils/whitelistedReportKeys");
// This test is mainly to avoid that the testReportKeys is not removed or changed to false
describe('whitelistedReportKeys', function () {
    it('testReportKeys must be true', function () {
        expect(whitelistedReportKeys_1.default).toBe(true);
    });
});
