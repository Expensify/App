import {act, renderHook} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useReportSubmitToPopover from '@hooks/useReportSubmitToPopover';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const REPORT_ID = 'report1';

function wrapper({children}: {children: React.ReactNode}) {
    return (
        <OnyxListItemProvider>
            <LocaleContextProvider>{children}</LocaleContextProvider>
        </OnyxListItemProvider>
    );
}

describe('useReportSubmitToPopover', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('drops only the Submit press that dismissed the popover, in the same tick', async () => {
        // Given a submit-to popover that a Search row press just dismissed, before React has re-rendered the guard state
        const {result} = renderHook(() => useReportSubmitToPopover({reportID: REPORT_ID}), {wrapper});
        await waitForBatchedUpdatesWithAct();
        const {closeReportSubmitToPopover, interceptSearchSubmitPress} = result.current;
        closeReportSubmitToPopover();

        // When the row checks the press that closed the popover, then checks a later press, then an action that is not Submit
        const isFirstSubmitIgnored = interceptSearchSubmitPress(CONST.SEARCH.ACTION_TYPES.SUBMIT);
        const isSecondSubmitIgnored = interceptSearchSubmitPress(CONST.SEARCH.ACTION_TYPES.SUBMIT);
        const isViewIgnored = interceptSearchSubmitPress(CONST.SEARCH.ACTION_TYPES.VIEW);

        // Then only the first Submit press is dropped, because the dismiss click must not reopen the popover, while View never waits on the guard
        expect(isFirstSubmitIgnored).toBe(true);
        expect(isSecondSubmitIgnored).toBe(false);
        expect(isViewIgnored).toBe(false);
    });

    it('resets the one-shot guard in a microtask, so rows must check it before their first await', async () => {
        // Given a submit-to popover that was just dismissed
        const {result} = renderHook(() => useReportSubmitToPopover({reportID: REPORT_ID}), {wrapper});
        await waitForBatchedUpdatesWithAct();
        const {closeReportSubmitToPopover, interceptSearchSubmitPress} = result.current;
        closeReportSubmitToPopover();

        // When a row checks the guard only after awaiting something
        await Promise.resolve();
        const isSubmitIgnoredAfterAwait = interceptSearchSubmitPress(CONST.SEARCH.ACTION_TYPES.SUBMIT);

        // Then the one-shot guard is already gone, which is why the row handlers call it before any Onyx read
        expect(isSubmitIgnoredAfterAwait).toBe(false);
    });
});
