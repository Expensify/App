import type * as ReactNavigationNative from '@react-navigation/native';
import {render, screen, waitFor, within} from '@testing-library/react-native';
import {createElement} from 'react';
import type {ComponentProps, ComponentType, ReactNode} from 'react';
import Onyx from 'react-native-onyx';
import CalendarPicker from '@components/DatePicker/CalendarPicker';
import useIsYearSelectorOpen from '@components/DatePicker/useIsYearSelectorOpen';
import useResponsiveLayoutDefault from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import {setCalendarPickerSelectedYear} from '@libs/actions/CalendarPicker';
import DateUtils from '@libs/DateUtils';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type MockReactNativePrimitives = {
    View: ComponentType<{testID?: string; children?: ReactNode}>;
};

// CalendarPicker navigates via @libs/Navigation/Navigation and reads useRootNavigationState (through
// useIsYearSelectorOpen). Mirror CalendarPickerTest's mock setup so the bare navigation environment in
// this suite doesn't crash.
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useNavigation: () => ({navigate: jest.fn()}),
    createNavigationContainerRef: jest.fn(),
}));

jest.mock('@hooks/useRootNavigationState', () => ({
    __esModule: true,
    default: (selector: (state: undefined) => unknown) => selector(undefined),
}));

// The wide-screen self-hide is driven by useIsYearSelectorOpen; default it to "closed" and toggle it
// "open" per-test.
jest.mock('@components/DatePicker/useIsYearSelectorOpen', () => ({
    __esModule: true,
    default: jest.fn(() => false),
}));

// isDesktopWeb = getPlatform() === web && !isSmallScreenWidth. Mock both with desktop-web defaults so
// the inner self-hide branch is exercised (ScheduleCallPage has no host frame to hide).
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
    isExtraLargeScreenWidth: false,
    isExtraSmallScreenWidth: false,
    isSmallScreen: false,
    isInLandscapeMode: false,
    onboardingIsMediumOrLargerScreenWidth: true,
};
const NARROW_LAYOUT = {...WIDE_LAYOUT, shouldUseNarrowLayout: true, isSmallScreenWidth: true, isLargeScreenWidth: false, isSmallScreen: true};

// The CalendarPicker self-hide is applied ONLY to its root View as the combination of
// pointerEvents='none' + a style flattening to {opacity: 0, visibility: 'hidden'}. Disabled/empty day
// cells also carry pointerEvents='none' (with no opacity), so match on the full hide signature to
// isolate the root, not on pointerEvents alone.
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
function findHiddenRoots() {
    return screen.UNSAFE_root.findAll((node) => node.props.pointerEvents === 'none' && flattenStyle(node.props.style).opacity === 0);
}

// ScheduleCallPage renders CalendarPicker with this stable id (ScheduleCallPage.tsx:197) and relies on
// the inner CalendarPicker self-hide (no host frame-hide), so rendering CalendarPicker with this exact
// pickerContextID exercises the same consume/hide path the page uses.
const SCHEDULE_CALL_CONTEXT_ID = 'scheduleCall';
// A fixed starting view so an adopted year is unambiguous.
const START_VALUE = '2020-06-15';
const MIN_DATE = new Date('2010-01-01');
const MAX_DATE = new Date('2030-12-31');

function ScheduleCallCalendarPicker(props: Omit<ComponentProps<typeof CalendarPicker>, 'pickerContextID'>) {
    return createElement(CalendarPicker, {pickerContextID: SCHEDULE_CALL_CONTEXT_ID, ...props});
}

// Restore the default desktop-web / wide / year-selector-closed environment before every test so a
// per-test override can't leak.
beforeEach(() => {
    mockedUseIsYearSelectorOpen.mockReturnValue(false);
    mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
    mockedUseResponsiveLayout.mockReturnValue(WIDE_LAYOUT);
});

describe('ScheduleCall year selector return path', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => Onyx.clear().then(waitForBatchedUpdates));

    test('the scheduleCall CalendarPicker adopts the year written back for its contextID, preserves the month/day view, and clears the Onyx key', async () => {
        render(
            <ScheduleCallCalendarPicker
                value={START_VALUE}
                minDate={MIN_DATE}
                maxDate={MAX_DATE}
            />,
        );

        // Starts on the value's year/month, with the value's day (15) selected in the grid.
        expect(within(screen.getByTestId('currentYearText')).getByText('2020')).toBeTruthy();
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(5) ?? '')).toBeTruthy();
        expect(screen.getByLabelText('Monday, June 15, 2020')).toBeTruthy();

        // Simulate the year picker screen writing the user's selection back for THIS host's contextID,
        // exactly as the real setter does on goBack.
        setCalendarPickerSelectedYear(SCHEDULE_CALL_CONTEXT_ID, 2016);
        await waitForBatchedUpdates();

        // CalendarPicker consumes the matching contextID and applies the year to the displayed month
        // (deferred via requestAnimationFrame).
        await waitFor(() => {
            expect(within(screen.getByTestId('currentYearText')).getByText('2016')).toBeTruthy();
        });

        // Only the year changed (setYear(prev, year)); June 15 is preserved (not reset to today).
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(5) ?? '')).toBeTruthy();
        expect(screen.getByLabelText('Wednesday, June 15, 2016')).toBeTruthy();

        // The transient selection is cleared so it isn't re-applied on the next render.
        expect(await getOnyxValue(ONYXKEYS.CALENDAR_PICKER_SELECTED_YEAR)).toBeUndefined();
    });

    test('a year written back for a DIFFERENT contextID is ignored and the Onyx key is left intact for its owner', async () => {
        render(
            <ScheduleCallCalendarPicker
                value={START_VALUE}
                minDate={MIN_DATE}
                maxDate={MAX_DATE}
            />,
        );

        expect(within(screen.getByTestId('currentYearText')).getByText('2020')).toBeTruthy();

        // A different host's selection lands in Onyx; the scheduleCall instance must NOT consume it
        // (contextID mismatch) and must NOT clear the key (that's the owning host's responsibility).
        setCalendarPickerSelectedYear('datePicker-someOtherInput', 2016);
        await waitForBatchedUpdates();

        // Give the consume effect (and its deferred rAF) a chance to wrongly fire.
        await waitFor(() => {
            jest.advanceTimersByTime(0);
        });
        await waitForBatchedUpdates();

        // Year unchanged...
        expect(within(screen.getByTestId('currentYearText')).getByText('2020')).toBeTruthy();
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(5) ?? '')).toBeTruthy();
        // ...and the foreign selection is left intact for its owner.
        expect(await getOnyxValue(ONYXKEYS.CALENDAR_PICKER_SELECTED_YEAR)).toEqual({contextID: 'datePicker-someOtherInput', year: 2016});
    });

    test('on desktop web the scheduleCall calendar root self-hides (opacity 0 + hidden + pointerEvents none) while the year selector is open', () => {
        // ScheduleCallPage has no popover/modal frame around CalendarPicker, so the open-state hide must
        // come from the inner CalendarPicker itself (no host frame-hide).
        mockedUseIsYearSelectorOpen.mockReturnValue(true);

        render(
            <ScheduleCallCalendarPicker
                value={START_VALUE}
                minDate={MIN_DATE}
                maxDate={MAX_DATE}
            />,
        );

        // The hide is applied to exactly one logical element — the calendar root View — though
        // UNSAFE_root surfaces it more than once; assert every hidden match carries the hide signature.
        // (visibility: 'hidden' is applied alongside via styles.visibilityHidden, a web-only platform-split
        // utility that resolves to an empty object under jest's native module resolution, so it is not
        // asserted here.)
        const hiddenRoots = findHiddenRoots();
        expect(hiddenRoots.length).toBeGreaterThanOrEqual(1);
        for (const node of hiddenRoots) {
            const style = flattenStyle(node.props.style);
            expect(style.opacity).toBe(0);
            expect(node.props.pointerEvents).toBe('none');
        }
    });

    test('when the year selector is closed the scheduleCall calendar is visible and interactive', () => {
        mockedUseIsYearSelectorOpen.mockReturnValue(false);

        render(
            <ScheduleCallCalendarPicker
                value={START_VALUE}
                minDate={MIN_DATE}
                maxDate={MAX_DATE}
            />,
        );

        // No element carries the self-hide signature, so the calendar stays visible.
        expect(findHiddenRoots()).toHaveLength(0);
        expect(within(screen.getByTestId('currentYearText')).getByText('2020')).toBeTruthy();
    });

    test('on native the scheduleCall calendar does NOT self-hide even while the year selector is open', () => {
        // Native dismisses its host instead of self-hiding, so isDesktopWeb is false (getPlatform !== web).
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.ANDROID);
        mockedUseResponsiveLayout.mockReturnValue(NARROW_LAYOUT);
        mockedUseIsYearSelectorOpen.mockReturnValue(true);

        render(
            <ScheduleCallCalendarPicker
                value={START_VALUE}
                minDate={MIN_DATE}
                maxDate={MAX_DATE}
            />,
        );

        expect(findHiddenRoots()).toHaveLength(0);
        expect(within(screen.getByTestId('currentYearText')).getByText('2020')).toBeTruthy();
    });
});
