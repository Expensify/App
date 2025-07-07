"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
var PaginationUtils_1 = require("../../src/libs/PaginationUtils");
function createItems(ids) {
    return ids.map(function (id) { return ({
        id: id,
    }); });
}
function getID(item) {
    return item.id;
}
describe('PaginationUtils', function () {
    describe('getContinuousChain', function () {
        test.each([
            [
                ['1', '2', '3', '4', '5', '6', '7'],
                ['7', '6', '5', '4', '3', '2', '1'],
            ],
            [
                ['9', '10', '11', '12'],
                ['12', '11', '10', '9'],
            ],
            [
                ['14', '15', '16', '17'],
                ['17', '16', '15', '14'],
            ],
        ])('given ID in the range %s, it will return the items with ID in range %s', function (targetIDs, expectedOutputIDs) {
            var expectedOutput = createItems(expectedOutputIDs);
            var input = createItems([
                '17',
                '16',
                '15',
                '14',
                // Gap
                '12',
                '11',
                '10',
                '9',
                // Gap
                '7',
                '6',
                '5',
                '4',
                '3',
                '2',
                '1',
            ]);
            var pages = [
                ['17', '16', '15', '14'],
                ['12', '11', '10', '9'],
                ['7', '6', '5', '4', '3', '2', '1'],
            ];
            for (var _i = 0, targetIDs_1 = targetIDs; _i < targetIDs_1.length; _i++) {
                var targetID = targetIDs_1[_i];
                var result = PaginationUtils_1.default.getContinuousChain(input, pages, getID, targetID);
                expect(result.data).toStrictEqual(expectedOutput);
                expect(result.hasPreviousPage).toBe(true);
                expect(result.hasNextPage).toBe(true);
            }
        });
        it('given an input ID of 8 or 13 which do not exist in Onyx it will return an empty array', function () {
            var input = createItems([
                // Given these sortedItems
                '17',
                '16',
                '15',
                '14',
                // Gap
                '12',
                '11',
                '10',
                '9',
                // Gap
                '7',
                '6',
                '5',
                '4',
                '3',
                '2',
                '1',
            ]);
            var pages = [
                // Given these pages
                ['17', '16', '15', '14'],
                ['12', '11', '10', '9'],
                ['7', '6', '5', '4', '3', '2', '1'],
            ];
            // Expect these sortedItems
            var expectedResult = [];
            var result = PaginationUtils_1.default.getContinuousChain(input, pages, getID, '8');
            expect(result.data).toStrictEqual(expectedResult);
            expect(result.hasPreviousPage).toBe(false);
            expect(result.hasNextPage).toBe(false);
        });
        it('given an input ID of an action in a gap it will return only that action', function () {
            var input = createItems([
                // Given these sortedItems
                '17',
                '16',
                '15',
                '14',
                '13',
                '12',
                '11',
                '10',
                '9',
                '8',
                '7',
                '6',
                '5',
                '4',
                '3',
                '2',
                '1',
            ]);
            var pages = [
                // Given these pages
                ['17', '16', '15', '14'],
                ['12', '11', '10', '9'],
                ['7', '6', '5', '4', '3', '2', '1'],
            ];
            var expectedResult = createItems([
                // Expect these sortedItems
                '8',
            ]);
            var result = PaginationUtils_1.default.getContinuousChain(input, pages, getID, '8');
            expect(result.data).toStrictEqual(expectedResult);
            expect(result.hasPreviousPage).toBe(false);
            expect(result.hasNextPage).toBe(false);
        });
        it('given an empty input ID and the report only contains pending actions, it will return all actions', function () {
            var input = createItems([
                // Given these sortedItems
                '7',
                '6',
                '5',
                '4',
                '3',
                '2',
                '1',
            ]);
            var pages = [];
            // Expect these sortedItems
            var expectedResult = __spreadArray([], input, true);
            var result = PaginationUtils_1.default.getContinuousChain(input, pages, getID, '');
            expect(result.data).toStrictEqual(expectedResult);
            expect(result.hasPreviousPage).toBe(false);
            expect(result.hasNextPage).toBe(false);
        });
        it('given an input ID and the report only contains pending actions, it will return all actions', function () {
            var input = createItems([
                // Given these sortedItems
                '7',
                '6',
                '5',
                '4',
                '3',
                '2',
                '1',
            ]);
            var pages = [];
            // Expect these sortedItems
            var expectedResult = __spreadArray([], input, true);
            var result = PaginationUtils_1.default.getContinuousChain(input, pages, getID, '4');
            // Expect the result to be the same
            expect(result.data).toStrictEqual(expectedResult);
            expect(result.hasPreviousPage).toBe(false);
            expect(result.hasNextPage).toBe(false);
        });
        it('given an input ID of 8 which does not exist in Onyx and the report only contains pending actions, it will return an empty array', function () {
            var input = createItems([
                // Given these sortedItems
                '7',
                '6',
                '5',
                '4',
                '3',
                '2',
                '1',
            ]);
            var pages = [];
            // Expect these sortedItems
            var expectedResult = [];
            var result = PaginationUtils_1.default.getContinuousChain(input, pages, getID, '8');
            expect(result.data).toStrictEqual(expectedResult);
            expect(result.hasPreviousPage).toBe(false);
            expect(result.hasNextPage).toBe(false);
        });
        it('does not include actions outside of pages', function () {
            var input = createItems([
                // Given these sortedItems
                '17',
                '16',
                '15',
                '14',
                '13',
                '12',
                '11',
                '10',
                '9',
                '8',
                '7',
                '6',
                '5',
                '4',
                '3',
                '2',
                '1',
            ]);
            var pages = [
                // Given these pages
                ['17', '16', '15', '14'],
                ['12', '11', '10', '9'],
                ['7', '6', '5', '4', '3', '2'],
            ];
            var expectedResult = createItems([
                // Expect these sortedItems
                '12',
                '11',
                '10',
                '9',
            ]);
            var result = PaginationUtils_1.default.getContinuousChain(input, pages, getID, '10');
            expect(result.data).toStrictEqual(expectedResult);
            expect(result.hasPreviousPage).toBe(true);
            expect(result.hasNextPage).toBe(true);
        });
        it('given a page with an empty firstItemID include actions until the start', function () {
            var input = createItems([
                // Given these sortedItems
                '17',
                '16',
                '15',
                '14',
            ]);
            var pages = [
                // Given these pages
                [CONST_1.default.PAGINATION_START_ID, '15', '14'],
            ];
            var expectedResult = createItems([
                // Expect these sortedItems
                '17',
                '16',
                '15',
                '14',
            ]);
            var result = PaginationUtils_1.default.getContinuousChain(input, pages, getID, '');
            expect(result.data).toStrictEqual(expectedResult);
            expect(result.hasPreviousPage).toBe(false);
            expect(result.hasNextPage).toBe(true);
        });
        it('given a page with null lastItemID include actions to the end', function () {
            var input = createItems([
                // Given these sortedItems
                '17',
                '16',
                '15',
                '14',
            ]);
            var pages = [
                // Given these pages
                ['17', '16', CONST_1.default.PAGINATION_END_ID],
            ];
            var expectedResult = createItems([
                // Expect these sortedItems
                '17',
                '16',
                '15',
                '14',
            ]);
            var result = PaginationUtils_1.default.getContinuousChain(input, pages, getID, '');
            expect(result.data).toStrictEqual(expectedResult);
            expect(result.hasPreviousPage).toBe(true);
            expect(result.hasNextPage).toBe(false);
        });
    });
    describe('mergeAndSortContinuousPages', function () {
        it('merges continuous pages', function () {
            var sortedItems = createItems([
                // Given these sortedItems
                '5',
                '4',
                '3',
                '2',
                '1',
            ]);
            var pages = [
                // Given these pages
                ['5', '4', '3'],
                ['3', '2', '1'],
            ];
            var expectedResult = [
                // Expect these pages
                ['5', '4', '3', '2', '1'],
            ];
            var result = PaginationUtils_1.default.mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });
        it('merges overlapping pages', function () {
            var sortedItems = createItems([
                // Given these sortedItems
                '5',
                '4',
                '3',
                '2',
                '1',
            ]);
            var pages = [
                // Given these pages
                ['4', '3', '2'],
                ['3', '2', '1'],
            ];
            var expectedResult = [
                // Expect these pages
                ['4', '3', '2', '1'],
            ];
            var result = PaginationUtils_1.default.mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });
        it('merges included pages', function () {
            var sortedItems = createItems([
                // Given these sortedItems
                '5',
                '4',
                '3',
                '2',
                '1',
            ]);
            var pages = [
                // Given these pages
                ['5', '4', '3', '2', '1'],
                ['5', '4', '3', '2'],
            ];
            var expectedResult = [
                // Expect these pages
                ['5', '4', '3', '2', '1'],
            ];
            var result = PaginationUtils_1.default.mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });
        it('do not merge separate pages', function () {
            var sortedItems = createItems([
                // Given these sortedItems
                '5',
                '4',
                // Gap
                '2',
                '1',
            ]);
            var pages = [
                // Given these pages
                ['5', '4'],
                ['2', '1'],
            ];
            var expectedResult = [
                // Expect these pages
                ['5', '4'],
                ['2', '1'],
            ];
            var result = PaginationUtils_1.default.mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });
        it('sorts pages', function () {
            var sortedItems = createItems([
                // Given these sortedItems
                '9',
                '8',
                // Gap
                '6',
                '5',
                // Gap
                '3',
                '2',
                '1',
            ]);
            var pages = [
                // Given these pages
                ['3', '2', '1'],
                ['3', '2'],
                ['6', '5'],
                ['9', '8'],
            ];
            var expectedResult = [
                // Expect these pages
                ['9', '8'],
                ['6', '5'],
                ['3', '2', '1'],
            ];
            var result = PaginationUtils_1.default.mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });
        it('handles actions that no longer exist', function () {
            var sortedItems = createItems([
                // Given these sortedItems
                '4',
                '3',
            ]);
            var pages = [
                // Given these pages
                ['6', '5', '4', '3', '2', '1'],
            ];
            var expectedResult = [
                // Expect these pages
                ['4', '3'],
            ];
            var result = PaginationUtils_1.default.mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });
        it('removes pages that are empty', function () {
            var sortedItems = createItems([
                // Given these sortedItems
                '4',
            ]);
            var pages = [
                // Given these pages
                ['6', '5'],
                ['3', '2', '1'],
            ];
            // Expect these pages
            var expectedResult = [];
            var result = PaginationUtils_1.default.mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });
        it('handles pages with a single action', function () {
            var sortedItems = createItems([
                // Given these sortedItems
                '4',
                '2',
            ]);
            var pages = [
                // Given these pages
                ['4'],
                ['2'],
                ['2'],
            ];
            var expectedResult = [
                // Expect these pages
                ['4'],
                ['2'],
            ];
            var result = PaginationUtils_1.default.mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });
        it('handles out of order ids', function () {
            var sortedItems = createItems([
                // Given these sortedItems
                '2',
                '1',
                '3',
                '4',
            ]);
            var pages = [
                // Given these pages
                ['2', '1'],
                ['1', '3'],
                ['4'],
            ];
            var expectedResult = [
                // Expect these pages
                ['2', '1', '3'],
                ['4'],
            ];
            var result = PaginationUtils_1.default.mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });
        it('handles basic reordering', function () {
            var sortedItems = createItems([
                // Given these sortedItems
                '1',
                '2',
                '4',
                '5',
            ]);
            var pages = [
                // Given these pages
                ['5', '4'],
                ['2', '1'],
            ];
            var expectedResult = [
                // Expect these pages
                ['1', '2'],
                ['4', '5'],
            ];
            var result = PaginationUtils_1.default.mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });
        it('handles page start markers', function () {
            var sortedItems = createItems([
                // Given these sortedItems
                '1',
                '2',
            ]);
            var pages = [
                // Given these pages
                ['1', '2'],
                [CONST_1.default.PAGINATION_START_ID, '1'],
            ];
            var expectedResult = [
                // Expect these pages
                [CONST_1.default.PAGINATION_START_ID, '1', '2'],
            ];
            var result = PaginationUtils_1.default.mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });
        it('handles page end markers', function () {
            var sortedItems = createItems([
                // Given these sortedItems
                '1',
                '2',
            ]);
            var pages = [
                // Given these pages
                ['2', CONST_1.default.PAGINATION_END_ID],
                ['1', '2'],
            ];
            var expectedResult = [
                // Expect these pages
                ['1', '2', CONST_1.default.PAGINATION_END_ID],
            ];
            var result = PaginationUtils_1.default.mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });
        it('handles both page markers', function () {
            var sortedItems = createItems([
                // Given these sortedItems
                '1',
                '2',
                '3',
            ]);
            var pages = [
                // Given these pages
                [CONST_1.default.PAGINATION_START_ID, '1', '2', '3', CONST_1.default.PAGINATION_END_ID],
                [CONST_1.default.PAGINATION_START_ID, '2', CONST_1.default.PAGINATION_END_ID],
            ];
            var expectedResult = [
                // Expect these pages
                [CONST_1.default.PAGINATION_START_ID, '1', '2', '3', CONST_1.default.PAGINATION_END_ID],
            ];
            var result = PaginationUtils_1.default.mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });
        it('handles mixed page markers', function () {
            var sortedItems = createItems([
                // Given these sortedItems
                '1',
                '2',
                '3',
            ]);
            var pages = [
                // Given these pages
                [CONST_1.default.PAGINATION_START_ID, '1', '2', '3'],
                ['2', '3', CONST_1.default.PAGINATION_END_ID],
            ];
            var expectedResult = [
                // Expect these pages
                [CONST_1.default.PAGINATION_START_ID, '1', '2', '3', CONST_1.default.PAGINATION_END_ID],
            ];
            var result = PaginationUtils_1.default.mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });
    });
});
