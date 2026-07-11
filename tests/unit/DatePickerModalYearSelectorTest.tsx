import {fireEvent, render, screen, waitFor, within} from '@testing-library/react-native';

import RealDatePicker from '@components/DatePicker';
import type DatePickerModalType from '@components/DatePicker/DatePickerModal';
import useIsYearSelectorOpen from '@components/DatePicker/useIsYearSelectorOpen';

import useResponsiveLayoutDefault from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import {setCalendarPickerSelectedYear} from '@libs/actions/CalendarPicker';
import DateUtils from '@libs/DateUtils';
import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type * as ReactNavigationNative from '@react-navigation/native';
import type {ComponentProps, ComponentType, ReactNode} from 'react';

import {createElement} from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type MockReactNativePrimitives = {
    Pressable: ComponentType<{testID?: string; accessibilityLabel?: string; role?: string; onPress?: () => void; children?: ReactNode}>;
    Text: ComponentType<{testID?: string; children?: ReactNode}>;
    View: ComponentType<{testID?: string; style?: unknown; pointerEvents?: string; children?: ReactNode}>;
};

// DatePicker -> DatePickerModal -> CalendarPicker navigates via @libs/Navigation/Navigation and reads
// useRootNavigationState (through useIsYearSelectorOpen). Mirror CalendarPickerTest's mock setup so the bare
// navigation environment in this suite doesn't crash.
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useNavigation: () => ({navigate: jest.fn()}),
    createNavigationContainerRef: jest.fn(),
}));

jest.mock('@hooks/useRootNavigationState', () => ({
    __esModule: true,
    default: (selector: (state: undefined) => unknown) => selector(undefined),
}));

// The keep-open guard (DatePicker) and the wide-screen frame-hide (DatePickerModal) are both driven by
// useIsYearSelectorOpen; default it "closed" and toggle it "open" per-test.
jest.mock('@components/DatePicker/useIsYearSelectorOpen', () => ({
    __esModule: true,
    default: jest.fn(() => false),
}));

// isDesktopWeb = getPlatform() === web && !isSmallScreenWidth. Mock both with desktop-web defaults so the
// real DatePickerModal's frame-hide branch is exercised, and switch to native/narrow per-test to prove it
// does NOT hide there.
jest.mock('@libs/getPlatform', () => ({
    __esModule: true,
    default: jest.fn(() => 'web'),
}));
jest.mock('@hooks/useResponsiveLayout', () =>
    jest.fn(() => ({
        shouldUseNarrowLayout: false,
        isSmallScreenWidth: false,
        isInNarrowPaneModal: false,
        isExtraSmallScreenHeight: false,
        isMediumScreenWidth: false,
        isLargeScreenWidth: true,
        isExtraSmallScreenWidth: false,
        isSmallScreen: false,
        onboardingIsMediumOrLargerScreenWidth: true,
    })),
);

jest.mock('../../src/hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn(),
    })),
);

// The real DatePicker field wires useAutoFocusInput -> useFocusEffect -> useNavigation, which needs a
// NavigationContainer. The keep-open guard tests render the field in isolation and don't care about
// autofocus, so stub the hook with stable no-ops.
jest.mock('@hooks/useAutoFocusInput', () => ({
    __esModule: true,
    default: () => ({
        inputCallbackRef: () => {},
        inputRef: {current: null},
        cancelAutoFocus: () => {},
    }),
}));

jest.mock('@src/components/ConfirmedRoute.tsx');

// MonthPickerModal is irrelevant here but is rendered by CalendarPicker; stub it out.
jest.mock('@components/DatePicker/CalendarPicker/MonthPickerModal', () => {
    const ReactNativeActual = jest.requireActual<MockReactNativePrimitives>('react-native');
    const {View} = ReactNativeActual;
    function MockMonthPickerModal({isVisible}: {isVisible: boolean}) {
        return isVisible ? <View testID="MonthPickerModal" /> : null;
    }
    return MockMonthPickerModal;
});

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
        getActiveRoute: jest.fn(() => 'settings/profile'),
    },
}));

// Test 1 (keep-open guard) drives the REAL DatePicker (src/components/DatePicker/index.tsx) and only cares
// about whether closeDatePicker is suppressed. Stub DatePickerModal with a lightweight component that
// (a) renders its isVisible state to a testID and (b) exposes the onClose prop it received via a module-level
// ref, so the test can invoke the exact callback the real picker passes down. The real DatePickerModal is
// still reachable via jest.requireActual for the frame-hide tests.
jest.mock('@components/DatePicker/DatePickerModal', () => {
    const ReactNativeActual = jest.requireActual<MockReactNativePrimitives>('react-native');
    const {Pressable, Text, View} = ReactNativeActual;
    function MockDatePickerModal({isVisible, onClose}: {isVisible: boolean; onClose: () => void}) {
        return (
            <View testID="DatePickerModalStub">
                <Text testID="datePickerModalVisible">{isVisible ? 'visible' : 'hidden'}</Text>
                {/* Invokes the exact onClose (closeDatePicker) the real picker passes down — the year-selector
                    goBack's popstate close path. fireEvent.press auto-wraps the state update in act(). */}
                <Pressable
                    testID="datePickerModalInvokeClose"
                    accessibilityLabel="invoke onClose"
                    role="button"
                    onPress={onClose}
                />
            </View>
        );
    }
    return MockDatePickerModal;
});

// The real DatePickerModal is needed for the frame-hide tests; pull it past the jest.mock above.
const ActualDatePickerModal = jest.requireActual<{default: typeof DatePickerModalType}>('@components/DatePicker/DatePickerModal').default;

// These tests assert what the real DatePickerModal computes for its host popover. PopoverWithMeasuredContent's
// real measurement/portal chain is too heavy to render reliably, so stub it with a component that surfaces the
// relevant props onto queryable rendered nodes. Since the hide-in-place moved into ReanimatedModal (driven by
// the CalendarPicker via HiddenForOverlayContext), the host passes NO hide wiring anymore — the mock renders
// 'unset' for the props the host no longer manages so the tests can assert exactly that. The mock also provides
// no HiddenForOverlayContext, so the CalendarPicker inside exercises its no-modal-ancestor self-hide fallback.
jest.mock('@components/PopoverWithMeasuredContent', () => {
    const ReactNativeActual = jest.requireActual<MockReactNativePrimitives>('react-native');
    const {Text, View} = ReactNativeActual;
    function MockPopoverWithMeasuredContent({
        isVisible,
        innerContainerStyle,
        hasBackdrop,
        children,
    }: {
        isVisible: boolean;
        innerContainerStyle?: unknown;
        hasBackdrop?: boolean;
        children?: ReactNode;
    }) {
        if (!isVisible) {
            return null;
        }
        return (
            <View
                testID="datePickerModalFrame"
                style={innerContainerStyle}
            >
                <Text testID="datePickerModalHasBackdrop">{hasBackdrop === undefined ? 'unset' : String(hasBackdrop)}</Text>
                {children}
            </View>
        );
    }
    return MockPopoverWithMeasuredContent;
});

// CalendarPicker is rendered inside the real DatePickerModal (frame-hide tests); silence its month picker.
const monthNames = DateUtils.getMonthNames();

const mockedUseIsYearSelectorOpen = jest.mocked(useIsYearSelectorOpen);
const mockedGetPlatform = jest.mocked(getPlatform);
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayoutDefault);

const WIDE_LAYOUT: ResponsiveLayoutResult = {
    shouldUseNarrowLayout: false,
    isSmallScreenWidth: false,
    isInNarrowPaneModal: false,
    isExtraSmallScreenHeight: false,
    isMediumScreenWidth: false,
    isLargeScreenWidth: true,
    isExtraLargeScreenWidth: true,
    isExtraSmallScreenWidth: false,
    isSmallScreen: false,
    onboardingIsMediumOrLargerScreenWidth: true,
    isInLandscapeMode: true,
};
const NARROW_LAYOUT: ResponsiveLayoutResult = {
    ...WIDE_LAYOUT,
    shouldUseNarrowLayout: true,
    isSmallScreenWidth: true,
    isLargeScreenWidth: false,
    isExtraLargeScreenWidth: false,
    isSmallScreen: true,
};

// Flatten an RN style (object | array | nested arrays) into the keys we assert on.
function flattenStyle(style: unknown): Record<string, unknown> {
    if (Array.isArray(style)) {
        const merged: Record<string, unknown> = {};
        for (const entry of style as unknown[]) {
            Object.assign(merged, flattenStyle(entry));
        }
        return merged;
    }
    if (typeof style !== 'object' || style === null) {
        return {};
    }
    return {...style};
}

// Restore the default desktop-web / wide / year-selector-closed environment before every test so a per-test
// override can't leak. Also reset the captured seams.
beforeEach(() => {
    mockedUseIsYearSelectorOpen.mockReturnValue(false);
    mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
    mockedUseResponsiveLayout.mockReturnValue(WIDE_LAYOUT);
});

describe('DatePicker keep-open guard across the year-selector round-trip', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => Onyx.clear().then(waitForBatchedUpdates));

    function openPicker() {
        // DatePicker's field is a combobox; pressing it runs showDatePickerModal() -> isModalVisible = true.
        const field = screen.getByRole(CONST.ROLE.COMBOBOX);
        fireEvent.press(field);
        return field;
    }

    test('suppresses closeDatePicker while the year selector is open (the picker stays open across the round-trip)', () => {
        // The DOB host: a standalone date field that opens its picker in a popover. While the year-selector RHP
        // is focused, the popover's onClose (closeDatePicker) must be a no-op so the picked year can be applied
        // on return instead of the picker closing under the RHP.
        mockedUseIsYearSelectorOpen.mockReturnValue(true);

        render(<DateFieldForTest />);

        openPicker();
        expect(screen.getByTestId('datePickerModalVisible')).toHaveTextContent('visible');

        // Invoke the exact onClose the real picker handed to its modal (the year-selector goBack's popstate path).
        fireEvent.press(screen.getByTestId('datePickerModalInvokeClose'));

        // The guard returns early: the picker is STILL open.
        expect(screen.getByTestId('datePickerModalVisible')).toHaveTextContent('visible');
    });

    test('closeDatePicker still closes the picker normally when the year selector is NOT open', () => {
        // Fresh render with the year selector closed and no prior open->close transition, so the 250ms grace
        // window is also clear: closeDatePicker proceeds and dismisses the popover as usual.
        mockedUseIsYearSelectorOpen.mockReturnValue(false);

        render(<DateFieldForTest />);

        openPicker();
        expect(screen.getByTestId('datePickerModalVisible')).toHaveTextContent('visible');

        fireEvent.press(screen.getByTestId('datePickerModalInvokeClose'));

        // Normal close path: the picker is now hidden.
        expect(screen.getByTestId('datePickerModalVisible')).toHaveTextContent('hidden');
    });
});

describe('DatePickerModal year-selector return path (DOB contextID)', () => {
    const INPUT_ID = 'dob';
    const CONTEXT_ID = `datePicker-${INPUT_ID}`;
    // A fixed starting view so an adopted year is unambiguous and "view preserved" is checkable.
    const START_VALUE = '2023-06-15';
    const MIN_DATE = new Date('2000-01-01');
    const MAX_DATE = new Date('2030-12-31');

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => Onyx.clear().then(waitForBatchedUpdates));

    test('the date picker adopts the year written back for its datePicker-<inputID> contextID, preserves the month/day view, and clears the Onyx key', async () => {
        render(
            <ActualDatePickerModal
                inputID={INPUT_ID}
                value={START_VALUE}
                minDate={MIN_DATE}
                maxDate={MAX_DATE}
                isVisible
                onClose={jest.fn()}
                anchorPosition={{horizontal: 0, vertical: 0}}
            />,
        );

        // Starts on the value's year/month, with the value's day (15) selected in the grid.
        expect(within(screen.getByTestId('currentYearText')).getByText('2023')).toBeTruthy();
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(5) ?? '')).toBeTruthy();
        expect(screen.getByLabelText('Thursday, June 15, 2023')).toBeTruthy();

        // The year picker screen writes the user's selection back for THIS host's contextID, exactly as the
        // real setter does on goBack.
        setCalendarPickerSelectedYear(CONTEXT_ID, 2014);
        await waitForBatchedUpdates();

        // The inner CalendarPicker consumes the matching contextID and applies the year to the displayed
        // month (deferred via requestAnimationFrame).
        await waitFor(() => {
            expect(within(screen.getByTestId('currentYearText')).getByText('2014')).toBeTruthy();
        });

        // Only the year changed (setYear(prev, year)); June 15 is preserved (not reset to today).
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(5) ?? '')).toBeTruthy();
        expect(screen.getByLabelText('Sunday, June 15, 2014')).toBeTruthy();

        // The transient selection is cleared so it isn't re-applied on the next render.
        expect(await getOnyxValue(ONYXKEYS.CALENDAR_PICKER_SELECTED_YEAR)).toBeUndefined();
    });

    test('a year written back for a DIFFERENT contextID is ignored and the Onyx key is left intact for its owner', async () => {
        render(
            <ActualDatePickerModal
                inputID={INPUT_ID}
                value={START_VALUE}
                minDate={MIN_DATE}
                maxDate={MAX_DATE}
                isVisible
                onClose={jest.fn()}
                anchorPosition={{horizontal: 0, vertical: 0}}
            />,
        );

        expect(within(screen.getByTestId('currentYearText')).getByText('2023')).toBeTruthy();

        // Another host's selection lands in Onyx; this instance must NOT consume it (contextID mismatch) and
        // must NOT clear the key (that's the owning host's responsibility).
        setCalendarPickerSelectedYear('datePicker-someOtherInput', 2014);
        await waitForBatchedUpdates();

        // Give the consume effect (and its deferred rAF) a chance to wrongly fire.
        await waitFor(() => {
            jest.advanceTimersByTime(0);
        });
        await waitForBatchedUpdates();

        expect(within(screen.getByTestId('currentYearText')).getByText('2023')).toBeTruthy();
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(5) ?? '')).toBeTruthy();
        expect(await getOnyxValue(ONYXKEYS.CALENDAR_PICKER_SELECTED_YEAR)).toEqual({contextID: 'datePicker-someOtherInput', year: 2014});
    });
});

describe('DatePickerModal year-selector hide wiring (hide lives in the modal via HiddenForOverlayContext, not the host)', () => {
    const INPUT_ID = 'dob';
    const START_VALUE = '2023-06-15';
    const MIN_DATE = new Date('2000-01-01');
    const MAX_DATE = new Date('2030-12-31');

    // The CalendarPicker's fallback self-hide signature (opacity 0 + pointerEvents none) — exercised here
    // because the mocked PopoverWithMeasuredContent provides no HiddenForOverlayContext. visibility: 'hidden'
    // is applied alongside via styles.visibilityHidden, a web-only platform-split utility that resolves to an
    // empty object under jest's native module resolution, so it is not asserted.
    const findSelfHiddenNodes = () => screen.UNSAFE_root.findAll((node) => node.props.pointerEvents === 'none' && flattenStyle(node.props.style).opacity === 0);

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => Onyx.clear().then(waitForBatchedUpdates));

    test('on desktop web the host passes no hide wiring (the modal hides itself); without a modal ancestor the CalendarPicker self-hides', () => {
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
        mockedUseResponsiveLayout.mockReturnValue(WIDE_LAYOUT);
        mockedUseIsYearSelectorOpen.mockReturnValue(true);

        render(
            <ActualDatePickerModal
                inputID={INPUT_ID}
                value={START_VALUE}
                minDate={MIN_DATE}
                maxDate={MAX_DATE}
                isVisible
                onClose={jest.fn()}
                anchorPosition={{horizontal: 0, vertical: 0}}
            />,
        );

        // The host no longer hides the frame or manages the backdrop — that moved into ReanimatedModal,
        // driven by the CalendarPicker through HiddenForOverlayContext (see ReanimatedModalHiddenForOverlayTest).
        const frame = screen.getByTestId('datePickerModalFrame');
        const style = flattenStyle(frame.props.style);
        expect(style.opacity).toBeUndefined();
        expect(screen.getByTestId('datePickerModalHasBackdrop')).toHaveTextContent('unset');

        // The mocked popover provides no HiddenForOverlayContext, so the CalendarPicker falls back to
        // hiding itself — the no-modal-ancestor path (same one navigation-card hosts rely on).
        expect(findSelfHiddenNodes().length).toBeGreaterThanOrEqual(1);
    });

    test('on native nothing hides even while the year selector is open (the native host dismisses instead)', () => {
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.ANDROID);
        mockedUseResponsiveLayout.mockReturnValue(NARROW_LAYOUT);
        mockedUseIsYearSelectorOpen.mockReturnValue(true);

        render(
            <ActualDatePickerModal
                inputID={INPUT_ID}
                value={START_VALUE}
                minDate={MIN_DATE}
                maxDate={MAX_DATE}
                isVisible
                onClose={jest.fn()}
                anchorPosition={{horizontal: 0, vertical: 0}}
            />,
        );

        const frame = screen.getByTestId('datePickerModalFrame');
        const style = flattenStyle(frame.props.style);
        expect(style.opacity).toBeUndefined();
        expect(frame.props.pointerEvents).toBeUndefined();
        expect(findSelfHiddenNodes()).toHaveLength(0);
    });

    test('on narrow web nothing hides even while the year selector is open (the small-screen backdrop handles the overlap)', () => {
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
        mockedUseResponsiveLayout.mockReturnValue(NARROW_LAYOUT);
        mockedUseIsYearSelectorOpen.mockReturnValue(true);

        render(
            <ActualDatePickerModal
                inputID={INPUT_ID}
                value={START_VALUE}
                minDate={MIN_DATE}
                maxDate={MAX_DATE}
                isVisible
                onClose={jest.fn()}
                anchorPosition={{horizontal: 0, vertical: 0}}
            />,
        );

        const frame = screen.getByTestId('datePickerModalFrame');
        const style = flattenStyle(frame.props.style);
        expect(style.opacity).toBeUndefined();
        expect(frame.props.pointerEvents).toBeUndefined();
        expect(findSelfHiddenNodes()).toHaveLength(0);
    });
});

// Renders the real DatePicker field (src/components/DatePicker/index.tsx) used by the keep-open guard tests.
function DateFieldForTest(props: Partial<ComponentProps<typeof RealDatePicker>>) {
    return createElement(RealDatePicker, {inputID: 'dob', label: 'Date of birth', ...props});
}
