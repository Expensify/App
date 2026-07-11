import {fireEvent, render, screen, userEvent, waitFor, within} from '@testing-library/react-native';
import {fireEvent, render, screen, userEvent, within} from '@testing-library/react-native';

import CalendarPicker from '@components/DatePicker/CalendarPicker';
import useIsYearSelectorOpen from '@components/DatePicker/useIsYearSelectorOpen';

import useResponsiveLayoutDefault from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import {setCalendarPickerSelectedYear} from '@libs/actions/CalendarPicker';
import * as Modal from '@libs/actions/Modal';
import DateUtils from '@libs/DateUtils';
import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import type * as ReactNavigationNative from '@react-navigation/native';
import type * as ReactNavigationNative from '@react-navigation/native';
import type {ComponentProps, ComponentType, ReactNode} from 'react';
import type {ComponentType, ReactNode} from 'react';

import {addMonths, addYears, subMonths, subYears} from 'date-fns';
import {addMonths, addYears, subMonths, subYears} from 'date-fns';
import {createElement} from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type MockPressableProps = {testID?: string; accessibilityLabel?: string; role?: string; onPress?: () => void; children?: ReactNode};
type MockTextProps = {children?: ReactNode};
type MockViewProps = {testID?: string; children?: ReactNode};
type MockReactNativePrimitives = {
    Pressable: ComponentType<MockPressableProps>;
    Text: ComponentType<MockTextProps>;
    View: ComponentType<MockViewProps>;
};

const monthNames = DateUtils.getMonthNames();

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useNavigation: () => ({navigate: jest.fn()}),
    createNavigationContainerRef: jest.fn(),
}));

// CalendarPicker reads useRootNavigationState (via useIsYearSelectorOpen); the bare navigationRef mock above
// has no isReady(), so stub the hook to resolve its selector against an undefined navigation state.
jest.mock('@hooks/useRootNavigationState', () => ({
    __esModule: true,
    default: (selector: (state: undefined) => unknown) => selector(undefined),
}));

// The wide-screen self-hide is driven by useIsYearSelectorOpen; default it to "closed" so every existing
// test renders the calendar normally, and toggle it to "open" per-test in the round-trip suite.
jest.mock('@components/DatePicker/useIsYearSelectorOpen', () => ({
    __esModule: true,
    default: jest.fn(() => false),
}));

// isDesktopWeb = getPlatform() === web && !isSmallScreenWidth. The real values in jsdom are already
// web + wide; mocking them with the same defaults keeps the existing tests unchanged while letting the
// round-trip suite switch to native / narrow to prove the hide does NOT apply there.
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

type MockMonthPickerModalProps = {isVisible: boolean; onMonthChange?: (month: number) => void; onClose?: () => void};

jest.mock('@components/DatePicker/CalendarPicker/MonthPickerModal', () => {
    const ReactNativeActual = jest.requireActual<MockReactNativePrimitives>('react-native');
    const {Pressable, Text, View} = ReactNativeActual;
    const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    function MockMonthPickerModal({isVisible, onMonthChange, onClose}: MockMonthPickerModalProps) {
        if (!isVisible) {
            return null;
        }
        return (
            <View testID="MonthPickerModal">
                {MONTH_KEYS.map((key, i) => (
                    <Pressable
                        key={key}
                        testID={`month-option-${i}`}
                        accessibilityLabel={`month-${i}`}
                        role="button"
                        onPress={() => onMonthChange?.(i)}
                    >
                        <Text>{`month-${i}`}</Text>
                    </Pressable>
                ))}
                <Pressable
                    testID="month-modal-close"
                    accessibilityLabel="close"
                    role="button"
                    onPress={onClose}
                >
                    <Text>close</Text>
                </Pressable>
            </View>
        );
    }
    return MockMonthPickerModal;
});

const mockNavigate = jest.fn<void, [route: string]>();
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: (route: string) => {
            mockNavigate(route);
        },
        getActiveRoute: jest.fn(() => 'settings/profile'),
    },
}));

// CalendarPicker's pickerContextID is required (callers own a stable id so the year picker
// routes back to the correct instance). Tests default to 'test-calendar' unless they override it.
function CalendarPickerForTest({pickerContextID = 'test-calendar', ...rest}: Omit<ComponentProps<typeof CalendarPicker>, 'pickerContextID'> & {pickerContextID?: string}) {
    return createElement(CalendarPicker, {pickerContextID, ...rest});
}

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

// The CalendarPicker self-hide is applied ONLY to its root View as the combination of
// pointerEvents='none' + a flattened style of {opacity: 0, visibility: 'hidden'}. Disabled/empty day
// cells also carry pointerEvents='none' (with no opacity), so match on the full hide signature.
type JsonNode = {type?: string; props?: {style?: unknown; pointerEvents?: unknown}; children?: Array<JsonNode | string> | null};

function flattenStyle(style: unknown): {opacity?: unknown; visibility?: unknown} {
    if (Array.isArray(style)) {
        const merged: {opacity?: unknown; visibility?: unknown} = {};
        for (const entry of style) {
            const flat = flattenStyle(entry);
            if (flat.opacity !== undefined) {
                merged.opacity = flat.opacity;
            }
            if (flat.visibility !== undefined) {
                merged.visibility = flat.visibility;
            }
        }
        return merged;
    }
    if (typeof style === 'object' && style !== null) {
        return style;
    }
    return {};
}

function isHidden(node: JsonNode): boolean {
    const style = flattenStyle(node.props?.style);
    // The hide uses styles.opacity0 + styles.visibilityHidden; the latter is a platform-split utility that is
    // an empty object under jest's native module resolution (visibility is a web-only CSS rule), so the
    // jest-observable hide signature is opacity 0 + pointerEvents none.
    return node.props?.pointerEvents === 'none' && style.opacity === 0;
}

// Walk the rendered JSON tree (plain serialized nodes — no react-test-renderer instances) and collect
// every element that has the full hide signature.
function collectHiddenNodes(node: JsonNode | null | undefined, acc: JsonNode[]): JsonNode[] {
    if (!node) {
        return acc;
    }
    if (isHidden(node)) {
        acc.push(node);
    }
    for (const child of node.children ?? []) {
        if (typeof child === 'string') {
            continue;
        }
        collectHiddenNodes(child, acc);
    }
    return acc;
}

function findHiddenRoots(): JsonNode[] {
    const tree = screen.toJSON();
    const roots: Array<JsonNode | null> = Array.isArray(tree) ? tree : [tree];
    const acc: JsonNode[] = [];
    for (const root of roots) {
        collectHiddenNodes(root, acc);
    }
    return acc;
}

// Restore the default desktop-web / wide / year-selector-closed environment before every test so the
// per-test overrides in the round-trip suite can't leak into the rest of the file.
beforeEach(() => {
    mockedUseIsYearSelectorOpen.mockReturnValue(false);
    mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
    mockedUseResponsiveLayout.mockReturnValue(WIDE_LAYOUT);
});

describe('CalendarPicker', () => {
    test('renders calendar component', () => {
        render(<CalendarPickerForTest />);
    });

    test('displays the current month and year', () => {
        const currentDate = new Date();
        const maxDate = addYears(new Date(currentDate), 1);
        const minDate = subYears(new Date(currentDate), 1);
        render(
            <CalendarPickerForTest
                maxDate={maxDate}
                minDate={minDate}
            />,
        );

        expect(screen.getByText(monthNames[currentDate.getMonth()])).toBeTruthy();
        expect(screen.getByText(currentDate.getFullYear().toString())).toBeTruthy();
    });

    test('clicking next month arrow updates the displayed month', () => {
        const minDate = new Date('2022-01-01');
        const maxDate = new Date('2030-01-01');
        render(
            <CalendarPickerForTest
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        fireEvent.press(screen.getByTestId('next-month-arrow'));

        const nextMonth = addMonths(new Date(), 1).getMonth();
        expect(screen.getByText(monthNames.at(nextMonth) ?? '')).toBeTruthy();
    });

    test('clicking previous month arrow updates the displayed month', () => {
        render(<CalendarPickerForTest />);

        fireEvent.press(screen.getByTestId('prev-month-arrow'));

        const prevMonth = subMonths(new Date(), 1).getMonth();
        expect(screen.getByText(monthNames.at(prevMonth) ?? '')).toBeTruthy();
    });

    test('clicking a day updates the selected date', () => {
        const onSelectedMock = jest.fn();
        const minDate = new Date('2022-01-01');
        const maxDate = new Date('2030-01-01');
        const value = '2023-01-01';
        render(
            <CalendarPickerForTest
                value={value}
                minDate={minDate}
                maxDate={maxDate}
                onSelected={onSelectedMock}
            />,
        );

        fireEvent.press(screen.getByText('15'));

        expect(onSelectedMock).toHaveBeenCalledWith('2023-01-15');
        expect(onSelectedMock).toHaveBeenCalledTimes(1);
    });

    test('clicking previous month arrow and selecting day updates the selected date', () => {
        const onSelectedMock = jest.fn();
        const value = '2022-01-01';
        const minDate = new Date('2022-01-01');
        const maxDate = new Date('2030-01-01');
        render(
            <CalendarPickerForTest
                value={value}
                minDate={minDate}
                maxDate={maxDate}
                onSelected={onSelectedMock}
            />,
        );

        fireEvent.press(screen.getByTestId('next-month-arrow'));
        fireEvent.press(screen.getByText('15'));

        expect(onSelectedMock).toHaveBeenCalledWith('2022-02-15');
    });

    test('should allow navigating to the previous month even when it is before minDate', async () => {
        const minDate = new Date('2003-02-01');
        const value = new Date('2003-02-17');

        render(
            <CalendarPickerForTest
                minDate={minDate}
                value={value}
            />,
        );

        const user = userEvent.setup();
        await user.press(screen.getByTestId('prev-month-arrow'));

        // Navigation should work — the previous month is displayed
        const prevMonth = subMonths(value, 1).getMonth();
        expect(screen.getByText(monthNames.at(prevMonth) ?? '')).toBeOnTheScreen();
    });

    test('should allow navigating to the next month even when it is after maxDate', async () => {
        const maxDate = new Date('2003-02-24');
        const value = new Date('2003-02-17');
        render(
            <CalendarPickerForTest
                maxDate={maxDate}
                value={value}
            />,
        );

        const user = userEvent.setup();
        await user.press(screen.getByTestId('next-month-arrow'));

        // Navigation should work — the next month is displayed
        const nextMonth = addMonths(value, 1).getMonth();
        expect(screen.getByText(monthNames.at(nextMonth) ?? '')).toBeOnTheScreen();
    });

    test('should allow navigating to the month of the max date when it has less days than the selected date', () => {
        const maxDate = new Date('2003-11-27'); // This month has 30 days
        const value = '2003-10-31';

        // given the max date is 27
        render(
            <CalendarPickerForTest
                maxDate={maxDate}
                value={value}
            />,
        );

        // then the next arrow should be enabled
        expect(screen.getByTestId('next-month-arrow')).toBeEnabled();
    });

    test('should open the calendar on a month from max date if it is earlier than current month', () => {
        const onSelectedMock = jest.fn();
        const maxDate = new Date('2011-03-01');
        render(
            <CalendarPickerForTest
                onSelected={onSelectedMock}
                maxDate={maxDate}
            />,
        );

        fireEvent.press(screen.getByText('1'));

        expect(onSelectedMock).toHaveBeenCalledWith('2011-03-01');
    });

    test('should open the calendar on a year from max date if it is earlier than current year', () => {
        const maxDate = new Date('2011-03-01');
        render(<CalendarPickerForTest maxDate={maxDate} />);

        expect(within(screen.getByTestId('currentYearText')).getByText('2011')).toBeTruthy();
    });

    test('should open the calendar on a month from min date if it is later than current month', () => {
        const minDate = new Date('2035-02-16');
        const maxDate = new Date('2040-02-16');
        render(
            <CalendarPickerForTest
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        expect(within(screen.getByTestId('currentYearText')).getByText(minDate.getFullYear().toString())).toBeTruthy();
    });

    test('should not allow to press earlier day than minDate', () => {
        const value = '2003-02-17';
        const minDate = new Date('2003-02-16');
        const onSelectedMock = jest.fn();

        // given the min date is 16
        render(
            <CalendarPickerForTest
                minDate={minDate}
                value={value}
                onSelected={onSelectedMock}
            />,
        );

        //  When the day 15 is pressed
        fireEvent.press(screen.getByLabelText('Saturday, February 15, 2003'));

        // Then the onSelected should not be called as the label 15 is disabled
        expect(onSelectedMock).not.toHaveBeenCalled();

        // When the day 16 is pressed
        fireEvent.press(screen.getByLabelText('Sunday, February 16, 2003'));

        // Then the onSelected should be called as the label 16 is enabled
        expect(onSelectedMock).toHaveBeenCalledWith('2003-02-16');
    });

    test('should not allow to press later day than max', () => {
        const value = '2003-02-17';
        const maxDate = new Date('2003-02-24');
        const onSelectedMock = jest.fn();

        // given the max date is 24
        render(
            <CalendarPickerForTest
                maxDate={maxDate}
                value={value}
                onSelected={onSelectedMock}
            />,
        );

        //  When the day 25 is pressed
        fireEvent.press(screen.getByLabelText('Tuesday, February 25, 2003'));

        // Then the onSelected should not be called as the label 15 is disabled
        expect(onSelectedMock).not.toHaveBeenCalled();

        // When the day 24 is pressed
        fireEvent.press(screen.getByLabelText('Monday, February 24, 2003'));

        // Then the onSelected should be called as the label 24 is enabled
        expect(onSelectedMock).toHaveBeenCalledWith('2003-02-24');
    });

    test('should allow to press min date', () => {
        const value = '2003-02-17';
        const minDate = new Date('2003-02-16');

        // given the min date is 16
        render(
            <CalendarPickerForTest
                minDate={minDate}
                value={value}
            />,
        );

        // then the label 16 should be clickable
        expect(screen.getByLabelText('Sunday, February 16, 2003')).toBeEnabled();
    });

    test('should allow to press max date', () => {
        const value = '2003-02-17';
        const maxDate = new Date('2003-02-24');

        // given the max date is 24
        render(
            <CalendarPickerForTest
                maxDate={maxDate}
                value={value}
            />,
        );

        // then the label 24 should be clickable
        expect(screen.getByLabelText('Monday, February 24, 2003')).toBeEnabled();
    });

    test('clicking next year arrow updates the displayed year', () => {
        const minDate = new Date('2020-01-01');
        const maxDate = new Date('2030-12-31');
        const value = '2025-06-15';
        render(
            <CalendarPickerForTest
                value={value}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        fireEvent.press(screen.getByTestId('next-year-arrow'));

        expect(within(screen.getByTestId('currentYearText')).getByText('2026')).toBeTruthy();
    });

    test('clicking previous year arrow updates the displayed year', () => {
        const minDate = new Date('2020-01-01');
        const maxDate = new Date('2030-12-31');
        const value = '2025-06-15';
        render(
            <CalendarPickerForTest
                value={value}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        fireEvent.press(screen.getByTestId('prev-year-arrow'));

        expect(within(screen.getByTestId('currentYearText')).getByText('2024')).toBeTruthy();
    });

    test('should allow navigating to the previous year even when it is before minDate', async () => {
        const minDate = new Date('2023-01-01');
        const value = new Date('2023-06-15');
        render(
            <CalendarPickerForTest
                minDate={minDate}
                value={value}
            />,
        );

        const user = userEvent.setup();
        await user.press(screen.getByTestId('prev-year-arrow'));

        // Navigation should work — year changes to 2022
        expect(within(screen.getByTestId('currentYearText')).getByText('2022')).toBeTruthy();
    });

    test('should allow navigating to the next year even when it is after maxDate', async () => {
        const maxDate = new Date('2023-12-31');
        const value = new Date('2023-06-15');
        render(
            <CalendarPickerForTest
                maxDate={maxDate}
                value={value}
            />,
        );

        const user = userEvent.setup();
        await user.press(screen.getByTestId('next-year-arrow'));

        // Navigation should work — year changes to 2024
        expect(within(screen.getByTestId('currentYearText')).getByText('2024')).toBeTruthy();
    });

    test('prev year arrow should navigate freely without clamping to minDate', () => {
        const minDate = new Date('2023-11-01');
        const maxDate = new Date('2030-12-31');
        const value = '2024-03-15';
        render(
            <CalendarPickerForTest
                value={value}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        fireEvent.press(screen.getByTestId('prev-year-arrow'));

        // Should navigate to March 2023 without clamping
        expect(within(screen.getByTestId('currentYearText')).getByText('2023')).toBeTruthy();
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(2) ?? '')).toBeTruthy();
    });

    test('next year arrow should navigate freely without clamping to maxDate', () => {
        const minDate = new Date('2020-01-01');
        const maxDate = new Date('2025-04-20');
        const value = '2024-09-15';
        render(
            <CalendarPickerForTest
                value={value}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        fireEvent.press(screen.getByTestId('next-year-arrow'));

        // Should navigate to September 2025 without clamping
        expect(within(screen.getByTestId('currentYearText')).getByText('2025')).toBeTruthy();
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(8) ?? '')).toBeTruthy();
    });

    test('clicking next month arrow in December should update year to next year', () => {
        const minDate = new Date('2020-01-01');
        const maxDate = new Date('2030-12-31');
        const value = '2025-12-15';
        render(
            <CalendarPickerForTest
                value={value}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        fireEvent.press(screen.getByTestId('next-month-arrow'));

        expect(within(screen.getByTestId('currentYearText')).getByText('2026')).toBeTruthy();
        expect(screen.getByText(monthNames.at(0) ?? '')).toBeTruthy();
    });

    test('clicking previous month arrow in January should update year to previous year', () => {
        const minDate = new Date('2020-01-01');
        const maxDate = new Date('2030-12-31');
        const value = '2025-01-15';
        render(
            <CalendarPickerForTest
                value={value}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        fireEvent.press(screen.getByTestId('prev-month-arrow'));

        expect(within(screen.getByTestId('currentYearText')).getByText('2024')).toBeTruthy();
        expect(screen.getByText(monthNames.at(11) ?? '')).toBeTruthy();
    });

    test('next year arrow should not navigate above CONST.CALENDAR_PICKER.MAX_YEAR', () => {
        const value = new Date(CONST.CALENDAR_PICKER.MAX_YEAR, 5, 15);
        const maxDate = new Date(CONST.CALENDAR_PICKER.MAX_YEAR, 11, 31);
        render(
            <CalendarPickerForTest
                value={value}
                maxDate={maxDate}
            />,
        );

        fireEvent.press(screen.getByTestId('next-year-arrow'));

        // Year should be clamped at MAX_YEAR
        expect(within(screen.getByTestId('currentYearText')).getByText(CONST.CALENDAR_PICKER.MAX_YEAR.toString())).toBeTruthy();
    });

    test('prev year arrow should not navigate below CONST.CALENDAR_PICKER.MIN_YEAR', () => {
        const value = new Date(CONST.CALENDAR_PICKER.MIN_YEAR, 5, 15);
        const minDate = new Date(CONST.CALENDAR_PICKER.MIN_YEAR, 0, 1);
        render(
            <CalendarPickerForTest
                value={value}
                minDate={minDate}
            />,
        );

        fireEvent.press(screen.getByTestId('prev-year-arrow'));

        // Year should be clamped at MIN_YEAR
        expect(within(screen.getByTestId('currentYearText')).getByText(CONST.CALENDAR_PICKER.MIN_YEAR.toString())).toBeTruthy();
    });

    test('next month arrow should not navigate above December of CONST.CALENDAR_PICKER.MAX_YEAR', () => {
        const value = new Date(CONST.CALENDAR_PICKER.MAX_YEAR, 11, 15);
        const maxDate = new Date(CONST.CALENDAR_PICKER.MAX_YEAR, 11, 31);
        render(
            <CalendarPickerForTest
                value={value}
                maxDate={maxDate}
            />,
        );

        fireEvent.press(screen.getByTestId('next-month-arrow'));

        // Should remain on December of MAX_YEAR
        expect(within(screen.getByTestId('currentYearText')).getByText(CONST.CALENDAR_PICKER.MAX_YEAR.toString())).toBeTruthy();
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(11) ?? '')).toBeTruthy();
    });

    test('prev month arrow should not navigate below January of CONST.CALENDAR_PICKER.MIN_YEAR', () => {
        const value = new Date(CONST.CALENDAR_PICKER.MIN_YEAR, 0, 15);
        const minDate = new Date(CONST.CALENDAR_PICKER.MIN_YEAR, 0, 1);
        render(
            <CalendarPickerForTest
                value={value}
                minDate={minDate}
            />,
        );

        fireEvent.press(screen.getByTestId('prev-month-arrow'));

        // Should remain on January of MIN_YEAR
        expect(within(screen.getByTestId('currentYearText')).getByText(CONST.CALENDAR_PICKER.MIN_YEAR.toString())).toBeTruthy();
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(0) ?? '')).toBeTruthy();
    });

    test('clicking the month button opens the month picker and selecting a month updates the calendar', () => {
        const minDate = new Date('2020-01-01');
        const maxDate = new Date('2030-12-31');
        const value = '2025-06-15';
        render(
            <CalendarPickerForTest
                value={value}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        fireEvent.press(screen.getByTestId('currentMonthButton'));

        const monthPickerModal = screen.getByTestId('MonthPickerModal');
        expect(monthPickerModal).toBeTruthy();

        fireEvent.press(within(monthPickerModal).getByTestId('month-option-8'));

        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(8) ?? '')).toBeTruthy();
    });

    test('clicking the year button navigates to the year picker screen with the current year and context', () => {
        mockNavigate.mockClear();
        const minDate = new Date('2020-01-01');
        const maxDate = new Date('2030-12-31');
        const value = '2025-06-15';
        render(
            <CalendarPickerForTest
                value={value}
                minDate={minDate}
                maxDate={maxDate}
                pickerContextID="datePicker-testInput"
            />,
        );

        fireEvent.press(screen.getByTestId('currentYearButton'));

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        const navigatedRoute = mockNavigate.mock.calls.at(0)?.at(0) ?? '';
        expect(navigatedRoute).toContain('year-selector');
        expect(navigatedRoute).toContain('contextID=datePicker-testInput');
        expect(navigatedRoute).toContain('currentYear=2025');
    });

    test('the year button dismisses the host popover before navigating when shouldCloseModalOnYearPickerOpen is set', () => {
        mockNavigate.mockClear();
        const closeTopSpy = jest.spyOn(Modal, 'closeTop').mockImplementation(() => {});
        render(<CalendarPickerForTest shouldCloseModalOnYearPickerOpen />);

        fireEvent.press(screen.getByTestId('currentYearButton'));

        expect(closeTopSpy).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        closeTopSpy.mockRestore();
    });

    test('the year button does not dismiss any modal when shouldCloseModalOnYearPickerOpen is not set', () => {
        mockNavigate.mockClear();
        const closeTopSpy = jest.spyOn(Modal, 'closeTop').mockImplementation(() => {});
        render(<CalendarPickerForTest />);

        fireEvent.press(screen.getByTestId('currentYearButton'));

        expect(closeTopSpy).not.toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        closeTopSpy.mockRestore();
    });

    test('closing the month picker via onClose hides the modal', () => {
        render(<CalendarPickerForTest />);

        fireEvent.press(screen.getByTestId('currentMonthButton'));
        expect(screen.getByTestId('MonthPickerModal')).toBeTruthy();

        fireEvent.press(screen.getByTestId('month-modal-close'));
        expect(screen.queryByTestId('MonthPickerModal')).toBeNull();
    });

    test('month picker should always return all 12 months', () => {
        const allMonths = DateUtils.getFilteredMonthItems(monthNames, 6);

        // All 12 months should be present
        expect(allMonths).toHaveLength(12);
        expect(allMonths.find((m) => m.value === 0)).toBeTruthy();
        expect(allMonths.find((m) => m.value === 11)).toBeTruthy();

        // The current month (June, index 6) should be selected
        expect(allMonths.find((m) => m.value === 6)?.isSelected).toBe(true);
        expect(allMonths.find((m) => m.value === 0)?.isSelected).toBe(false);
    });

    test('the year selector dynamic route is reachable from any CalendarPicker host (not gated to an allowlist)', () => {
        // CalendarPicker is rendered from many screens (date input fields, DateSelectPopup,
        // RangeDatePicker, DatePresetFilterBase, ScheduleCallPage, ...). The previous in-place
        // YearPickerModal had no screen restriction, so the migrated dynamic route must stay
        // unrestricted; a partial entryScreens allowlist would silently break the year picker
        // on any screen it omits.
        expect(DYNAMIC_ROUTES.YEAR_SELECTOR.entryScreens).toContain('*');
    });
});

describe('year selector round-trip', () => {
    const CONTEXT_ID = 'datePicker-roundTripInput';
    // A fixed starting view so an adopted year is unambiguous and "view preserved" can be asserted by
    // checking that the month/day grid is NOT reset to today.
    const START_VALUE = '2023-06-15';
    const MIN_DATE = new Date('2000-01-01');
    const MAX_DATE = new Date('2030-12-31');

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => Onyx.clear().then(waitForBatchedUpdates));

    test('adopts the year written back for its own contextID, preserves the month/day view, and clears the Onyx key', async () => {
        render(
            <CalendarPickerForTest
                pickerContextID={CONTEXT_ID}
                value={START_VALUE}
                minDate={MIN_DATE}
                maxDate={MAX_DATE}
            />,
        );

        // Starts on the value's year/month, and the value's day (15) is selected in the grid.
        expect(within(screen.getByTestId('currentYearText')).getByText('2023')).toBeTruthy();
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(5) ?? '')).toBeTruthy();
        expect(screen.getByLabelText('Thursday, June 15, 2023')).toBeTruthy();

        // Simulate the year picker screen writing the user's selection back for THIS host's contextID,
        // exactly as the real setter does on goBack.
        setCalendarPickerSelectedYear(CONTEXT_ID, 2019);
        await waitForBatchedUpdates();

        // CalendarPicker consumes the matching contextID and applies the year to the displayed month
        // (deferred via requestAnimationFrame).
        await waitFor(() => {
            expect(within(screen.getByTestId('currentYearText')).getByText('2019')).toBeTruthy();
        });

        // The month/day VIEW is preserved (only the year changed via setYear(prev, year)) — it is NOT
        // reset to today's month. June must still be shown, and the same day-of-month (June 15, 2019)
        // is still rendered/selectable in the grid.
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(5) ?? '')).toBeTruthy();
        expect(screen.getByLabelText('Saturday, June 15, 2019')).toBeTruthy();

        // The transient selection is cleared so it isn't re-applied on the next render.
        expect(await getOnyxValue(ONYXKEYS.CALENDAR_PICKER_SELECTED_YEAR)).toBeUndefined();
    });

    test('ignores a year written back for a DIFFERENT contextID and leaves the Onyx key intact for its owner', async () => {
        render(
            <CalendarPickerForTest
                pickerContextID={CONTEXT_ID}
                value={START_VALUE}
                minDate={MIN_DATE}
                maxDate={MAX_DATE}
            />,
        );

        expect(within(screen.getByTestId('currentYearText')).getByText('2023')).toBeTruthy();

        // A different host's selection lands in Onyx.
        setCalendarPickerSelectedYear('datePicker-someOtherInput', 2019);
        await waitForBatchedUpdates();

        // Give the consume effect (and its deferred rAF) a chance to wrongly fire.
        await waitFor(() => {
            jest.advanceTimersByTime(0);
        });
        await waitForBatchedUpdates();

        // This instance must NOT consume it (contextID mismatch): year unchanged...
        expect(within(screen.getByTestId('currentYearText')).getByText('2023')).toBeTruthy();
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(5) ?? '')).toBeTruthy();
        // ...and it must NOT clear the key — that's the owning host's responsibility.
        expect(await getOnyxValue(ONYXKEYS.CALENDAR_PICKER_SELECTED_YEAR)).toEqual({contextID: 'datePicker-someOtherInput', year: 2019});
    });

    test('on desktop web the calendar root hides itself (opacity 0 + hidden + pointerEvents none) while the year selector is open', () => {
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
        mockedUseResponsiveLayout.mockReturnValue(WIDE_LAYOUT);
        mockedUseIsYearSelectorOpen.mockReturnValue(true);

        render(
            <CalendarPickerForTest
                pickerContextID={CONTEXT_ID}
                value={START_VALUE}
                minDate={MIN_DATE}
                maxDate={MAX_DATE}
            />,
        );

        // Exactly one element — the calendar root View — carries the hide signature. (visibility: 'hidden'
        // is applied alongside via styles.visibilityHidden, a web-only platform-split utility that resolves
        // to an empty object under jest's native module resolution, so it is not asserted here.)
        const hiddenRoots = findHiddenRoots();
        expect(hiddenRoots).toHaveLength(1);
        const root = hiddenRoots.at(0);
        const style = flattenStyle(root?.props?.style);
        expect(style.opacity).toBe(0);
        expect(root?.props?.pointerEvents).toBe('none');
    });

    test('on native the calendar does NOT hide even while the year selector is open', () => {
        // Native dismisses its host instead of self-hiding, so isDesktopWeb is false (getPlatform !== web).
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.ANDROID);
        mockedUseResponsiveLayout.mockReturnValue(NARROW_LAYOUT);
        mockedUseIsYearSelectorOpen.mockReturnValue(true);

        render(
            <CalendarPickerForTest
                pickerContextID={CONTEXT_ID}
                value={START_VALUE}
                minDate={MIN_DATE}
                maxDate={MAX_DATE}
            />,
        );

        expect(findHiddenRoots()).toHaveLength(0);
        expect(within(screen.getByTestId('currentYearText')).getByText('2023')).toBeTruthy();
    });

    test('on narrow web the calendar does NOT self-hide even while the year selector is open (the narrow host owns dismissal)', () => {
        // Narrow web keeps getPlatform === web but isSmallScreenWidth is true, so isDesktopWeb is false:
        // the small-screen backdrop handles the overlap, the calendar must not opacity-hide itself.
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
        mockedUseResponsiveLayout.mockReturnValue(NARROW_LAYOUT);
        mockedUseIsYearSelectorOpen.mockReturnValue(true);

        render(
            <CalendarPickerForTest
                pickerContextID={CONTEXT_ID}
                value={START_VALUE}
                minDate={MIN_DATE}
                maxDate={MAX_DATE}
            />,
        );

        expect(findHiddenRoots()).toHaveLength(0);
        expect(within(screen.getByTestId('currentYearText')).getByText('2023')).toBeTruthy();
    });
});
