import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import markPendingWriteForSearchPage from '@libs/Navigation/helpers/markPendingWriteForSearchPage';
import {markPendingSearchWrite} from '@libs/pendingSearchWrite';

jest.mock('@libs/pendingSearchWrite', () => ({
    markPendingSearchWrite: jest.fn(),
}));
jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => jest.fn());

describe('markPendingWriteForSearchPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('raises the pending-write signal for a global-create submit outside a report', () => {
        // Given a global-create submission with no report split navigator topmost - the case this
        // helper exists for, since the write is built later in Search's own component tree
        jest.mocked(isReportTopmostSplitNavigator).mockReturnValue(false);

        // When that submission is reported to this helper
        markPendingWriteForSearchPage(true);

        // Then Search's pending-write signal is raised, so the write defers behind Search's skeleton
        expect(markPendingSearchWrite).toHaveBeenCalled();
    });

    it('does not raise the signal when the submit is not from global create', () => {
        // Given a submission that did not originate from global create - it has its own call chain and
        // never needs a cross-tree signal, regardless of what's topmost
        jest.mocked(isReportTopmostSplitNavigator).mockReturnValue(false);

        // When that submission is reported to this helper
        markPendingWriteForSearchPage(false);

        // Then the signal is left untouched
        expect(markPendingSearchWrite).not.toHaveBeenCalled();
    });

    it('does not raise the signal when a report split navigator is topmost', () => {
        // Given a global-create submission with a report split navigator topmost - a report screen can
        // thread a barrier through its own props, so it doesn't need this cross-tree signal either
        jest.mocked(isReportTopmostSplitNavigator).mockReturnValue(true);

        // When that submission is reported to this helper
        markPendingWriteForSearchPage(true);

        // Then the signal is not raised
        expect(markPendingSearchWrite).not.toHaveBeenCalled();
    });
});
