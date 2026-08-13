import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import reserveSearchChannelIfGlobalCreate from '@libs/Navigation/helpers/reserveSearchChannelIfGlobalCreate';
import {reserveWriteSession} from '@libs/submitWriteSession';

import CONST from '@src/CONST';

jest.mock('@libs/submitWriteSession', () => ({reserveWriteSession: jest.fn()}));
jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => jest.fn());

describe('reserveSearchChannelIfGlobalCreate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('reserves the SEARCH channel for a global-create submit off the inbox', () => {
        jest.mocked(isReportTopmostSplitNavigator).mockReturnValue(false);

        reserveSearchChannelIfGlobalCreate(true);

        expect(reserveWriteSession).toHaveBeenCalledWith(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
    });

    it('does not reserve when the submit is not from global create', () => {
        jest.mocked(isReportTopmostSplitNavigator).mockReturnValue(false);

        reserveSearchChannelIfGlobalCreate(false);

        expect(reserveWriteSession).not.toHaveBeenCalled();
    });

    it('does not reserve on the inbox', () => {
        jest.mocked(isReportTopmostSplitNavigator).mockReturnValue(true);

        reserveSearchChannelIfGlobalCreate(true);

        expect(reserveWriteSession).not.toHaveBeenCalled();
    });
});
