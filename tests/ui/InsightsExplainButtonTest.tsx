import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import useAskConcierge from '@components/Search/SearchRouter/useAskConcierge';

import {buildInsightsExplanationQuery} from '@libs/InsightsExplanationUtils';
import {getDBTimeWithSkew} from '@libs/NetworkState';
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
const mockAskConcierge = jest.fn();
let mockIsOffline = false;
jest.mock('@hooks/useNetwork', () => ({__esModule: true, default: () => ({isOffline: mockIsOffline})}));

function renderButton(scope = SCOPE, isAccented = false) {
    return (
        <LocaleContextProvider>
            <InsightsExplainButton
                explainPrompt={PROMPT}
                insightsScope={scope}
                isAccented={isAccented}
            />
        </LocaleContextProvider>
    );
}

describe('InsightsExplainButton', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    beforeEach(async () => {
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

    it.each([false, true])('preloads without sending a message and keeps Explain visible when isAccented is %s', async (isAccented) => {
        // Given a chart or card with Concierge available.
        render(renderButton(SCOPE, isAccented));
        await waitForBatchedUpdatesWithAct();
        const jsonQuery = buildInsightsExplanationQuery(1, REPORT_ID, PROMPT, SCOPE);
        const hash = hashText(jsonQuery, 2 ** 32);

        // When the background answer arrives before the user clicks Explain.
        expect(preloadInsightsExplanation).toHaveBeenCalledTimes(1);
        expect(preloadInsightsExplanation).toHaveBeenCalledWith(jsonQuery, hash);
        expect(mockAskConcierge).not.toHaveBeenCalled();
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.INSIGHTS_EXPLANATION}${hash}`, {jsonQuery, response: 'Travel increased.', createdAt: getDBTimeWithSkew()});
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
            await Onyx.set(`${ONYXKEYS.COLLECTION.INSIGHTS_EXPLANATION}${hashText(oldQuery, 2 ** 32)}`, {jsonQuery: oldQuery, response: 'Old answer.', createdAt: getDBTimeWithSkew()});
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
});
