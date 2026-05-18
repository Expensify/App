import CONST from '@src/CONST';
import type {Pages} from '@src/types/onyx';
import {getContinuousChain, mergeAndSortContinuousPages, mergePagesByIDOverlap, prunePagesToNewestWindow, selectNewestPageWithIndex} from '../../src/libs/PaginationUtils';

type Item = {
    id: string;
};

function createItems(ids: string[]): Item[] {
    return ids.map((id) => ({
        id,
    }));
}

function getID(item: Item) {
    return item.id;
}

describe('PaginationUtils', () => {
    describe('getContinuousChain', () => {
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
        ])('given ID in the range %s, it will return the items with ID in range %s', (targetIDs, expectedOutputIDs) => {
            const expectedOutput = createItems(expectedOutputIDs);
            const input = createItems([
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
            const pages = [
                ['17', '16', '15', '14'],
                ['12', '11', '10', '9'],
                ['7', '6', '5', '4', '3', '2', '1'],
            ];
            for (const targetID of targetIDs) {
                const result = getContinuousChain(input, pages, getID, targetID);
                expect(result.data).toStrictEqual(expectedOutput);
                expect(result.hasPreviousPage).toBe(true);
                expect(result.hasNextPage).toBe(true);
            }
        });

        it('given an input ID of 8 or 13 which do not exist in Onyx it will return an empty array', () => {
            const input: Item[] = createItems([
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

            const pages = [
                // Given these pages
                ['17', '16', '15', '14'],
                ['12', '11', '10', '9'],
                ['7', '6', '5', '4', '3', '2', '1'],
            ];

            // Expect these sortedItems
            const expectedResult: Item[] = [];
            const result = getContinuousChain(input, pages, getID, '8');
            expect(result.data).toStrictEqual(expectedResult);
            expect(result.hasPreviousPage).toBe(false);
            expect(result.hasNextPage).toBe(false);
        });

        it('given an input ID of an action in a gap it will return only that action', () => {
            const input = createItems([
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

            const pages = [
                // Given these pages
                ['17', '16', '15', '14'],
                ['12', '11', '10', '9'],
                ['7', '6', '5', '4', '3', '2', '1'],
            ];

            const expectedResult = createItems([
                // Expect these sortedItems
                '8',
            ]);
            const result = getContinuousChain(input, pages, getID, '8');
            expect(result.data).toStrictEqual(expectedResult);
            expect(result.hasPreviousPage).toBe(false);
            expect(result.hasNextPage).toBe(false);
        });

        it('given an empty input ID and the report only contains pending actions, it will return all actions', () => {
            const input = createItems([
                // Given these sortedItems
                '7',
                '6',
                '5',
                '4',
                '3',
                '2',
                '1',
            ]);

            const pages: Pages = [];

            // Expect these sortedItems
            const expectedResult = [...input];
            const result = getContinuousChain(input, pages, getID, '');
            expect(result.data).toStrictEqual(expectedResult);
            expect(result.hasPreviousPage).toBe(false);
            expect(result.hasNextPage).toBe(false);
        });

        it('given an input ID and the report only contains pending actions, it will return all actions', () => {
            const input = createItems([
                // Given these sortedItems
                '7',
                '6',
                '5',
                '4',
                '3',
                '2',
                '1',
            ]);

            const pages: Pages = [];

            // Expect these sortedItems
            const expectedResult = [...input];
            const result = getContinuousChain(input, pages, getID, '4');
            // Expect the result to be the same
            expect(result.data).toStrictEqual(expectedResult);
            expect(result.hasPreviousPage).toBe(false);
            expect(result.hasNextPage).toBe(false);
        });

        it('given an input ID of 8 which does not exist in Onyx and the report only contains pending actions, it will return an empty array', () => {
            const input = createItems([
                // Given these sortedItems
                '7',
                '6',
                '5',
                '4',
                '3',
                '2',
                '1',
            ]);

            const pages: Pages = [];

            // Expect these sortedItems
            const expectedResult: Item[] = [];
            const result = getContinuousChain(input, pages, getID, '8');
            expect(result.data).toStrictEqual(expectedResult);
            expect(result.hasPreviousPage).toBe(false);
            expect(result.hasNextPage).toBe(false);
        });

        it('does not include actions outside of pages', () => {
            const input = createItems([
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

            const pages = [
                // Given these pages
                ['17', '16', '15', '14'],
                ['12', '11', '10', '9'],
                ['7', '6', '5', '4', '3', '2'],
            ];

            const expectedResult = createItems([
                // Expect these sortedItems
                '12',
                '11',
                '10',
                '9',
            ]);
            const result = getContinuousChain(input, pages, getID, '10');
            expect(result.data).toStrictEqual(expectedResult);
            expect(result.hasPreviousPage).toBe(true);
            expect(result.hasNextPage).toBe(true);
        });

        it('given a page with an empty firstItemID include actions until the start', () => {
            const input = createItems([
                // Given these sortedItems
                '17',
                '16',
                '15',
                '14',
            ]);

            const pages = [
                // Given these pages
                [CONST.PAGINATION_START_ID, '15', '14'],
            ];

            const expectedResult = createItems([
                // Expect these sortedItems
                '17',
                '16',
                '15',
                '14',
            ]);
            const result = getContinuousChain(input, pages, getID, '');
            expect(result.data).toStrictEqual(expectedResult);
            expect(result.hasPreviousPage).toBe(false);
            expect(result.hasNextPage).toBe(true);
        });

        it('given a page with null lastItemID include actions to the end', () => {
            const input = createItems([
                // Given these sortedItems
                '17',
                '16',
                '15',
                '14',
            ]);

            const pages = [
                // Given these pages
                ['17', '16', CONST.PAGINATION_END_ID],
            ];

            const expectedResult = createItems([
                // Expect these sortedItems
                '17',
                '16',
                '15',
                '14',
            ]);
            const result = getContinuousChain(input, pages, getID, '');
            expect(result.data).toStrictEqual(expectedResult);
            expect(result.hasPreviousPage).toBe(true);
            expect(result.hasNextPage).toBe(false);
        });
    });

    describe('mergeAndSortContinuousPages', () => {
        it('merges continuous pages', () => {
            const sortedItems = createItems([
                // Given these sortedItems
                '5',
                '4',
                '3',
                '2',
                '1',
            ]);
            const pages = [
                // Given these pages
                ['5', '4', '3'],
                ['3', '2', '1'],
            ];
            const expectedResult = [
                // Expect these pages
                ['5', '4', '3', '2', '1'],
            ];
            const result = mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });

        it('merges overlapping pages', () => {
            const sortedItems = createItems([
                // Given these sortedItems
                '5',
                '4',
                '3',
                '2',
                '1',
            ]);
            const pages = [
                // Given these pages
                ['4', '3', '2'],
                ['3', '2', '1'],
            ];
            const expectedResult = [
                // Expect these pages
                ['4', '3', '2', '1'],
            ];
            const result = mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });

        it('merges included pages', () => {
            const sortedItems = createItems([
                // Given these sortedItems
                '5',
                '4',
                '3',
                '2',
                '1',
            ]);
            const pages = [
                // Given these pages
                ['5', '4', '3', '2', '1'],
                ['5', '4', '3', '2'],
            ];
            const expectedResult = [
                // Expect these pages
                ['5', '4', '3', '2', '1'],
            ];
            const result = mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });

        it('do not merge separate pages', () => {
            const sortedItems = createItems([
                // Given these sortedItems
                '5',
                '4',
                // Gap
                '2',
                '1',
            ]);
            const pages = [
                // Given these pages
                ['5', '4'],
                ['2', '1'],
            ];
            const expectedResult = [
                // Expect these pages
                ['5', '4'],
                ['2', '1'],
            ];
            const result = mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });

        it('sorts pages', () => {
            const sortedItems = createItems([
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
            const pages = [
                // Given these pages
                ['3', '2', '1'],
                ['3', '2'],
                ['6', '5'],
                ['9', '8'],
            ];
            const expectedResult = [
                // Expect these pages
                ['9', '8'],
                ['6', '5'],
                ['3', '2', '1'],
            ];
            const result = mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });

        it('handles actions that no longer exist', () => {
            const sortedItems = createItems([
                // Given these sortedItems
                '4',
                '3',
            ]);
            const pages = [
                // Given these pages
                ['6', '5', '4', '3', '2', '1'],
            ];
            const expectedResult = [
                // Expect these pages
                ['4', '3'],
            ];
            const result = mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });

        it('removes pages that are empty', () => {
            const sortedItems = createItems([
                // Given these sortedItems
                '4',
            ]);
            const pages = [
                // Given these pages
                ['6', '5'],
                ['3', '2', '1'],
            ];

            // Expect these pages
            const expectedResult: Pages = [];
            const result = mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });

        it('handles pages with a single action', () => {
            const sortedItems = createItems([
                // Given these sortedItems
                '4',
                '2',
            ]);
            const pages = [
                // Given these pages
                ['4'],
                ['2'],
                ['2'],
            ];
            const expectedResult = [
                // Expect these pages
                ['4'],
                ['2'],
            ];
            const result = mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });

        it('handles out of order ids', () => {
            const sortedItems = createItems([
                // Given these sortedItems
                '2',
                '1',
                '3',
                '4',
            ]);
            const pages = [
                // Given these pages
                ['2', '1'],
                ['1', '3'],
                ['4'],
            ];
            const expectedResult = [
                // Expect these pages
                ['2', '1', '3'],
                ['4'],
            ];
            const result = mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });

        it('handles basic reordering', () => {
            const sortedItems = createItems([
                // Given these sortedItems
                '1',
                '2',
                '4',
                '5',
            ]);
            const pages = [
                // Given these pages
                ['5', '4'],
                ['2', '1'],
            ];
            const expectedResult = [
                // Expect these pages
                ['1', '2'],
                ['4', '5'],
            ];
            const result = mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });

        it('handles page start markers', () => {
            const sortedItems = createItems([
                // Given these sortedItems
                '1',
                '2',
            ]);
            const pages = [
                // Given these pages
                ['1', '2'],
                [CONST.PAGINATION_START_ID, '1'],
            ];
            const expectedResult = [
                // Expect these pages
                [CONST.PAGINATION_START_ID, '1', '2'],
            ];
            const result = mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });

        it('handles page end markers', () => {
            const sortedItems = createItems([
                // Given these sortedItems
                '1',
                '2',
            ]);
            const pages = [
                // Given these pages
                ['2', CONST.PAGINATION_END_ID],
                ['1', '2'],
            ];
            const expectedResult = [
                // Expect these pages
                ['1', '2', CONST.PAGINATION_END_ID],
            ];
            const result = mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });

        it('handles both page markers', () => {
            const sortedItems = createItems([
                // Given these sortedItems
                '1',
                '2',
                '3',
            ]);
            const pages = [
                // Given these pages
                [CONST.PAGINATION_START_ID, '1', '2', '3', CONST.PAGINATION_END_ID],
                [CONST.PAGINATION_START_ID, '2', CONST.PAGINATION_END_ID],
            ];
            const expectedResult = [
                // Expect these pages
                [CONST.PAGINATION_START_ID, '1', '2', '3', CONST.PAGINATION_END_ID],
            ];
            const result = mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });

        it('handles mixed page markers', () => {
            const sortedItems = createItems([
                // Given these sortedItems
                '1',
                '2',
                '3',
            ]);
            const pages = [
                // Given these pages
                [CONST.PAGINATION_START_ID, '1', '2', '3'],
                ['2', '3', CONST.PAGINATION_END_ID],
            ];
            const expectedResult = [
                // Expect these pages
                [CONST.PAGINATION_START_ID, '1', '2', '3', CONST.PAGINATION_END_ID],
            ];
            const result = mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });
    });

    describe('mergePagesByIDOverlap', () => {
        it('merges pages that share a non-marker id (overlap) without requiring index adjacency in the same way as mergeAndSort', () => {
            const sortedItems = createItems(['5', '4', '3', '2', '1']);
            const pages: Pages = [
                ['4', '3', '2'],
                ['3', '2', '1'],
            ];
            const result = mergePagesByIDOverlap(sortedItems, pages, getID);
            expect(result).toStrictEqual([['4', '3', '2', '1']]);
        });

        it('merges when the first id of a page matches the last id of the previous page (chain)', () => {
            const sortedItems = createItems(['5', '4', '3', '2', '1']);
            const pages: Pages = [
                ['5', '4', '3'],
                ['3', '2', '1'],
            ];
            const result = mergePagesByIDOverlap(sortedItems, pages, getID);
            expect(result).toStrictEqual([['5', '4', '3', '2', '1']]);
        });

        it('does not merge disjoint windows with no shared ids (middle-of-chat / sparse local set)', () => {
            const sortedItems = createItems(['5', '4', '2', '1']);
            const pages: Pages = [
                ['5', '4'],
                ['2', '1'],
            ];
            const result = mergePagesByIDOverlap(sortedItems, pages, getID);
            expect(result).toStrictEqual([
                ['5', '4'],
                ['2', '1'],
            ]);
        });

        it('returns an empty array when input pages is empty', () => {
            expect(mergePagesByIDOverlap(createItems(['1']), [], getID)).toStrictEqual([]);
        });

        it('strips ids not present in sortedItems from stored pages', () => {
            const sortedItems = createItems(['4', '3']);
            const pages: Pages = [['6', '5', '4', '3', '2', '1']];
            const result = mergePagesByIDOverlap(sortedItems, pages, getID);
            expect(result).toStrictEqual([['4', '3']]);
        });

        it('applies start/end markers when merging', () => {
            const sortedItems = createItems(['1', '2', '3']);
            const pages: Pages = [
                [CONST.PAGINATION_START_ID, '1', '2', '3'],
                ['2', '3', CONST.PAGINATION_END_ID],
            ];
            const result = mergePagesByIDOverlap(sortedItems, pages, getID);
            expect(result).toStrictEqual([[CONST.PAGINATION_START_ID, '1', '2', '3', CONST.PAGINATION_END_ID]]);
        });
    });

    describe('selectNewestPageWithIndex', () => {
        it('returns undefined for an empty list', () => {
            expect(selectNewestPageWithIndex([])).toBeUndefined();
        });

        it('returns the only page when there is a single page', () => {
            const only = {
                ids: ['3', '2', '1'],
                firstID: '3',
                firstIndex: 0,
                lastID: '1',
                lastIndex: 2,
            };
            expect(selectNewestPageWithIndex([only])).toBe(only);
        });

        it('prefers the page whose firstID is the pagination start marker', () => {
            const withStart = {
                ids: [CONST.PAGINATION_START_ID, '2', '1'],
                firstID: CONST.PAGINATION_START_ID,
                firstIndex: 2,
                lastID: '1',
                lastIndex: 4,
            };
            const newerByIndex = {
                ids: ['5', '4'],
                firstID: '5',
                firstIndex: 0,
                lastID: '4',
                lastIndex: 1,
            };
            expect(selectNewestPageWithIndex([newerByIndex, withStart])).toBe(withStart);
            expect(selectNewestPageWithIndex([withStart, newerByIndex])).toBe(withStart);
        });

        it('when no start marker, picks the page with the smallest firstIndex (chronologically newest in descending-sorted data)', () => {
            const olderWindow = {
                ids: ['2', '1'],
                firstID: '2',
                firstIndex: 3,
                lastID: '1',
                lastIndex: 4,
            };
            const newerWindow = {
                ids: ['5', '4'],
                firstID: '5',
                firstIndex: 0,
                lastID: '4',
                lastIndex: 1,
            };
            expect(selectNewestPageWithIndex([olderWindow, newerWindow])).toBe(newerWindow);
        });
    });

    describe('prunePagesToNewestWindow', () => {
        it('returns pages unchanged when there is at most one page', () => {
            const sortedItems = createItems(['1', '2', '3']);
            expect(prunePagesToNewestWindow(sortedItems, [], getID)).toStrictEqual([]);
            expect(prunePagesToNewestWindow(sortedItems, [['1', '2']], getID)).toStrictEqual([['1', '2']]);
        });

        it('collapses to the newest window by firstIndex when no start marker is present', () => {
            const sortedItems = createItems(['5', '4', '3', '2', '1']);
            const pages: Pages = [
                ['2', '1'],
                ['5', '4'],
            ];
            const result = prunePagesToNewestWindow(sortedItems, pages, getID);
            expect(result).toStrictEqual([['5', '4']]);
        });

        it('keeps the page that includes the start marker (ids are expanded the same way as in getPagesWithIndexes)', () => {
            const sortedItems = createItems(['3', '2', '1']);
            const pages: Pages = [
                ['3', '2'],
                [CONST.PAGINATION_START_ID, '1'],
            ];
            const result = prunePagesToNewestWindow(sortedItems, pages, getID);
            expect(result).toStrictEqual([[CONST.PAGINATION_START_ID, '3', '2', '1']]);
        });
    });
});
