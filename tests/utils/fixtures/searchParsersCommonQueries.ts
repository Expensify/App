/**
 * Tests to ensure that both parsers use the same set of base rules
 */
const parserCommonTests = {
    simple: 'type:expense',
    userFriendlyNames: 'tax-rate:rate1 expense-type:card card:"Big Bank" report-id:1234',
    oldNames: 'taxRate:rate1 expenseType:card cardID:"Big Bank" report-id:1234',
    complex: 'amount>200 expense-type:cash,card description:"Las Vegas party" date:2024-06-01 category:travel,hotel,"meal & entertainment"',
    quotesIOS: 'type:expense category:“a b”',
};

export default parserCommonTests;
