import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import markPendingSearchWriteIfGlobalCreate from '@libs/Navigation/helpers/markPendingSearchWriteIfGlobalCreate';
import {markPendingSearchWrite} from '@libs/pendingSearchWrite';

jest.mock('@libs/pendingSearchWrite', () => ({markPendingSearchWrite: jest.fn()}));
jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => jest.fn());

describe('markPendingSearchWriteIfGlobalCreate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('raises the pending-write signal for a global-create submit off the inbox', () => {
        // Given a submission started from global create, outside the inbox's split navigator
        jest.mocked(isReportTopmostSplitNavigator).mockReturnValue(false);

        // When that submission is reported to this helper
        markPendingSearchWriteIfGlobalCreate(true);

        // Then Search's pending-write signal is raised, since the write is built later in Search's own
        // component tree with no call chain to hand a barrier through
        expect(markPendingSearchWrite).toHaveBeenCalled();
    });

    it('does not raise the signal when the submit is not from global create', () => {
        // Given a submission that did not originate from global create
        jest.mocked(isReportTopmostSplitNavigator).mockReturnValue(false);

        // When that submission is reported to this helper
        markPendingSearchWriteIfGlobalCreate(false);

        // Then the signal is left untouched - a non-global-create submit has its own call chain and
        // does not need this cross-tree signal
        expect(markPendingSearchWrite).not.toHaveBeenCalled();
    });

    it('does not raise the signal on the inbox', () => {
        // Given a submission started from inside the inbox's split navigator
        jest.mocked(isReportTopmostSplitNavigator).mockReturnValue(true);

        // When a global-create submit is reported from there
        markPendingSearchWriteIfGlobalCreate(true);

        // Then the signal is not raised, because being on the inbox already puts the write on a call
        // chain that can thread a barrier through directly
        expect(markPendingSearchWrite).not.toHaveBeenCalled();
    });
});
