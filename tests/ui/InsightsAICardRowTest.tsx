import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import useAskConcierge from '@components/Search/SearchRouter/useAskConcierge';

import useNetwork from '@hooks/useNetwork';

import InsightsAICardRow from '@pages/Insights/ai/InsightsAICardRow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AIInsight, InsightsScope} from '@src/types/onyx';

import type ReactNative from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import currencyList from '../unit/currencyList.json';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@components/Search/SearchRouter/useAskConcierge', () => jest.fn());
jest.mock('@pages/Insights/ai/InsightsAICardSkeleton', () => {
    const {View: MockView} = jest.requireActual<typeof ReactNative>('react-native');
    function MockInsightsAICardSkeleton() {
        return <MockView testID="InsightsAICardSkeleton" />;
    }
    return MockInsightsAICardSkeleton;
});

const SKELETON_TEST_ID = 'InsightsAICardSkeleton';
const mockAskConcierge = jest.fn();

const INSIGHTS_SCOPE: InsightsScope = {
    searchKey: CONST.INSIGHTS.SEARCH_KEY.SPEND,
    policyIDs: [],
    date: {preset: CONST.SEARCH.DATE_PRESETS.LAST_MONTH},
    groupCurrency: CONST.CURRENCY.USD,
};

const SPIKE: AIInsight = {
    id: 'spike',
    signal: CONST.INSIGHTS.AI_INSIGHT.SIGNAL.SPIKE,
    title: 'IT Site Hosting',
    chip: {type: CONST.INSIGHTS.AI_INSIGHT.CHIP_TYPE.CHANGE, direction: CONST.INSIGHTS.AI_INSIGHT.CHIP_DIRECTION.INCREASE, unit: CONST.INSIGHTS.AI_INSIGHT.CHIP_UNIT.PERCENT, value: 399.84},
    summary: 'Above its average this month.',
    explainPrompt: 'Why is IT Site Hosting spend above its average this month?',
};

const TREND: AIInsight = {
    id: 'trend',
    signal: CONST.INSIGHTS.AI_INSIGHT.SIGNAL.TREND,
    title: 'Advertising',
    chip: {
        type: CONST.INSIGHTS.AI_INSIGHT.CHIP_TYPE.CHANGE,
        direction: CONST.INSIGHTS.AI_INSIGHT.CHIP_DIRECTION.DECREASE,
        unit: CONST.INSIGHTS.AI_INSIGHT.CHIP_UNIT.AMOUNT,
        value: 3031800,
        currency: 'PLN',
    },
    summary: 'Down 3 months in a row.',
    explainPrompt: 'Why has Advertising spend gone down 3 months in a row?',
};

async function renderRow(insights: AIInsight[] | undefined, hasFailedToLoad = false, insightsScope = INSIGHTS_SCOPE) {
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <InsightsAICardRow
                insights={insights}
                insightsScope={insightsScope}
                hasFailedToLoad={hasFailedToLoad}
            />
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
}

describe('InsightsAICardRow', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        mockAskConcierge.mockClear();
        jest.mocked(useNetwork).mockReturnValue({isOffline: false});
        jest.mocked(useAskConcierge).mockReturnValue({
            askConcierge: mockAskConcierge,
            askConciergeWithAttachment: jest.fn(),
            shouldShowAskConcierge: true,
            conciergeTargetReportID: undefined,
        });
        await Onyx.set(ONYXKEYS.CURRENCY_LIST, currencyList);
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(() => Onyx.clear());

    it('shows a placeholder for every card while the insights have not arrived', async () => {
        // Given the dashboard has no insights yet and nothing went wrong
        // When the row renders
        await renderRow(undefined);

        // Then it shows one placeholder per card the backend can send, so the cards don't pop in
        expect(screen.getAllByTestId(SKELETON_TEST_ID)).toHaveLength(4);
    });

    it('renders nothing when the backend found no insights', async () => {
        // Given the backend sent an empty list, which means no insights will come
        // When the row renders
        await renderRow([]);

        // Then the row is hidden instead of waiting for cards
        expect(screen.toJSON()).toBeNull();
    });

    it('renders nothing when the request failed', async () => {
        // Given the insights never arrived because the dashboard request failed
        // When the row renders
        await renderRow(undefined, true);

        // Then the row is hidden, so the placeholders don't stay forever
        expect(screen.toJSON()).toBeNull();
    });

    it('renders nothing while offline with no insights', async () => {
        // Given the device is offline, so the insights can't arrive
        jest.mocked(useNetwork).mockReturnValue({isOffline: true});

        // When the row renders without insights
        await renderRow(undefined);

        // Then the row is hidden instead of loading forever
        expect(screen.toJSON()).toBeNull();
    });

    it('shows the title, summary and a whole-number percentage on each card', async () => {
        // Given an insight whose percentage has decimals
        // When the row renders
        await renderRow([SPIKE]);

        // Then the card shows its title and summary, with the percentage rounded the way the chip displays it
        expect(screen.getByText(SPIKE.title)).toBeOnTheScreen();
        expect(screen.getByText(SPIKE.summary)).toBeOnTheScreen();
        expect(screen.getByText('400%')).toBeOnTheScreen();
    });

    it('shows an amount in the chip currency, converted from cents', async () => {
        // Given an insight whose chip is an amount in PLN cents, different from the dashboard's Group currency
        // When the row renders
        await renderRow([TREND]);

        // Then the chip shows whole units of the chip currency, not cents, and not a percentage
        expect(screen.getByText(/30,318/)).toBeOnTheScreen();
        expect(screen.queryByText(/%/)).toBeNull();
    });

    it('tells screen readers which way the change went', async () => {
        // Given an increase and a decrease
        // When the row renders
        await renderRow([SPIKE, TREND]);

        // Then each chip reads its direction, since the arrow and color are only visual
        expect(screen.getByLabelText(/Up 400%/)).toBeOnTheScreen();
        expect(screen.getByLabelText(/Down .*30,318/)).toBeOnTheScreen();
    });

    it('explains matching child tags using each card’s parent and level', async () => {
        // Given the same child tag under two parents and a dashboard set to another level
        const scope = {...INSIGHTS_SCOPE, tagLevel: 1};
        const cards = ['US', 'EU'].map((parentTagPath) => ({...SPIKE, id: parentTagPath, title: `Marketing (${parentTagPath})`, tagLevel: 2, parentTagPath}));
        await renderRow(cards, false, scope);

        // When each card is explained
        const buttons = screen.getAllByText('Explain');
        fireEvent.press(buttons[0]);
        fireEvent.press(buttons[1]);

        // Then the selected card overrides only its request, without changing dashboard scope
        expect(mockAskConcierge).toHaveBeenNthCalledWith(1, SPIKE.explainPrompt, {insightsScope: {...scope, tagLevel: 2, tagParent: 'US'}});
        expect(mockAskConcierge).toHaveBeenNthCalledWith(2, SPIKE.explainPrompt, {insightsScope: {...scope, tagLevel: 2, tagParent: 'EU'}});
        expect(scope).toStrictEqual({...INSIGHTS_SCOPE, tagLevel: 1});
    });

    it.each(['', 'US\\:East:New York\\\\Office'])('preserves encoded parent %j without changing legacy card scope', async (parentTagPath) => {
        // Given tag metadata that is empty for independent tags or contains separator escapes
        const scope = {...INSIGHTS_SCOPE, tagLevel: 1};
        await renderRow([{...SPIKE, id: 'tag', tagLevel: 3, parentTagPath}, TREND], false, scope);

        // When the tag card and a legacy card are explained
        const buttons = screen.getAllByText('Explain');
        fireEvent.press(buttons[0]);
        fireEvent.press(buttons[1]);

        // Then parent bytes survive and cards without metadata retain their original scope
        expect(mockAskConcierge).toHaveBeenNthCalledWith(1, SPIKE.explainPrompt, {insightsScope: {...scope, tagLevel: 3, tagParent: parentTagPath}});
        expect(mockAskConcierge).toHaveBeenNthCalledWith(2, TREND.explainPrompt, {insightsScope: scope});
    });
});
