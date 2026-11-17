import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import useAskConcierge from '@components/Search/SearchRouter/useAskConcierge';

import DateUtils from '@libs/DateUtils';
import {buildInsightsExplanationQuery} from '@libs/InsightsExplanationUtils';
import {getServerAnchoredDBTime} from '@libs/NetworkState';
import {hashText} from '@libs/UserUtils';

import InsightsExplainButton from '@pages/Insights/ai/InsightsExplainButton';

import {preloadInsightsExplanation} from '@userActions/Insights';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsScope} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/Search/SearchRouter/useAskConcierge', () => jest.fn());
jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({__esModule: true, default: () => ({accountID: 1})}));
jest.mock('@userActions/Insights', () => ({preloadInsightsExplanation: jest.fn()}));

const SCOPE: InsightsScope = {
    searchKey: CONST.INSIGHTS.SEARCH_KEY.SPEND,
    policyIDs: [],
    date: {from: '2026-01-01', to: '2026-01-31'},
    groupCurrency: CONST.CURRENCY.USD,
};
const PROMPT = 'Explain this insight';
const REPORT_ID = '100';
const CACHE_LIFETIME_MS = 5 * 60 * 1000;
const mockAskConcierge = jest.fn();
let mockIsOffline = false;
jest.mock('@hooks/useNetwork', () => ({__esModule: true, default: () => ({isOffline: mockIsOffline})}));

function renderButton(scope = SCOPE) {
    return (
        <LocaleContextProvider>
            <InsightsExplainButton
                explainPrompt={PROMPT}
                insightsScope={scope}
            />
        </LocaleContextProvider>
    );
}

describe('InsightsExplainButton', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    beforeEach(async () => {
        jest.useRealTimers();
        await Onyx.clear();
        jest.clearAllMocks();
        mockIsOffline = false;
        jest.mocked(useAskConcierge).mockReturnValue({
            askConcierge: mockAskConcierge,
            askConciergeWithAttachment: jest.fn(),
            shouldShowAskConcierge: true,
            conciergeTargetReportID: REPORT_ID,
        });
    });
    afterEach(() => jest.useRealTimers());

    it('preloads without sending a message and keeps Explain visible', async () => {
        // Given a chart or card with Concierge available.
        render(renderButton());
        await waitForBatchedUpdatesWithAct();
        const jsonQuery = buildInsightsExplanationQuery(1, REPORT_ID, PROMPT, SCOPE);
        const hash = hashText(jsonQuery, 2 ** 32);

        // When the background answer arrives before the user clicks Explain.
        expect(preloadInsightsExplanation).toHaveBeenCalledTimes(1);
        expect(preloadInsightsExplanation).toHaveBeenCalledWith(jsonQuery, hash);
        expect(mockAskConcierge).not.toHaveBeenCalled();
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.INSIGHTS_EXPLANATION}${hash}`, {jsonQuery, response: 'Travel increased.', createdAt: getServerAnchoredDBTime()});
        });
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByRole('button'));

        // Then Explain stays accessible and the click immediately uses the preloaded answer.
        expect(screen.getByText('Explain')).toBeVisible();
        expect(mockAskConcierge).toHaveBeenCalledWith(PROMPT, {insightsScope: SCOPE}, 'Travel increased.');
    });

    it('does not reuse an earlier filter scope while a new answer is loading', async () => {
        // Given an answer for the original filters and a new workspace/currency selection.
        const oldQuery = buildInsightsExplanationQuery(1, REPORT_ID, PROMPT, SCOPE);
        const newScope: InsightsScope = {...SCOPE, policyIDs: ['ABC123'], groupCurrency: CONST.CURRENCY.GBP};
        const {rerender} = render(renderButton());
        rerender(renderButton(newScope));

        // When the old answer arrives after the filters have changed and the user clicks Explain.
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.INSIGHTS_EXPLANATION}${hashText(oldQuery, 2 ** 32)}`, {jsonQuery: oldQuery, response: 'Old answer.', createdAt: getServerAnchoredDBTime()});
        });
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByRole('button'));

        // Then a normal live request is sent for the new filters, rather than showing the old answer.
        expect(preloadInsightsExplanation).toHaveBeenLastCalledWith(buildInsightsExplanationQuery(1, REPORT_ID, PROMPT, newScope), expect.any(Number));
        expect(mockAskConcierge).toHaveBeenCalledWith(PROMPT, {insightsScope: newScope}, undefined);
    });

    it('keeps the offline click flow and preloads after reconnecting', async () => {
        // Given Insights opens offline without a preloaded answer.
        mockIsOffline = true;
        const {rerender} = render(renderButton());
        await waitForBatchedUpdatesWithAct();

        // When Explain is clicked offline, then retain the existing queued-comment path without preloading.
        fireEvent.press(screen.getByRole('button'));
        expect(preloadInsightsExplanation).not.toHaveBeenCalled();
        expect(mockAskConcierge).toHaveBeenCalledWith(PROMPT, {insightsScope: SCOPE}, undefined);

        // When connectivity returns, then preload the current question without sending another message.
        mockIsOffline = false;
        rerender(renderButton());
        await waitForBatchedUpdatesWithAct();
        expect(preloadInsightsExplanation).toHaveBeenCalledTimes(1);
    });

    it('does not preload when Concierge is unavailable', async () => {
        // Given Concierge has not loaded yet.
        jest.mocked(useAskConcierge).mockReturnValue({askConcierge: jest.fn(), askConciergeWithAttachment: jest.fn(), shouldShowAskConcierge: false, conciergeTargetReportID: undefined});

        // When the chart renders, then avoid sending a request with no target chat.
        render(renderButton());
        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByRole('button')).toBeNull();
        expect(preloadInsightsExplanation).not.toHaveBeenCalled();
    });

    it('refreshes an answer at expiry and schedules the next refresh only after a fresh answer arrives', async () => {
        // Given a cached answer with only one minute left when Insights opens.
        jest.useFakeTimers({doNotFake: ['nextTick', 'setImmediate']});
        const jsonQuery = buildInsightsExplanationQuery(1, REPORT_ID, PROMPT, SCOPE);
        const key = `${ONYXKEYS.COLLECTION.INSIGHTS_EXPLANATION}${hashText(jsonQuery, 2 ** 32)}` as const;
        await Onyx.set(key, {jsonQuery, response: 'Cached answer.', createdAt: DateUtils.subtractMillisecondsFromDateTime(getServerAnchoredDBTime(), 4 * 60 * 1000)});
        const {rerender} = render(renderButton());
        await act(async () => {
            await new Promise<void>(setImmediate);
        });

        // When its remaining lifetime passes without any other page updates.
        act(() => jest.advanceTimersByTime(60 * 1000 - 1));
        expect(preloadInsightsExplanation).not.toHaveBeenCalled();
        act(() => jest.advanceTimersByTime(1));

        // Then exactly one refresh starts, and clicks still reject the expired answer while it loads.
        expect(preloadInsightsExplanation).toHaveBeenCalledTimes(1);
        expect(preloadInsightsExplanation).toHaveBeenCalledWith(jsonQuery, hashText(jsonQuery, 2 ** 32));
        fireEvent.press(screen.getByRole('button'));
        expect(mockAskConcierge).toHaveBeenLastCalledWith(PROMPT, {insightsScope: SCOPE}, undefined);

        // When a new answer arrives, then its own timestamp starts the next lifetime.
        await act(async () => {
            await Onyx.set(key, {jsonQuery, response: 'Fresh answer.', createdAt: getServerAnchoredDBTime()});
            await new Promise<void>(setImmediate);
        });
        fireEvent.press(screen.getByRole('button'));
        expect(mockAskConcierge).toHaveBeenLastCalledWith(PROMPT, {insightsScope: SCOPE}, 'Fresh answer.');
        act(() => jest.advanceTimersByTime(CACHE_LIFETIME_MS - 1));
        expect(preloadInsightsExplanation).toHaveBeenCalledTimes(1);
        act(() => jest.advanceTimersByTime(1));
        expect(preloadInsightsExplanation).toHaveBeenCalledTimes(2);

        // When that refresh produces no answer, then unrelated renders do not cause a retry loop.
        rerender(renderButton());
        act(() => jest.advanceTimersByTime(2 * CACHE_LIFETIME_MS));
        expect(preloadInsightsExplanation).toHaveBeenCalledTimes(2);
    });

    it.each(['filters', 'offline', 'unmount', 'unavailable'] as const)('cancels the old refresh when the context changes: %s', async (change) => {
        // Given a loaded answer whose refresh timer belongs to the current filters and Concierge availability.
        jest.useFakeTimers({doNotFake: ['nextTick', 'setImmediate']});
        const jsonQuery = buildInsightsExplanationQuery(1, REPORT_ID, PROMPT, SCOPE);
        await Onyx.set(`${ONYXKEYS.COLLECTION.INSIGHTS_EXPLANATION}${hashText(jsonQuery, 2 ** 32)}`, {jsonQuery, response: 'Cached answer.', createdAt: getServerAnchoredDBTime()});
        const {rerender, unmount} = render(renderButton());
        await act(async () => {
            await new Promise<void>(setImmediate);
        });

        // When those filters or availability change before the answer expires.
        if (change === 'filters') {
            rerender(renderButton({...SCOPE, groupCurrency: CONST.CURRENCY.GBP}));
        } else if (change === 'offline') {
            mockIsOffline = true;
            rerender(renderButton());
        } else if (change === 'unavailable') {
            jest.mocked(useAskConcierge).mockReturnValue({
                askConcierge: mockAskConcierge,
                askConciergeWithAttachment: jest.fn(),
                shouldShowAskConcierge: false,
                conciergeTargetReportID: REPORT_ID,
            });
            rerender(renderButton());
        } else {
            unmount();
        }
        jest.mocked(preloadInsightsExplanation).mockClear();
        act(() => jest.advanceTimersByTime(CACHE_LIFETIME_MS));

        // Then the old context never starts a background request after its timer should have been canceled.
        expect(preloadInsightsExplanation).not.toHaveBeenCalled();
        if (change !== 'offline') {
            return;
        }

        // When reconnecting after expiry, then refresh once and keep the live click fallback while it loads.
        fireEvent.press(screen.getByRole('button'));
        expect(mockAskConcierge).toHaveBeenLastCalledWith(PROMPT, {insightsScope: SCOPE}, undefined);
        mockIsOffline = false;
        rerender(renderButton());
        expect(preloadInsightsExplanation).toHaveBeenCalledTimes(1);
        expect(preloadInsightsExplanation).toHaveBeenCalledWith(jsonQuery, hashText(jsonQuery, 2 ** 32));
    });
});
