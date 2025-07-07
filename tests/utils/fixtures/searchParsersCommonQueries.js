"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests to ensure that both parsers use the same set of base rules
 */
var parserCommonTests = {
    simple: 'type:expense status:all',
    // cspell:disable-next-line
    userFriendlyNames: 'tax-rate:rate1 expense-type:card card:"Big Bank" reportid:report',
    oldNames: 'taxRate:rate1 expenseType:card cardID:"Big Bank" reportID:report',
    complex: 'amount>200 expense-type:cash,card description:"Las Vegas party" date:2024-06-01 category:travel,hotel,"meal & entertainment"',
    quotesIOS: 'type:expense status:all category:“a b”',
};
exports.default = parserCommonTests;
