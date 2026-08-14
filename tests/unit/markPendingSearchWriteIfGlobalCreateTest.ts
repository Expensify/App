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
        jest.mocked(isReportTopmostSplitNavigator).mockReturnValue(false);

        markPendingSearchWriteIfGlobalCreate(true);

        expect(markPendingSearchWrite).toHaveBeenCalled();
    });

    it('does not raise the signal when the submit is not from global create', () => {
        jest.mocked(isReportTopmostSplitNavigator).mockReturnValue(false);

        markPendingSearchWriteIfGlobalCreate(false);

        expect(markPendingSearchWrite).not.toHaveBeenCalled();
    });

    it('does not raise the signal on the inbox', () => {
        jest.mocked(isReportTopmostSplitNavigator).mockReturnValue(true);

        markPendingSearchWriteIfGlobalCreate(true);

        expect(markPendingSearchWrite).not.toHaveBeenCalled();
    });
});
