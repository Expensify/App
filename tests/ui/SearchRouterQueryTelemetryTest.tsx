import {act, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import SearchAutocompleteList from '@components/Search/SearchAutocompleteList';

import {cancelAllSpans, getSpan} from '@libs/telemetry/activeSpans';
import {beginSearchRouterQuerySession, endSearchRouterQuerySession, startSearchRouterQuerySpan} from '@libs/telemetry/searchRouterQuerySpans';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type FakeSpan = {
    op?: string;
    attributes: Record<string, unknown>;
    setAttribute: (key: string, value: unknown) => void;
    setAttributes: (attrs: Record<string, unknown>) => void;
    setStatus: () => void;
    end: () => void;
};

const mockEnded: FakeSpan[] = [];

jest.mock('@sentry/react-native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@sentry/react-native'),
    startInactiveSpan: (options: {op?: string; attributes?: Record<string, unknown>}): FakeSpan => ({
        op: options.op,
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
    }),
    spanToJSON: (span: FakeSpan) => ({data: span.attributes}),
}));

jest.mock('@src/components/ConfirmedRoute.tsx');

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useIsFocused: jest.fn(),
    useRoute: jest.fn(),
    usePreventRemove: jest.fn(),
    createNavigationContainerRef: jest.fn(() => ({
        getCurrentRoute: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
        removeListener: jest.fn(),
        isReady: jest.fn(() => true),
        getState: jest.fn(),
    })),
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: jest.fn(() => ({shouldUseNarrowLayout: true, isSmallScreenWidth: true})),
}));

jest.mock('@hooks/useFilteredOptions', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        options: {reports: [], personalDetails: []},
        isLoading: false,
        loadMore: jest.fn(),
        loadAll: jest.fn(),
        hasMore: false,
        isLoadingMore: false,
        getReportByID: jest.fn(),
    })),
}));

jest.mock('@libs/OptionsListUtils', () => ({
    getSearchOptions: jest.fn(() => ({
        options: {recentReports: [], personalDetails: [], currentUserOption: null, userToInvite: null, categoryOptions: []},
        hasMore: false,
    })),
    combineOrderingOfReportsAndPersonalDetails: jest.fn(() => ({recentReports: [], personalDetails: []})),
    getAlternateText: jest.fn(),
}));

const ROOT = CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY;
const CANCEL_REASON = CONST.TELEMETRY.SEARCH_ROUTER_QUERY_CANCEL_REASON;

function renderList(query: string) {
    return (
        <OnyxListItemProvider>
            <LocaleContextProvider>
                <SearchAutocompleteList
                    autocompleteQueryValue={query}
                    handleSearch={jest.fn()}
                    onListItemPress={jest.fn()}
                />
            </LocaleContextProvider>
        </OnyxListItemProvider>
    );
}

describe('SearchAutocompleteList query telemetry', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockEnded.length = 0;
        beginSearchRouterQuerySession();
    });

    afterEach(async () => {
        endSearchRouterQuerySession();
        cancelAllSpans();
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('cancels the span as list_mount when the list first mounts with the debounced query', async () => {
        // Given the debounce timer fired for "abc" before the list mounted
        startSearchRouterQuerySpan('abc');

        // When the list mounts with that query
        render(renderList('abc'));
        await waitForBatchedUpdatesWithAct();

        // Then the first layout is left to ManualOpenSearchRouter, so the query span is cancelled
        expect(getSpan(ROOT)).toBeUndefined();
        expect(mockEnded.find((span) => span.op === ROOT)?.attributes[CONST.TELEMETRY.ATTRIBUTE_CANCEL_REASON]).toBe(CANCEL_REASON.LIST_MOUNT);
    });

    it('ignores the commit of a query other than the one the span is open for', async () => {
        // Given a span open for "abc"
        startSearchRouterQuerySpan('abc');

        // When the list commits with a different, older query
        render(renderList('ab'));
        await waitForBatchedUpdatesWithAct();

        // Then the span stays open
        expect(getSpan(ROOT)).toBeDefined();
    });

    it('cancels the span as unmounted when the list unmounts mid-query', async () => {
        // Given an open span and a mounted list that is showing an older query
        const {unmount} = render(renderList('ab'));
        await waitForBatchedUpdatesWithAct();
        startSearchRouterQuerySpan('abc');
        expect(getSpan(ROOT)).toBeDefined();

        // When the list unmounts, e.g. native hardware Back
        unmount();

        // Then the span is cancelled as unmounted
        expect(getSpan(ROOT)).toBeUndefined();
        expect(mockEnded.find((span) => span.op === ROOT)?.attributes[CONST.TELEMETRY.ATTRIBUTE_CANCEL_REASON]).toBe(CANCEL_REASON.UNMOUNTED);
    });
    it('ends the span with the result count when the debounced query commits after the list laid out', async () => {
        // Given a mounted list that has finished its first layout
        const {rerender} = render(renderList(''));
        await waitForBatchedUpdatesWithAct();
        const layoutNode = screen.UNSAFE_root.findAll((node) => typeof node.props.onLayout === 'function' && node.props.sections !== undefined).at(0);
        await act(async () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            layoutNode?.props.onLayout();
        });

        // When the debounce fires for "abc" and the list commits with it
        startSearchRouterQuerySpan('abc');
        expect(getSpan(ROOT)).toBeDefined();
        rerender(renderList('abc'));
        await waitForBatchedUpdatesWithAct();

        // Then the span ends with the legacy path and the option count
        expect(getSpan(ROOT)).toBeUndefined();
        const attributes = mockEnded.find((span) => span.op === ROOT)?.attributes;
        expect(attributes?.[CONST.TELEMETRY.ATTRIBUTE_CANCELED]).toBeUndefined();
        expect(attributes?.[CONST.TELEMETRY.ATTRIBUTE_SEARCH_PATH]).toBe(CONST.TELEMETRY.SEARCH_ROUTER_SEARCH_PATH.LEGACY);
        expect(attributes?.[CONST.TELEMETRY.ATTRIBUTE_RESULT_COUNT]).toBe(0);
    });
});
