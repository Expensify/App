import {act, renderHook} from '@testing-library/react-native';

import useShouldSkipComposerAutoFocus from '@pages/inbox/report/ReportActionCompose/useShouldSkipComposerAutoFocus';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';

import {NavigationRouteContext} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/getPlatform', () => ({
    __esModule: true,
    default: () => 'web',
}));

const oneExpenseReport = {reportID: '1', type: CONST.REPORT.TYPE.EXPENSE, transactionCount: 1} as Report;
const chatReport = {reportID: '2', type: CONST.REPORT.TYPE.CHAT} as Report;

function renderOnScreen(screenName: string, report: Report) {
    return renderHook(() => useShouldSkipComposerAutoFocus(report), {
        wrapper: ({children}) => <NavigationRouteContext.Provider value={{key: 'route', name: screenName, params: undefined}}>{children}</NavigationRouteContext.Provider>,
    });
}

describe('useShouldSkipComposerAutoFocus', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, ['t1', 't2']);
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('skips auto-focus for an expense in the RHP when the arrow keys can move to another expense', () => {
        // Given a one-expense report opened in the RHP from a list with other expenses
        const {result} = renderOnScreen(SCREENS.RIGHT_MODAL.SEARCH_REPORT, oneExpenseReport);

        // Then the composer stays unfocused so the arrow keys move between expenses
        expect(result.current).toBe(true);
    });

    it('keeps auto-focus when the expense is open in the central pane', () => {
        // Given the same expense opened in the central Report screen, where the arrow keys don't move between expenses
        const {result} = renderOnScreen(SCREENS.REPORT, oneExpenseReport);

        // Then the composer auto-focuses as usual
        expect(result.current).toBe(false);
    });

    it('keeps auto-focus when there is no other expense to move to', async () => {
        // Given the expense list has only this expense
        await Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, ['t1']);
        await waitForBatchedUpdates();
        const {result} = renderOnScreen(SCREENS.RIGHT_MODAL.SEARCH_REPORT, oneExpenseReport);

        // Then the composer auto-focuses as usual
        expect(result.current).toBe(false);
    });

    it('keeps auto-focus for a regular chat', () => {
        // Given a regular chat opened in the RHP
        const {result} = renderOnScreen(SCREENS.RIGHT_MODAL.SEARCH_REPORT, chatReport);

        // Then the composer auto-focuses as usual
        expect(result.current).toBe(false);
    });
});
