import {renderHook} from '@testing-library/react-native';

import useLoadIncompleteTodoReports from '@hooks/useLoadIncompleteTodoReports';

import type {SearchKey} from '@libs/SearchKeyUtils';

import CONST from '@src/CONST';

const mockLoadIncompleteTodoReports = jest.fn();
jest.mock('@userActions/Search', () => ({
    loadIncompleteTodoReports: (...args: unknown[]) => {
        mockLoadIncompleteTodoReports(...args);
    },
}));

let mockIsOffline = false;
jest.mock('@hooks/useNetwork', () => () => ({isOffline: mockIsOffline}));

type RenderProps = {searchKey: SearchKey | undefined; incompleteReportIDs: string[] | undefined};
const APPROVE = CONST.SEARCH.SEARCH_KEYS.APPROVE;

function renderLoader(initialProps: RenderProps) {
    return renderHook(({searchKey, incompleteReportIDs}: RenderProps) => useLoadIncompleteTodoReports(searchKey, incompleteReportIDs), {initialProps});
}

describe('useLoadIncompleteTodoReports', () => {
    beforeEach(() => {
        mockIsOffline = false;
        mockLoadIncompleteTodoReports.mockClear();
    });

    it('loads the full reports once, so they can be listed with their date and total', () => {
        // Given a to-do report that only arrived through a partial workflow update
        const {rerender} = renderLoader({searchKey: APPROVE, incompleteReportIDs: ['partial']});

        // When the list renders again with the same partial report
        rerender({searchKey: APPROVE, incompleteReportIDs: ['partial']});

        // Then the full report is requested for that to-do list, and only once
        expect(mockLoadIncompleteTodoReports).toHaveBeenCalledTimes(1);
        expect(mockLoadIncompleteTodoReports).toHaveBeenCalledWith(APPROVE, ['partial']);
    });

    it('loads a newly arrived partial report together with the ones still missing', () => {
        // Given a partial to-do report that is still loading
        const {rerender} = renderLoader({searchKey: APPROVE, incompleteReportIDs: ['first']});

        // When a second partial report arrives before the first one has loaded
        rerender({searchKey: APPROVE, incompleteReportIDs: ['first', 'second']});

        // Then the request covers both
        expect(mockLoadIncompleteTodoReports).toHaveBeenLastCalledWith(APPROVE, ['first', 'second']);
    });

    it('waits until the device is back online to load them', () => {
        // Given a partial to-do report while the device is offline
        mockIsOffline = true;
        const {rerender} = renderLoader({searchKey: APPROVE, incompleteReportIDs: ['partial']});

        // Then nothing is requested while offline
        expect(mockLoadIncompleteTodoReports).not.toHaveBeenCalled();

        // When the device comes back online
        mockIsOffline = false;
        rerender({searchKey: APPROVE, incompleteReportIDs: ['partial']});

        // Then the full report is requested
        expect(mockLoadIncompleteTodoReports).toHaveBeenCalledWith(APPROVE, ['partial']);
    });

    it('requests nothing when every to-do report is complete or no to-do list is open', () => {
        // Given a to-do list with only complete reports, and a partial report while no to-do list is open
        // When each renders
        renderLoader({searchKey: APPROVE, incompleteReportIDs: []});
        renderLoader({searchKey: undefined, incompleteReportIDs: ['partial']});

        // Then nothing is requested, because there is nothing to load or no list that needs it
        expect(mockLoadIncompleteTodoReports).not.toHaveBeenCalled();
    });
});
