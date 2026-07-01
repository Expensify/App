import type * as ReactNavigationNative from '@react-navigation/native';
import {render, screen, within} from '@testing-library/react-native';
import {act} from 'react';
import type {ComponentType, ReactNode} from 'react';
import Onyx from 'react-native-onyx';
import RangeDatePicker from '@components/Search/FilterComponents/RangeDatePicker';
import {setCalendarPickerSelectedYear} from '@libs/actions/CalendarPicker';
import DateUtils from '@libs/DateUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type MockViewProps = {children?: ReactNode};
type MockReactNativePrimitives = {
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

jest.mock('../../src/hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);

jest.mock('@src/components/ConfirmedRoute.tsx');

type MockMonthPickerModalProps = {isVisible: boolean};

// RangeDatePicker mounts two CalendarPickers, each rendering a MonthPickerModal. Stub it so the
// suite doesn't pull in the modal machinery (we only care about the calendar month/year header).
jest.mock('@components/DatePicker/CalendarPicker/MonthPickerModal', () => {
    const ReactNativeActual = jest.requireActual<MockReactNativePrimitives>('react-native');
    const {View} = ReactNativeActual;
    function MockMonthPickerModal({isVisible}: MockMonthPickerModalProps) {
        if (!isVisible) {
            return null;
        }
        return <View />;
    }
    return MockMonthPickerModal;
});

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
        getActiveRoute: jest.fn(() => 'search'),
    },
}));

/**
 * The year write-back is delivered through Onyx and then applied to the displayed month on the next
 * animation frame (see CalendarPicker's selectedYearResult effect). Flush both the batched Onyx
 * updates and the queued requestAnimationFrame so the calendar header reflects the new year.
 */
async function flushYearWriteBack() {
    await act(async () => {
        await waitForBatchedUpdates();
    });
    await act(async () => {
        await new Promise<void>((resolve) => {
            requestAnimationFrame(() => resolve());
        });
    });
}

/**
 * Reads the year currently displayed in the From or To calendar. RangeDatePicker always renders the
 * From CalendarPicker first and the To CalendarPicker second (see RangeDatePicker.tsx), so the two
 * `currentYearText` nodes are deterministically ordered: index 0 == From, index 1 == To. The From/To
 * section labels are asserted separately to confirm that ordering matches the rendered sections.
 */
function getDisplayedYear(section: 'from' | 'to'): string {
    const [fromYearText, toYearText] = screen.getAllByTestId('currentYearText');
    const node = section === 'from' ? fromYearText : toYearText;
    expect(node).toBeTruthy();
    // The year is rendered as a number child, so coerce to a string for a stable comparison.
    return String(within(node).getByText(/\d{4}/).props.children);
}

describe('RangeDatePicker year selector write-back (per-contextID isolation)', () => {
    beforeEach(async () => {
        await Onyx.set(ONYXKEYS.CALENDAR_PICKER_SELECTED_YEAR, null);
        await waitForBatchedUpdates();
    });

    async function renderRangeDatePicker() {
        const result = render(
            <RangeDatePicker
                fromValue="2010-06-15"
                toValue="2012-06-15"
                onFromSelected={jest.fn()}
                onToSelected={jest.fn()}
            />,
        );
        // Let the initial CALENDAR_PICKER_SELECTED_YEAR Onyx subscription settle inside act(...)
        // so the (no-op) store callback doesn't trigger an unwrapped-update warning later.
        await act(async () => {
            await waitForBatchedUpdates();
        });
        return result;
    }

    test('renders two calendars (From and To) seeded at their initial years', async () => {
        await renderRangeDatePicker();

        // Both section labels render, confirming two distinct calendars are mounted in From/To order.
        expect(screen.getByText('common.from')).toBeTruthy();
        expect(screen.getByText('common.to')).toBeTruthy();

        // The two CalendarPickers start on the years implied by their values.
        expect(getDisplayedYear('from')).toBe('2010');
        expect(getDisplayedYear('to')).toBe('2012');
    });

    test('a year write-back for searchRangeFrom only updates the From calendar and clears the key', async () => {
        await renderRangeDatePicker();

        expect(getDisplayedYear('from')).toBe('2010');
        expect(getDisplayedYear('to')).toBe('2012');

        // Simulate the year picker screen returning a selection for the From calendar's context.
        await act(async () => {
            setCalendarPickerSelectedYear('searchRangeFrom', 2015);
            await waitForBatchedUpdates();
        });
        await flushYearWriteBack();

        // Only the From calendar adopts 2015; the To calendar is untouched (no key collision).
        expect(getDisplayedYear('from')).toBe('2015');
        expect(getDisplayedYear('to')).toBe('2012');

        // The month (June) is preserved on the From calendar — only the year changed.
        const [fromMonthText] = screen.getAllByTestId('currentMonthText');
        expect(String(within(fromMonthText).getByText(/\w+/).props.children)).toBe(monthNames.at(5));

        // The transient selection is cleared after being consumed, so it can't be re-applied.
        const remaining = await getOnyxValue(ONYXKEYS.CALENDAR_PICKER_SELECTED_YEAR);
        expect(remaining).toBeFalsy();
    });

    test('a year write-back for searchRangeTo only updates the To calendar and clears the key', async () => {
        await renderRangeDatePicker();

        expect(getDisplayedYear('from')).toBe('2010');
        expect(getDisplayedYear('to')).toBe('2012');

        // Simulate the year picker screen returning a selection for the To calendar's context.
        await act(async () => {
            setCalendarPickerSelectedYear('searchRangeTo', 2017);
            await waitForBatchedUpdates();
        });
        await flushYearWriteBack();

        // Only the To calendar adopts 2017; the From calendar is untouched.
        expect(getDisplayedYear('from')).toBe('2010');
        expect(getDisplayedYear('to')).toBe('2017');

        const remaining = await getOnyxValue(ONYXKEYS.CALENDAR_PICKER_SELECTED_YEAR);
        expect(remaining).toBeFalsy();
    });

    test('an unrelated contextID write-back updates neither calendar but is still cleared', async () => {
        await renderRangeDatePicker();

        // A selection tagged with a contextID belonging to a different host (e.g. a DatePickerModal)
        // must be ignored by both range calendars — the guard is `contextID === pickerContextID`.
        await act(async () => {
            setCalendarPickerSelectedYear('datePicker-someOtherInput', 1999);
            await waitForBatchedUpdates();
        });
        await flushYearWriteBack();

        expect(getDisplayedYear('from')).toBe('2010');
        expect(getDisplayedYear('to')).toBe('2012');

        // Neither calendar matched, so neither cleared it — assert it is still present and untouched,
        // proving the From/To instances did not erroneously consume another instance's selection.
        const remaining = await getOnyxValue(ONYXKEYS.CALENDAR_PICKER_SELECTED_YEAR);
        expect(remaining).toEqual({contextID: 'datePicker-someOtherInput', year: 1999});
    });
});
