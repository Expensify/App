import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import useAskConcierge from '@components/Search/SearchRouter/useAskConcierge';

import useNetwork from '@hooks/useNetwork';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';

import Accessibility from '@libs/Accessibility';
import {isRecord} from '@libs/ObjectUtils';

import InsightsAICardRow from '@pages/Insights/ai/InsightsAICardRow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AIInsight, InsightsScope} from '@src/types/onyx';

import React from 'react';
import {StyleSheet} from 'react-native';
import Onyx from 'react-native-onyx';

import currencyList from '../unit/currencyList.json';
import createMock from '../utils/createMock';
import findAncestorWithStyle from '../utils/findAncestorWithStyle';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@components/Search/SearchRouter/useAskConcierge', () => jest.fn());
const LOADING_TITLE = 'Generating AI Insights...';
const LOADING_SUBTITLE = "This shouldn't take more than a minute";

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
    const result = render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <InsightsAICardRow
                insights={insights}
                insightsScope={insightsScope}
                hasFailedToLoad={hasFailedToLoad}
            />
        </ComposeProviders>,
    );
    await act(async () => jest.advanceTimersByTimeAsync(0));
    return result;
}

describe('InsightsAICardRow', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        jest.useFakeTimers();
        jest.mocked(useNetwork).mockReturnValue({isOffline: false});
        jest.mocked(useAskConcierge).mockReturnValue({askConcierge: jest.fn(), askConciergeWithAttachment: jest.fn(), shouldShowAskConcierge: true, conciergeTargetReportID: undefined});
        await Onyx.set(ONYXKEYS.CURRENCY_LIST, currencyList);
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await Onyx.clear();
        jest.restoreAllMocks();
    });

    it('shows one generation message while the insights have not arrived', async () => {
        // Given the dashboard has no insights yet and nothing went wrong
        // When the row renders
        await renderRow(undefined);

        // Then it explains what is loading and how long the user should expect to wait
        expect(screen.getAllByText(LOADING_TITLE)).toHaveLength(1);
        expect(screen.getByText(LOADING_SUBTITLE)).toBeOnTheScreen();
        expect(screen.getByTestId(CONST.LOTTIE_VIEW_TEST_ID)).toHaveStyle({width: 40, height: 40});
    });

    it('advances through the loading hints and waits on the last one until insights arrive', async () => {
        // Given the backend has not finished generating insights
        await renderRow(undefined);
        const messages = ['Reading Spend over time', 'Comparing with your average', 'Looking for anything unusual', 'Writing your insights'];

        // When each two-second hint interval elapses
        for (const message of messages) {
            await act(async () => jest.advanceTimersByTimeAsync(2000));

            // Then the next hint replaces the previous one while the loading title stays visible
            expect(screen.getByText(message)).toBeOnTheScreen();
            expect(screen.getByText(LOADING_TITLE)).toBeOnTheScreen();
        }

        await act(async () => jest.advanceTimersByTimeAsync(60000));
        expect(screen.getByText('Writing your insights')).toBeOnTheScreen();
        expect(screen.queryByText(LOADING_SUBTITLE)).toBeNull();
    });

    it('cancels the next loading hint when the row unmounts', async () => {
        // Given the loader has scheduled its next hint
        const {unmount} = await renderRow(undefined);
        const pendingTimers = jest.getTimerCount();

        // When the user leaves Insights before generation finishes
        unmount();

        // Then the hint timer is removed instead of updating an unmounted loader
        expect(jest.getTimerCount()).toBeLessThan(pendingTimers);
    });

    it.each([
        [CONST.INSIGHTS.SEARCH_KEY.EFFICIENCY, 'Reading Workflow efficiency'],
        [CONST.INSIGHTS.SEARCH_KEY.COMPLIANCE, 'Reading Violations over time'],
    ] as const)('names the current chart in the loading hint for %s', async (searchKey, message) => {
        // Given a dashboard other than Spend is generating insights
        await renderRow(undefined, false, {...INSIGHTS_SCOPE, searchKey});

        // When the first progress hint appears
        await act(async () => jest.advanceTimersByTimeAsync(2000));

        // Then it names this dashboard's chart rather than Spend over time
        expect(screen.getByText(message)).toBeOnTheScreen();
    });

    it('replaces the generation message with cards when insights arrive', async () => {
        // Given a progress hint is already visible while the user waits for insights
        const {rerender} = await renderRow(undefined);
        await act(async () => jest.advanceTimersByTimeAsync(2000));
        expect(screen.getByText('Reading Spend over time')).toBeOnTheScreen();

        // When the dashboard receives its generated insights
        rerender(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
                <InsightsAICardRow
                    insights={[SPIKE]}
                    insightsScope={INSIGHTS_SCOPE}
                    hasFailedToLoad={false}
                />
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the loading message disappears and the generated card becomes available
        expect(screen.queryByText(LOADING_TITLE)).toBeNull();
        expect(screen.queryByText(LOADING_SUBTITLE)).toBeNull();
        expect(screen.queryByText('Reading Spend over time')).toBeNull();
        expect(screen.getByText(SPIKE.title)).toBeOnTheScreen();
    });

    it.each([
        ['desktop', false, false],
        ['tablet', false, true],
        ['narrow', true, false],
    ] as const)('reserves the same space for the loader and cards on %s layouts', async (_layout, shouldUseNarrowLayout, isMediumScreenWidth) => {
        // Given loading and loaded content share a responsive space reservation
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(createMock<ReturnType<typeof useResponsiveLayoutModule.default>>({shouldUseNarrowLayout, isMediumScreenWidth}));
        const {rerender} = await renderRow(undefined);
        const loadingStyle: unknown = StyleSheet.flatten(screen.root.props.style);
        const minHeight = isRecord(loadingStyle) ? loadingStyle.minHeight : undefined;
        expect(minHeight).toEqual(expect.any(Number));
        expect(findAncestorWithStyle(screen.getByText(LOADING_TITLE), 'minHeight', minHeight)).toBeDefined();

        // When insights arrive and replace the loader
        rerender(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
                <InsightsAICardRow
                    insights={[SPIKE, TREND]}
                    insightsScope={INSIGHTS_SCOPE}
                    hasFailedToLoad={false}
                />
            </ComposeProviders>,
        );
        await act(async () => jest.advanceTimersByTimeAsync(0));

        // Then the chart below keeps the same reserved boundary
        expect(findAncestorWithStyle(screen.getByText(SPIKE.title), 'minHeight', minHeight)).toBeDefined();
    });

    it('reveals cards one at a time across tablet rows', async () => {
        // Given four insights in the two-column tablet layout
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(
            createMock<ReturnType<typeof useResponsiveLayoutModule.default>>({shouldUseNarrowLayout: false, isMediumScreenWidth: true}),
        );
        const insights = [SPIKE, TREND, {...SPIKE, id: 'second-spike', title: 'Another spike'}, {...TREND, id: 'second-trend', title: 'Another trend'}];

        // When the cards replace the loader
        await renderRow(insights);

        // Then the second row continues the sequence instead of restarting with the first row
        for (const [index, insight] of insights.entries()) {
            expect(findAncestorWithStyle(screen.getByText(insight.title), 'animationDelay', index * 120)).toBeDefined();
        }
    });

    it('shows cards immediately when reduced motion is enabled', async () => {
        // Given the user has requested less motion
        jest.spyOn(Accessibility, 'useReducedMotion').mockReturnValue(true);

        // When generated insights are available
        await renderRow([SPIKE, TREND]);

        // Then no delayed entrances run and every card remains readable
        expect(findAncestorWithStyle(screen.getByText(SPIKE.title), 'animationDelay', 0)).toBeUndefined();
        expect(findAncestorWithStyle(screen.getByText(TREND.title), 'animationDelay', 120)).toBeUndefined();
        expect(screen.getByText(SPIKE.title)).toBeOnTheScreen();
        expect(screen.getByText(TREND.title)).toBeOnTheScreen();
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

        // Then the row is hidden, so the loading message doesn't stay forever
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

    it('keeps cached insights visible while offline', async () => {
        // Given the device is offline but previously generated insights are cached
        jest.mocked(useNetwork).mockReturnValue({isOffline: true});

        // When the row renders the cached insights
        await renderRow([SPIKE]);

        // Then the user can still read their insight without a generation message
        expect(screen.getByText(SPIKE.title)).toBeOnTheScreen();
        expect(screen.queryByText(LOADING_TITLE)).toBeNull();
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

    it('shows duration changes in hours below a day and days otherwise', async () => {
        // Given Efficiency cards with time differences below and above one day
        const slower: AIInsight = {
            ...SPIKE,
            title: 'Time to submit',
            chip: {
                type: CONST.INSIGHTS.AI_INSIGHT.CHIP_TYPE.CHANGE,
                direction: CONST.INSIGHTS.AI_INSIGHT.CHIP_DIRECTION.INCREASE,
                unit: CONST.INSIGHTS.AI_INSIGHT.CHIP_UNIT.DURATION,
                value: 12600,
            },
        };
        const faster: AIInsight = {
            ...TREND,
            title: 'Time to approve',
            chip: {
                type: CONST.INSIGHTS.AI_INSIGHT.CHIP_TYPE.CHANGE,
                direction: CONST.INSIGHTS.AI_INSIGHT.CHIP_DIRECTION.DECREASE,
                unit: CONST.INSIGHTS.AI_INSIGHT.CHIP_UNIT.DURATION,
                value: 362880,
            },
        };

        const smallChange: AIInsight = {...faster, id: 'record', title: 'Time to pay', chip: {...faster.chip, value: 120}};

        // When the cards render
        await renderRow([slower, faster, smallChange], false, {...INSIGHTS_SCOPE, searchKey: CONST.INSIGHTS.SEARCH_KEY.EFFICIENCY});

        // Then each localized value keeps the correct change direction
        expect(screen.getByLabelText('Up 3.5 hours')).toBeOnTheScreen();
        expect(screen.getByLabelText('Down 4.2 days')).toBeOnTheScreen();
        expect(screen.getByLabelText('Down <0.1 hours')).toBeOnTheScreen();
    });

    it('formats a neutral duration chip in days instead of money or a percentage', async () => {
        // Given an Efficiency duration in seconds
        const insight: AIInsight = {...SPIKE, chip: {type: CONST.INSIGHTS.AI_INSIGHT.CHIP_TYPE.NEUTRAL, unit: CONST.INSIGHTS.AI_INSIGHT.CHIP_UNIT.DURATION, value: 216000}};

        // When the structured card renders
        await renderRow([insight]);

        // Then the chip uses compact days and keeps the card's title and summary
        expect(screen.getByText('2.5d')).toBeOnTheScreen();
        expect(screen.getByText(insight.title)).toBeOnTheScreen();
        expect(screen.getByText(insight.summary)).toBeOnTheScreen();
        expect(screen.queryByText(/%/)).toBeNull();
    });

    it('formats a neutral count chip without money or a percentage', async () => {
        // Given a Compliance count
        const insight: AIInsight = {...SPIKE, chip: {type: CONST.INSIGHTS.AI_INSIGHT.CHIP_TYPE.NEUTRAL, unit: CONST.INSIGHTS.AI_INSIGHT.CHIP_UNIT.COUNT, value: 1234}};

        // When the structured card renders
        await renderRow([insight]);

        // Then the chip uses the count and keeps the card's title and summary
        expect(screen.getByText('1,234')).toBeOnTheScreen();
        expect(screen.getByText(insight.title)).toBeOnTheScreen();
        expect(screen.getByText(insight.summary)).toBeOnTheScreen();
        expect(screen.queryByText(/%/)).toBeNull();
    });
});
