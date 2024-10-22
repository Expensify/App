import CONST from '@src/CONST';
import type {Pages} from '@src/types/onyx';
import PaginationUtils from '../../src/libs/PaginationUtils';

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
                const result = PaginationUtils.getContinuousChain(input, pages, getID, targetID);
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
            const result = PaginationUtils.getContinuousChain(input, pages, getID, '8');
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
            const result = PaginationUtils.getContinuousChain(input, pages, getID, '8');
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
            const result = PaginationUtils.getContinuousChain(input, pages, getID, '');
            expect(result.data).toStrictEqual(expectedResult);
            expect(result.hasPreviousPage).toBe(false);
            expect(result.hasNextPage).toBe(false);
        });

        it('given an input ID and the report only contains pending actions, it will return an empty array', () => {
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
            const result = PaginationUtils.getContinuousChain(input, pages, getID, '4');
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
            const result = PaginationUtils.getContinuousChain(input, pages, getID, '10');
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
            const result = PaginationUtils.getContinuousChain(input, pages, getID, '');
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
            const result = PaginationUtils.getContinuousChain(input, pages, getID, '');
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
            const result = PaginationUtils.mergeAndSortContinuousPages(sortedItems, pages, getID);
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
            const result = PaginationUtils.mergeAndSortContinuousPages(sortedItems, pages, getID);
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
            const result = PaginationUtils.mergeAndSortContinuousPages(sortedItems, pages, getID);
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
            const result = PaginationUtils.mergeAndSortContinuousPages(sortedItems, pages, getID);
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
            const result = PaginationUtils.mergeAndSortContinuousPages(sortedItems, pages, getID);
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
            const result = PaginationUtils.mergeAndSortContinuousPages(sortedItems, pages, getID);
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
            const result = PaginationUtils.mergeAndSortContinuousPages(sortedItems, pages, getID);
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
            const result = PaginationUtils.mergeAndSortContinuousPages(sortedItems, pages, getID);
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
            const result = PaginationUtils.mergeAndSortContinuousPages(sortedItems, pages, getID);
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
            const result = PaginationUtils.mergeAndSortContinuousPages(sortedItems, pages, getID);
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
            const result = PaginationUtils.mergeAndSortContinuousPages(sortedItems, pages, getID);
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
            const result = PaginationUtils.mergeAndSortContinuousPages(sortedItems, pages, getID);
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
            const result = PaginationUtils.mergeAndSortContinuousPages(sortedItems, pages, getID);
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
            const result = PaginationUtils.mergeAndSortContinuousPages(sortedItems, pages, getID);
            expect(result).toStrictEqual(expectedResult);
        });
    });
});
