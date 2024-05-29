import {Pages} from '@src/types/onyx';
import PaginationUtils from '../../src/libs/PaginationUtils';

type Item = {
    id: string;
};

function createItems(ids: string[]): Item[] {
    return ids.map((id) => ({
        id,
    }));
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
                const result = PaginationUtils.getContinuousChain(input, pages, (item) => item.id, targetID);
                expect(result).toStrictEqual(expectedOutput);
            }
        });
    });
});
