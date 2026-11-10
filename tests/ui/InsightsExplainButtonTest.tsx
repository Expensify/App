import {render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import useAskConcierge from '@components/Search/SearchRouter/useAskConcierge';

import InsightsExplainButton from '@pages/Insights/ai/InsightsExplainButton';

import CONST from '@src/CONST';

import React from 'react';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/Search/SearchRouter/useAskConcierge', () => jest.fn());

describe('InsightsExplainButton', () => {
    it.each([false, true])('hides the Explain button when isAccented is %s', async (isAccented) => {
        // Given Concierge is available, so its availability does not hide the button
        jest.mocked(useAskConcierge).mockReturnValue({
            askConcierge: jest.fn(),
            askConciergeWithAttachment: jest.fn(),
            shouldShowAskConcierge: true,
            conciergeTargetReportID: undefined,
        });

        // When a chart or AI insight renders its Explain button
        render(
            <LocaleContextProvider>
                <InsightsExplainButton
                    explainPrompt="Explain this insight"
                    insightsScope={{
                        searchKey: CONST.INSIGHTS.SEARCH_KEY.SPEND,
                        policyIDs: [],
                        date: {from: '2026-01-01', to: '2026-01-31'},
                        groupCurrency: CONST.CURRENCY.USD,
                    }}
                    isAccented={isAccented}
                />
            </LocaleContextProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the button remains implemented but is hidden from users and accessibility queries
        expect(screen.getByText('Explain', {includeHiddenElements: true})).not.toBeVisible();
        expect(screen.queryByRole('button')).toBeNull();
    });
});
