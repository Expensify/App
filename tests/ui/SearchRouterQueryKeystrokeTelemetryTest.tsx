import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SearchQueryItem} from '@components/Search/SearchList/ListItem/SearchQueryListItem';
import SearchRouter from '@components/Search/SearchRouter/SearchRouter';

import {cancelAllSpans} from '@libs/telemetry/activeSpans';

import ComposeProviders from '@src/components/ComposeProviders';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type FakeSpan = {
    op?: string;
    startTime?: number;
    attributes: Record<string, unknown>;
    setAttribute: (key: string, value: unknown) => void;
    setAttributes: (attrs: Record<string, unknown>) => void;
    setStatus: () => void;
    end: () => void;
};

const mockStarted: FakeSpan[] = [];
const mockEnded: FakeSpan[] = [];

jest.mock('@sentry/react-native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@sentry/react-native'),
    startInactiveSpan: (options: {op?: string; startTime?: number; attributes?: Record<string, unknown>}): FakeSpan => {
        const span: FakeSpan = {
            op: options.op,
            startTime: options.startTime,
            attributes: {...options.attributes},
            setAttribute(key: string, value: unknown) {
                this.attributes[key] = value;
            },
            setAttributes(attrs: Record<string, unknown>) {
                Object.assign(this.attributes, attrs);
            },
            setStatus() {},
            end() {
                mockEnded.push(this);
            },
        };
        mockStarted.push(span);
        return span;
    },
    spanToJSON: (span: FakeSpan) => ({data: span.attributes}),
}));

// Sentry caches its clock on first use, which breaks once Jest swaps `performance` for each test's fake timers.
jest.mock('@sentry/core', () => ({
    ...jest.requireActual<Record<string, unknown>>('@sentry/core'),
    timestampInSeconds: () => performance.now() / 1000,
}));

let mockOnListItemPress: ((item: SearchQueryItem) => void) | undefined;

// The list never commits, so every measured query stays open until the next one supersedes it.
// Its row press handler is kept so tests can pick a suggestion.
jest.mock('@components/Search/DeferredSearchAutocompleteList', () => ({
    __esModule: true,
    default: ({onListItemPress}: {onListItemPress: (item: SearchQueryItem) => void}) => {
        mockOnListItemPress = onListItemPress;
        return null;
    },
}));

jest.mock('@src/libs/Log');

jest.mock('@src/libs/API', () => ({
    write: jest.fn(),
    makeRequestWithSideEffects: jest.fn(),
    read: jest.fn(),
}));

jest.mock('@src/libs/Navigation/Navigation', () => ({
    dismissModalWithReport: jest.fn(),
    getTopmostReportId: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isDisplayedInModal: jest.fn(() => false),
    getActiveRouteWithoutParams: jest.fn(() => ''),
}));

jest.mock('@src/hooks/useRootNavigationState', () => ({
    __esModule: true,
    default: () => ({
        contextualReportID: undefined,
        isSearchRouterScreen: false,
    }),
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof NativeNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useFocusEffect: jest.fn(),
        useIsFocused: () => true,
        useRoute: () => jest.fn(),
        usePreventRemove: () => jest.fn(),
        useNavigation: () => ({
            navigate: jest.fn(),
            addListener: () => jest.fn(),
        }),
        createNavigationContainerRef: () => ({
            addListener: () => jest.fn(),
            removeListener: () => jest.fn(),
            isReady: () => jest.fn(),
            getCurrentRoute: () => jest.fn(),
            getState: () => jest.fn(),
            getRootState: () => undefined,
        }),
        useNavigationState: () => ({
            routes: [],
        }),
    };
});

jest.mock('@src/components/ConfirmedRoute.tsx');

const ROOT = CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY;
const DEBOUNCE_TIME = CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME;
const KEYSTROKE_INTERVAL = 50;

function getStartedQuerySpans() {
    return mockStarted.filter((span) => span.op === ROOT);
}

function getEndedQuerySpans() {
    return mockEnded.filter((span) => span.op === ROOT);
}

function getSearchRouter(isSearchRouterDisplayed = true) {
    return (
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <SearchRouter
                onRouterClose={jest.fn()}
                isSearchRouterDisplayed={isSearchRouterDisplayed}
            />
        </ComposeProviders>
    );
}

async function renderSearchRouter() {
    const {rerender} = render(getSearchRouter());
    await waitForBatchedUpdatesWithAct();
    return {closeSearchRouter: () => rerender(getSearchRouter(false))};
}

function type(text: string) {
    fireEvent.changeText(screen.getByTestId('search-autocomplete-text-input'), text);
}

function advance(ms: number) {
    act(() => {
        jest.advanceTimersByTime(ms);
    });
}

/** Types every prefix of `text` faster than the debounce delay and returns when the last keystroke happened. */
function typeBurst(text: string) {
    for (let length = 1; length < text.length; length++) {
        type(text.slice(0, length));
        advance(KEYSTROKE_INTERVAL);
    }
    type(text);
    return performance.now();
}

describe('SearchRouter query telemetry from the keystroke', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        // Fake timers drive both the debounce and `performance.now()`, so keystroke times are exact.
        jest.useFakeTimers();
        mockStarted.length = 0;
        mockEnded.length = 0;
    });

    afterEach(async () => {
        cancelAllSpans();
        await act(async () => {
            await Onyx.clear();
        });
        jest.useRealTimers();
    });

    it('measures a burst of keystrokes as one query that starts at the last keystroke', async () => {
        // Given an open Search Router
        await renderSearchRouter();

        // When the user types several characters faster than the debounce delay
        const lastKeystrokeAt = typeBurst('abcdef');

        // Then nothing is measured or sent while the debounce is pending, because no evaluation has started
        expect(getStartedQuerySpans()).toHaveLength(0);
        expect(getEndedQuerySpans()).toHaveLength(0);

        // When the debounce delay passes
        advance(DEBOUNCE_TIME);

        // Then exactly one span starts for the settled query, backdated to the last keystroke so the debounce delay is included
        const startedSpans = getStartedQuerySpans();
        expect(startedSpans).toHaveLength(1);
        expect(startedSpans.at(0)?.attributes[CONST.TELEMETRY.ATTRIBUTE_QUERY_ORDINAL]).toBe(1);
        expect(startedSpans.at(0)?.startTime).toBeCloseTo(lastKeystrokeAt / 1000, 3);
    });

    it('counts only settled queries toward the per-open cap', async () => {
        // Given an open Search Router
        await renderSearchRouter();

        // When the user types one more settled query than the cap allows, each after a burst of intermediate keystrokes
        for (let i = 0; i <= CONST.TELEMETRY.SEARCH_ROUTER_MAX_MEASURED_QUERIES_PER_OPEN; i++) {
            typeBurst(`${i}abc`);
            advance(DEBOUNCE_TIME);
        }

        // Then intermediate keystrokes used none of the cap, so one span started per settled query up to the cap
        const ordinals = getStartedQuerySpans().map((span) => span.attributes[CONST.TELEMETRY.ATTRIBUTE_QUERY_ORDINAL]);
        expect(ordinals).toEqual([1, 2, 3, 4, 5]);

        // Then every span that was overtaken after its evaluation started is still sent, cancelled as superseded
        const endedSpans = getEndedQuerySpans();
        expect(endedSpans).toHaveLength(CONST.TELEMETRY.SEARCH_ROUTER_MAX_MEASURED_QUERIES_PER_OPEN);
        for (const span of endedSpans) {
            expect(span.attributes[CONST.TELEMETRY.ATTRIBUTE_CANCEL_REASON]).toBe(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_CANCEL_REASON.SUPERSEDED);
        }
    });

    it('does not move the span start for a keystroke that leaves the query unchanged', async () => {
        // Given the user typed a query
        await renderSearchRouter();
        type('ab');
        const changedAt = performance.now();

        // When an input event repeats the same query before the debounce fires, which does not restart the debounce timer
        advance(KEYSTROKE_INTERVAL);
        type('ab');
        advance(DEBOUNCE_TIME);

        // Then the span starts at the keystroke that actually changed the query
        const startedSpans = getStartedQuerySpans();
        expect(startedSpans).toHaveLength(1);
        expect(startedSpans.at(0)?.startTime).toBeCloseTo(changedAt / 1000, 3);
    });

    it('backdates the span start to the input event timestamp when the event waited for the JS thread', async () => {
        // Given an open Search Router
        await renderSearchRouter();

        // When the input event happened 200ms before its handler ran, as when JS was busy rendering the previous query
        const eventTimeStamp = performance.now() - 200;
        const input = screen.getByTestId('search-autocomplete-text-input');
        fireEvent(input, 'change', {timeStamp: eventTimeStamp});
        fireEvent.changeText(input, 'ab');
        advance(DEBOUNCE_TIME);

        // Then the span starts at the event time, so the wait in the JS queue is part of the measurement
        const startedSpans = getStartedQuerySpans();
        expect(startedSpans).toHaveLength(1);
        expect(startedSpans.at(0)?.startTime).toBeCloseTo(eventTimeStamp / 1000, 3);
    });

    it('cancels the span as superseded when the user types while the list is still evaluating the query', async () => {
        // Given a settled query whose span is open because the list has not committed it yet
        await renderSearchRouter();
        type('ab');
        advance(DEBOUNCE_TIME);
        expect(getStartedQuerySpans()).toHaveLength(1);
        expect(getEndedQuerySpans()).toHaveLength(0);

        // When the user types another character before the list commits
        type('abc');

        // Then the span is cancelled at that keystroke, without waiting for the debounce, so its measurement never includes the new input
        const endedSpans = getEndedQuerySpans();
        expect(endedSpans).toHaveLength(1);
        expect(endedSpans.at(0)?.attributes[CONST.TELEMETRY.ATTRIBUTE_CANCELED]).toBe(true);
        expect(endedSpans.at(0)?.attributes[CONST.TELEMETRY.ATTRIBUTE_CANCEL_REASON]).toBe(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_CANCEL_REASON.SUPERSEDED);
    });

    it('cancels the span as cleared when the user clears the input while the list is still evaluating the query', async () => {
        // Given a settled query whose span is open because the list has not committed it yet
        await renderSearchRouter();
        type('ab');
        advance(DEBOUNCE_TIME);
        expect(getEndedQuerySpans()).toHaveLength(0);

        // When the user clears the input before the list commits
        type('');

        // Then the span is cancelled at that keystroke as cleared, so clearing stays distinguishable from typing more
        const endedSpans = getEndedQuerySpans();
        expect(endedSpans).toHaveLength(1);
        expect(endedSpans.at(0)?.attributes[CONST.TELEMETRY.ATTRIBUTE_CANCELED]).toBe(true);
        expect(endedSpans.at(0)?.attributes[CONST.TELEMETRY.ATTRIBUTE_CANCEL_REASON]).toBe(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_CANCEL_REASON.CLEARED);
    });

    it('does not start a span for a debounce that fires after the router was closed', async () => {
        // Given the user typed a query whose debounce is still pending
        const {closeSearchRouter} = await renderSearchRouter();
        type('ab');

        // When the router closes while it stays mounted (e.g. popped by hardware back on native) and the debounce delay passes
        closeSearchRouter();
        advance(DEBOUNCE_TIME);

        // Then no span starts, because the list render during the closing transition is not a query evaluation the user waits for
        expect(getStartedQuerySpans()).toHaveLength(0);
    });

    it('cancels the open span as closed when the router closes while it stays mounted', async () => {
        // Given a settled query whose span is open because the list has not committed it yet
        const {closeSearchRouter} = await renderSearchRouter();
        type('ab');
        advance(DEBOUNCE_TIME);

        // When the router closes without unmounting
        closeSearchRouter();

        // Then the span is cancelled as closed, so a commit during the closing transition cannot end it
        const endedSpans = getEndedQuerySpans();
        expect(endedSpans).toHaveLength(1);
        expect(endedSpans.at(0)?.attributes[CONST.TELEMETRY.ATTRIBUTE_CANCEL_REASON]).toBe(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_CANCEL_REASON.CLOSED);
    });

    it('does not measure a query retyped right after clearing it, before the debounce fires', async () => {
        // Given the user typed a query that the list evaluated
        await renderSearchRouter();
        type('abc');
        advance(DEBOUNCE_TIME);

        // When the user clears the input and types the same query again faster than the debounce delay
        type('');
        advance(KEYSTROKE_INTERVAL);
        type('abc');
        advance(DEBOUNCE_TIME);

        // Then no other span starts, because keystrokes that don't outlast the debounce are never measured
        expect(getStartedQuerySpans()).toHaveLength(1);
    });

    it('does not measure a picked suggestion or count it toward the per-open cap', async () => {
        // Given the user typed a query that the list has not committed yet
        await renderSearchRouter();
        type('ab');
        advance(DEBOUNCE_TIME);

        // When the user picks a contextual suggestion and the debounce delay passes
        act(() => {
            mockOnListItemPress?.({
                text: 'General',
                keyForList: 'contextual-general',
                searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.CONTEXTUAL_SUGGESTION,
                roomType: CONST.SEARCH.DATA_TYPES.CHAT,
                searchQuery: 'General',
            });
        });
        advance(DEBOUNCE_TIME);

        // Then no span starts for the pick, which is not a keystroke, and the typed query's span is cancelled as superseded
        expect(getStartedQuerySpans()).toHaveLength(1);
        expect(getEndedQuerySpans().at(0)?.attributes[CONST.TELEMETRY.ATTRIBUTE_CANCEL_REASON]).toBe(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_CANCEL_REASON.SUPERSEDED);

        // When the user types another query
        type('abc');
        advance(DEBOUNCE_TIME);

        // Then the pick used no slot of the cap, so the typed query is the second attempt
        expect(getStartedQuerySpans().at(1)?.attributes[CONST.TELEMETRY.ATTRIBUTE_QUERY_ORDINAL]).toBe(2);
    });
});
