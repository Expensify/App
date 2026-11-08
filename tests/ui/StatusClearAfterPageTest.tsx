import {act, cleanup, fireEvent, render, renderHook, screen, within} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import Icon from '@components/Icon';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import SelectionList from '@components/SelectionList';
import ThemeProvider from '@components/ThemeProvider';

import {MouseProvider} from '@hooks/useMouseContext';
import useTheme from '@hooks/useTheme';

import * as Modal from '@libs/actions/Modal';
import {updateDraftCustomStatus, updateStatusDraftCustomClearAfterDate} from '@libs/actions/User';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';

import StatusClearAfterPage from '@pages/settings/Profile/CustomStatus/StatusClearAfterPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Onyx from 'react-native-onyx';
import {initialWindowMetrics, SafeAreaProvider} from 'react-native-safe-area-context';

import getOnyxValue from '../utils/getOnyxValue';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type TestParamList = {
    [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER]: undefined;
};

const Stack = createStackNavigator<TestParamList>();
const ACCOUNT_ID = 1;
const FROZEN_NOW = new Date('2026-11-02T12:00:00Z');
const FUTURE_CLEAR_AFTER = '2026-11-10 15:30:00';
const CURRENT_CLEAR_AFTER = '2026-11-12 09:15:00';
const PAST_CLEAR_AFTER = '2026-11-01 15:30:00';
const PAST_TIME_CLEAR_AFTER = '2026-11-02 09:30:00';
const DATE_ERROR = 'Please choose today or a future date';
const TIME_ERROR = 'Please choose a time at least one minute ahead';
const REVIEW_REQUIRED = 'Your review is required';
const pressEvent = {nativeEvent: {}};
// The shared Jest setup identifies lazy icon assets without loading SVG chunks.
const arrowRight = expect.objectContaining({testID: 'mock-expensify-icon-ArrowRight'});
const dotIndicator = expect.objectContaining({testID: 'mock-expensify-icon-DotIndicator'});

async function renderPage(draftClearAfter = FUTURE_CLEAR_AFTER, currentClearAfter = '') {
    await act(async () => {
        await Onyx.set(ONYXKEYS.CUSTOM_STATUS_DRAFT, {clearAfter: draftClearAfter, text: 'Status draft', emojiCode: '💬'});
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ACCOUNT_ID]: {accountID: ACCOUNT_ID, status: {clearAfter: currentClearAfter, text: 'Saved status', emojiCode: '💬'}}});
    });

    render(
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <NavigationContainer ref={navigationRef}>
                <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider, MouseProvider, PortalProvider]}>
                    <ThemeProvider theme={CONST.THEME.LIGHT}>
                        <Stack.Navigator screenOptions={{headerShown: false}}>
                            <Stack.Screen
                                name={SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER}
                                component={StatusClearAfterPage}
                            />
                        </Stack.Navigator>
                    </ThemeProvider>
                </ComposeProviders>
            </NavigationContainer>
        </SafeAreaProvider>,
    );
    await waitForBatchedUpdatesWithAct();
}

function getRowIconProps(row: ReturnType<typeof screen.getByRole>) {
    return within(row)
        .UNSAFE_getAllByType(Icon)
        .map((icon) => {
            const src: unknown = icon.props.src;
            const fill: unknown = icon.props.fill;
            return {src, fill};
        });
}

describe('StatusClearAfterPage', () => {
    beforeEach(async () => {
        jest.useFakeTimers({doNotFake: ['nextTick', 'setImmediate']});
        jest.setSystemTime(FROZEN_NOW);
        jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await Onyx.set(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: 'status-clear-after@example.com', authToken: 'test-auth-token'});
        });
    });

    afterEach(async () => {
        cleanup();
        await act(async () => {
            await Onyx.clear();
        });
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it('renders the custom date and time below the period choices with name-first labels', async () => {
        // Given a custom expiry so both picker fields must be available below the period options
        // When the actual page renders with its normal providers and row components
        await renderPage();

        // Then the list keeps its selected period and footer, and the fields retain their formatting and line limits
        const dateRow = screen.getByRole('button', {name: 'Date, 2026-11-10'});
        const timeRow = screen.getByRole('button', {name: 'Time, 3:30 PM'});
        const list = screen.UNSAFE_getByType(SelectionList);
        expect(list.props.initiallyFocusedItemKey).toBe('CUSTOM');
        expect(list.props.shouldUpdateFocusedIndex).toBe(true);
        expect(within(screen.getByTestId('selection-list')).getByRole('button', {name: 'Date, 2026-11-10'})).toBe(dateRow);
        expect(within(screen.getByTestId('selection-list')).getByRole('button', {name: 'Time, 3:30 PM'})).toBe(timeRow);
        for (const period of Object.values(CONST.CUSTOM_STATUS_TYPES)) {
            expect(screen.getByText(translateLocal(`statusPage.timePeriods.${period}`))).toBeOnTheScreen();
        }
        expect(within(dateRow).getByText('Date')).toHaveProp('numberOfLines', 2);
        expect(within(dateRow).getByText('2026-11-10')).toHaveProp('numberOfLines', 1);
        expect(within(timeRow).getByText('Time')).toHaveProp('numberOfLines', 2);
        expect(within(timeRow).getByText('3:30 PM')).toHaveProp('numberOfLines', 1);
        expect(getRowIconProps(dateRow).map((icon) => icon.src)).toEqual([arrowRight]);
        expect(getRowIconProps(timeRow).map((icon) => icon.src)).toEqual([arrowRight]);
        expect(screen.queryByText(DATE_ERROR)).not.toBeOnTheScreen();
        expect(screen.queryByText(TIME_ERROR)).not.toBeOnTheScreen();
    });

    it('uses the selected locale for field names and the displayed time', async () => {
        // Given a German preference, where time is displayed without an AM or PM suffix
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DE);
        });

        // When the actual page formats the same expiry through its locale provider
        await renderPage();

        // Then the fields use translated names and a localized value without changing the stored picker date
        expect(screen.getByRole('button', {name: 'Datum, 2026-11-10'})).toBeOnTheScreen();
        expect(screen.getByRole('button', {name: 'Zeit, 15:30'})).toBeOnTheScreen();
        expect(await getOnyxValue(ONYXKEYS.STATUS_DRAFT_CUSTOM_CLEAR_AFTER_DATE)).toBe(FUTURE_CLEAR_AFTER);
    });

    it('assigns the reserved telemetry label to each picker interaction', async () => {
        // Given Date and Time open different pickers and need distinct static interaction labels
        // When both real row press targets render
        await renderPage();

        // Then each press target keeps its field name and receives the matching reserved label
        const rows = screen.UNSAFE_getAllByType(PressableWithSecondaryInteraction);
        expect(rows).toHaveLength(2);
        expect(rows.at(0)?.props.accessibilityLabel).toBe('Date, 2026-11-10');
        expect(rows.at(0)?.props.sentryLabel).toBe(CONST.SENTRY_LABEL.CUSTOM_STATUS.CLEAR_AFTER_DATE);
        expect(rows.at(1)?.props.accessibilityLabel).toBe('Time, 3:30 PM');
        expect(rows.at(1)?.props.sentryLabel).toBe(CONST.SENTRY_LABEL.CUSTOM_STATUS.CLEAR_AFTER_TIME);
    });

    it.each([
        ['Date, 2026-11-10', ROUTES.SETTINGS_STATUS_CLEAR_AFTER_DATE],
        ['Time, 3:30 PM', ROUTES.SETTINGS_STATUS_CLEAR_AFTER_TIME],
    ])('opens the existing picker for %s', async (label, route) => {
        // Given populated fields whose similar appearance must not mix up their picker destinations
        await renderPage();

        // When the actual row press target is activated
        fireEvent.press(screen.getByRole('button', {name: label}), pressEvent);

        // Then only that field's existing route is opened
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(route);
    });

    it('blocks both picker presses for an anonymous session', async () => {
        // Given an anonymous session that must go through sign-in rather than edit a private status
        const closeModal = jest.spyOn(Modal, 'close').mockImplementation(() => {});
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS});
        });
        await renderPage();

        // When either real field is pressed, the session guard runs before its navigation callback
        fireEvent.press(screen.getByRole('button', {name: 'Date, 2026-11-10'}), pressEvent);
        fireEvent.press(screen.getByRole('button', {name: 'Time, 3:30 PM'}), pressEvent);

        // Then both presses request the guarded sign-in flow and neither reaches a picker
        expect(closeModal).toHaveBeenCalledTimes(2);
        expect(closeModal).toHaveBeenNthCalledWith(1, expect.any(Function));
        expect(closeModal).toHaveBeenNthCalledWith(2, expect.any(Function));
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('shows fields only for Custom and initializes its picker draft one hour ahead', async () => {
        // Given no saved expiry, so Never starts selected and no footer fields should be shown
        await renderPage('');
        expect(screen.queryByText('Date')).not.toBeOnTheScreen();
        expect(screen.queryByText('Time')).not.toBeOnTheScreen();
        jest.setSystemTime(FROZEN_NOW);

        // When Custom is selected through the real list
        fireEvent.press(screen.getByText('Custom'), pressEvent);
        await waitForBatchedUpdatesWithAct();

        // Then only the picker draft gets the default, and another period removes the footer without saving the status draft
        expect(await getOnyxValue(ONYXKEYS.STATUS_DRAFT_CUSTOM_CLEAR_AFTER_DATE)).toBe('2026-11-02 13:00:00');
        expect(screen.getByRole('button', {name: 'Date, 2026-11-02'})).toBeOnTheScreen();
        expect(screen.getByRole('button', {name: 'Time, 1:00 PM'})).toBeOnTheScreen();
        expect(await getOnyxValue(ONYXKEYS.CUSTOM_STATUS_DRAFT)).toEqual(expect.objectContaining({clearAfter: ''}));
        fireEvent.press(screen.getByText('A week'), pressEvent);
        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByText('Date')).not.toBeOnTheScreen();
        expect(screen.queryByText('Time')).not.toBeOnTheScreen();
    });

    it.each([
        ['the status draft', FUTURE_CLEAR_AFTER, CURRENT_CLEAR_AFTER, 'Date, 2026-11-10', 'Time, 3:30 PM'],
        ['the saved status when the draft is empty', '', CURRENT_CLEAR_AFTER, 'Date, 2026-11-12', 'Time, 9:15 AM'],
    ])('initializes the picker draft from %s', async (_case, draft, current, dateLabel, timeLabel) => {
        // Given saved and unsaved expiry values that must keep their existing precedence
        // When Clear after opens
        await renderPage(draft, current);

        // Then both displayed fields and the picker draft use the same chosen value
        expect(screen.getByRole('button', {name: dateLabel})).toBeOnTheScreen();
        expect(screen.getByRole('button', {name: timeLabel})).toBeOnTheScreen();
        expect(await getOnyxValue(ONYXKEYS.STATUS_DRAFT_CUSTOM_CLEAR_AFTER_DATE)).toBe(draft || current);
    });

    it.each(['', CONST.CUSTOM_STATUS_TYPES.NEVER])('keeps placeholder rows safe when the selected Custom picker draft becomes %p', async (pickerDraft) => {
        // Given Custom is already selected; the date picker refuses empty values in the browser, so this state needs a seeded page test
        await renderPage();

        // When the picker draft contains no formatted date or time
        await act(async () => {
            updateStatusDraftCustomClearAfterDate(pickerDraft);
        });
        await waitForBatchedUpdatesWithAct();

        // Then the actual fields show only their names and still navigate, without trying to format an invalid time
        const dateRow = screen.getByRole('button', {name: 'Date'});
        const timeRow = screen.getByRole('button', {name: 'Time'});
        expect(within(dateRow).getByText('Date')).toBeOnTheScreen();
        expect(within(timeRow).getByText('Time')).toBeOnTheScreen();
        expect(screen.queryByText('2026-11-10')).not.toBeOnTheScreen();
        expect(screen.queryByText('3:30 PM')).not.toBeOnTheScreen();
        fireEvent.press(dateRow, pressEvent);
        fireEvent.press(timeRow, pressEvent);
        expect(Navigation.navigate).toHaveBeenNthCalledWith(1, ROUTES.SETTINGS_STATUS_CLEAR_AFTER_DATE);
        expect(Navigation.navigate).toHaveBeenNthCalledWith(2, ROUTES.SETTINGS_STATUS_CLEAR_AFTER_TIME);
    });

    it.each([
        ['an empty expiry', ''],
        ['Never', CONST.CUSTOM_STATUS_TYPES.NEVER],
        ['the end of today', '2026-11-02 23:59:59'],
    ])('does not expose custom fields for %s on entry', async (_case, clearAfter) => {
        // Given a non-custom saved choice that must not produce empty or misleading field rows
        // When the actual page opens
        await renderPage(clearAfter);

        // Then the fields stay out of the list footer until Custom is chosen
        expect(screen.queryByText('Date')).not.toBeOnTheScreen();
        expect(screen.queryByText('Time')).not.toBeOnTheScreen();
    });

    it.each([
        ['a past day', PAST_CLEAR_AFTER, '2026-11-01', '3:30 PM', true, true],
        ['an earlier time today', PAST_TIME_CLEAR_AFTER, '2026-11-02', '9:30 AM', false, true],
        ['a future expiry', FUTURE_CLEAR_AFTER, '2026-11-10', '3:30 PM', false, false],
    ] as const)('keeps independent field errors and trailing indicators for %s', async (_case, clearAfter, date, time, dateHasError, timeHasError) => {
        // Given a deterministic draft; past-day values cannot be selected by the browser's date picker
        const theme = renderHook(() => useTheme()).result.current;

        // When the actual page validates that draft rather than a mocked validation result
        await renderPage(clearAfter);

        // Then only each failing field gets its own help line, review announcement and danger dot before the chevron
        const dateRow = screen.getByRole('button', {name: `Date, ${date}${dateHasError ? `. ${REVIEW_REQUIRED}` : ''}`});
        const timeRow = screen.getByRole('button', {name: `Time, ${time}${timeHasError ? `. ${REVIEW_REQUIRED}` : ''}`});
        expect(!!within(dateRow).queryByText(DATE_ERROR)).toBe(dateHasError);
        expect(!!within(timeRow).queryByText(TIME_ERROR)).toBe(timeHasError);
        expect(within(dateRow).queryByText(TIME_ERROR)).not.toBeOnTheScreen();
        expect(within(timeRow).queryByText(DATE_ERROR)).not.toBeOnTheScreen();
        for (const [row, error, hasError] of [
            [dateRow, DATE_ERROR, dateHasError],
            [timeRow, TIME_ERROR, timeHasError],
        ] as const) {
            const layout = within(row).UNSAFE_getByType(MenuItem.Row);
            expect(within(layout).queryByText(error)).not.toBeOnTheScreen();
            expect(!!within(row).queryByText(error)).toBe(hasError);
            expect(within(layout).UNSAFE_getByType(MenuItem.Trailing)).toBeDefined();
        }
        expect(getRowIconProps(dateRow).map((icon) => icon.src)).toEqual(dateHasError ? [dotIndicator, arrowRight] : [arrowRight]);
        expect(getRowIconProps(timeRow).map((icon) => icon.src)).toEqual(timeHasError ? [dotIndicator, arrowRight] : [arrowRight]);
        if (dateHasError) {
            expect(getRowIconProps(dateRow).at(0)?.fill).toBe(theme.danger);
        }
        if (timeHasError) {
            expect(getRowIconProps(timeRow).at(0)?.fill).toBe(theme.danger);
        }
        expect(screen.queryByRole('img', {name: CONST.ACCESSIBILITY_LABELS.ERROR})).not.toBeOnTheScreen();
    });

    it('keeps empty picker fields as placeholders when the status draft has errors', async () => {
        // Given the status draft is invalid, independently of the picker draft
        await renderPage(PAST_CLEAR_AFTER);

        // When the pending picker value is cleared
        await act(async () => {
            updateStatusDraftCustomClearAfterDate('');
        });
        await waitForBatchedUpdatesWithAct();

        // Then both errors stay in their rows without changing the empty field labels
        const dateRow = screen.getByRole('button', {name: `Date. ${REVIEW_REQUIRED}`});
        const timeRow = screen.getByRole('button', {name: `Time. ${REVIEW_REQUIRED}`});
        expect(within(dateRow).UNSAFE_getByType(MenuItem.FieldNamePlaceholder)).toBeDefined();
        expect(within(timeRow).UNSAFE_getByType(MenuItem.FieldNamePlaceholder)).toBeDefined();
        expect(within(dateRow).getByText(DATE_ERROR)).toBeOnTheScreen();
        expect(within(timeRow).getByText(TIME_ERROR)).toBeOnTheScreen();
    });

    it('updates displayed picker values without changing which draft supplies validation', async () => {
        // Given an invalid status draft whose existing errors are independent of pending picker edits
        await renderPage(PAST_CLEAR_AFTER);

        // When a picker returns a future value before the Clear after Save button is used
        await act(async () => {
            updateStatusDraftCustomClearAfterDate(FUTURE_CLEAR_AFTER);
        });
        await waitForBatchedUpdatesWithAct();

        // Then both values change but the errors remain until the status draft itself changes
        expect(screen.getByRole('button', {name: `Date, 2026-11-10. ${REVIEW_REQUIRED}`})).toBeOnTheScreen();
        expect(screen.getByRole('button', {name: `Time, 3:30 PM. ${REVIEW_REQUIRED}`})).toBeOnTheScreen();
        expect(screen.getByText(DATE_ERROR)).toBeOnTheScreen();
        expect(screen.getByText(TIME_ERROR)).toBeOnTheScreen();
        await act(async () => {
            updateDraftCustomStatus({clearAfter: FUTURE_CLEAR_AFTER});
        });
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByRole('button', {name: 'Date, 2026-11-10'})).toBeOnTheScreen();
        expect(screen.getByRole('button', {name: 'Time, 3:30 PM'})).toBeOnTheScreen();
        expect(screen.queryByText(DATE_ERROR)).not.toBeOnTheScreen();
        expect(screen.queryByText(TIME_ERROR)).not.toBeOnTheScreen();
    });

    it.each([FUTURE_CLEAR_AFTER, PAST_TIME_CLEAR_AFTER])('saves the custom picker draft %s and returns to Status without adding a validation gate', async (clearAfter) => {
        // Given a picker result that differs from the status draft, so Save must copy the pending value
        await renderPage(CURRENT_CLEAR_AFTER);
        await act(async () => {
            updateStatusDraftCustomClearAfterDate(clearAfter);
        });
        await waitForBatchedUpdatesWithAct();
        expect(await getOnyxValue(ONYXKEYS.CUSTOM_STATUS_DRAFT)).toEqual(expect.objectContaining({clearAfter: CURRENT_CLEAR_AFTER}));

        // When Clear after Save is pressed through the real footer button
        fireEvent.press(screen.getByRole('button', {name: 'Save'}), pressEvent);
        await waitForBatchedUpdatesWithAct();

        // Then only the expiry draft changes, preserving message and emoji, and the original return route is used
        expect(await getOnyxValue(ONYXKEYS.CUSTOM_STATUS_DRAFT)).toEqual({clearAfter, text: 'Status draft', emojiCode: '💬'});
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.SETTINGS_STATUS);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it.each([
        [CONST.CUSTOM_STATUS_TYPES.NEVER, 'never'],
        [CONST.CUSTOM_STATUS_TYPES.THIRTY_MINUTES, '2026-11-02 12:30:00'],
        [CONST.CUSTOM_STATUS_TYPES.ONE_HOUR, '2026-11-02 13:00:00'],
        [CONST.CUSTOM_STATUS_TYPES.AFTER_TODAY, '2026-11-02 23:59:59'],
        [CONST.CUSTOM_STATUS_TYPES.AFTER_WEEK, '2026-11-09 12:00:00'],
    ])('keeps the existing Save calculation for %s', async (period, expectedClearAfter) => {
        // Given the period list is still responsible for calculating non-custom expiry values
        await renderPage('');
        fireEvent.press(screen.getByText(translateLocal(`statusPage.timePeriods.${period}`)), pressEvent);
        await waitForBatchedUpdatesWithAct();
        jest.setSystemTime(FROZEN_NOW);

        // When the selected period is saved
        fireEvent.press(screen.getByRole('button', {name: 'Save'}), pressEvent);
        await waitForBatchedUpdatesWithAct();

        // Then the unchanged status draft calculation and return destination are preserved
        expect(await getOnyxValue(ONYXKEYS.CUSTOM_STATUS_DRAFT)).toEqual(expect.objectContaining({clearAfter: expectedClearAfter}));
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.SETTINGS_STATUS);
    });

    it('returns to Status from the header without saving pending picker changes', async () => {
        // Given the picker draft has changed but the user has not confirmed the Clear after page
        await renderPage();
        await act(async () => {
            updateStatusDraftCustomClearAfterDate(CURRENT_CLEAR_AFTER);
        });
        await waitForBatchedUpdatesWithAct();

        // When the existing header Back control is pressed
        fireEvent.press(screen.getByRole('button', {name: 'Back'}), pressEvent);

        // Then navigation returns to Status and the unconfirmed expiry does not overwrite its draft
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.SETTINGS_STATUS);
        expect(await getOnyxValue(ONYXKEYS.CUSTOM_STATUS_DRAFT)).toEqual(expect.objectContaining({clearAfter: FUTURE_CLEAR_AFTER}));
    });
});
