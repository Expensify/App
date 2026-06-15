import {act, renderHook} from '@testing-library/react-native';
import useInboxTabSpanLifecycle from '@hooks/useInboxTabSpanLifecycle';
import CONST from '@src/CONST';

type FocusCallback = () => (() => void) | void;
type FakeSpan = {id: string};

const SPAN = CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB;

const mockUseFocusEffect = jest.fn<void, [FocusCallback]>();
const mockGetSpan = jest.fn<FakeSpan | undefined, [string]>();
const mockEndSpan = jest.fn<void, [string]>();
const mockCancelSpan = jest.fn<void, [string]>();

// The hook only consumes useFocusEffect from this module. We capture the focus callback
// (via mockUseFocusEffect.mock.calls) so each test can drive focus/blur explicitly instead
// of standing up a navigation container.
jest.mock('@react-navigation/native', () => ({
    useFocusEffect: (callback: FocusCallback) => {
        mockUseFocusEffect(callback);
    },
}));

jest.mock('@libs/telemetry/activeSpans', () => ({
    getSpan: (spanId: string) => mockGetSpan(spanId),
    endSpan: (spanId: string) => mockEndSpan(spanId),
    cancelSpan: (spanId: string) => mockCancelSpan(spanId),
}));

const spanAtMount: FakeSpan = {id: 'span-at-mount'};
const newerSpan: FakeSpan = {id: 'newer-span'};

/** The currently active span returned by getSpan. Defaults to the one present when the hook mounts. */
let currentActiveSpan: FakeSpan | undefined;

/** Returns the latest focus callback the hook registered with useFocusEffect. */
function getFocusCallback(): FocusCallback {
    const callback = mockUseFocusEffect.mock.calls.at(-1)?.[0];
    if (!callback) {
        throw new Error('useFocusEffect was never called by the hook');
    }
    return callback;
}

describe('useInboxTabSpanLifecycle', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        currentActiveSpan = spanAtMount;
        mockGetSpan.mockImplementation(() => currentActiveSpan);
    });

    it('ends the span when the sidebar lays out for the first time (normal path)', () => {
        const {result} = renderHook(() => useInboxTabSpanLifecycle());

        act(() => {
            result.current();
        });

        expect(mockEndSpan).toHaveBeenCalledTimes(1);
        expect(mockEndSpan).toHaveBeenCalledWith(SPAN);
        expect(mockCancelSpan).not.toHaveBeenCalled();
    });

    it('does not end the span on focus before the first layout (cold path)', () => {
        renderHook(() => useInboxTabSpanLifecycle());

        act(() => {
            getFocusCallback()();
        });

        expect(mockEndSpan).not.toHaveBeenCalled();
    });

    it('ends the span on re-focus after layout (warm react-freeze path)', () => {
        const {result} = renderHook(() => useInboxTabSpanLifecycle());

        // First layout completes, then the user leaves and returns: react-freeze keeps the
        // layout cached so onLayout will not fire again, and focus must end the span instead.
        act(() => {
            result.current();
        });
        mockEndSpan.mockClear();

        act(() => {
            getFocusCallback()();
        });

        expect(mockEndSpan).toHaveBeenCalledTimes(1);
        expect(mockEndSpan).toHaveBeenCalledWith(SPAN);
    });

    it('cancels the span on blur when layout never completed (orphan cleanup)', () => {
        renderHook(() => useInboxTabSpanLifecycle());

        const blurCleanup = getFocusCallback()();

        expect(typeof blurCleanup).toBe('function');
        act(() => {
            blurCleanup?.();
        });

        expect(mockCancelSpan).toHaveBeenCalledTimes(1);
        expect(mockCancelSpan).toHaveBeenCalledWith(SPAN);
    });

    it('cancels the span on unmount when layout never completed and the active span is unchanged', () => {
        const {unmount} = renderHook(() => useInboxTabSpanLifecycle());

        unmount();

        expect(mockCancelSpan).toHaveBeenCalledTimes(1);
        expect(mockCancelSpan).toHaveBeenCalledWith(SPAN);
    });

    it('does not cancel on unmount when a newer span has started (subsequent tab click)', () => {
        const {unmount} = renderHook(() => useInboxTabSpanLifecycle());

        // A later tab click started a fresh span before this instance unmounted. The unmount
        // cleanup must not cancel that newer span.
        currentActiveSpan = newerSpan;
        unmount();

        expect(mockCancelSpan).not.toHaveBeenCalled();
    });

    it('does not cancel on unmount after layout has completed', () => {
        const {result, unmount} = renderHook(() => useInboxTabSpanLifecycle());

        act(() => {
            result.current();
        });
        mockCancelSpan.mockClear();

        unmount();

        expect(mockCancelSpan).not.toHaveBeenCalled();
    });
});
