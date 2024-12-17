/**
 * Tests to ensure that both parsers use the same set of base rules
 */
const parserCommonTests = {
    simple: 'type:expense status:all',
    userFriendlyNames: 'tax-rate:rate1 expense-type:card card:"Big Bank" reportid:report',
    oldNames: 'taxRate:rate1 expenseType:card cardID:"Big Bank" reportID:report',
    complex: 'amount>200 expense-type:cash,card description:"Las Vegas party" date:2024-06-01 category:travel,hotel,"meal & entertainment"',
};

export default parserCommonTests;
