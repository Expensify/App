// cspell:ignore Januar Zuletzt verwendet
import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsContext} from '@components/CurrentUserPersonalDetailsProvider';
import Status from '@components/LHNOptionsList/OptionRowLHN/OptionRow/Status';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PerDiemEReceipt from '@components/PerDiemEReceipt';
import type {ListItem, ListItemProps} from '@components/SelectionList/ListItem/types';

import type {OptionData} from '@libs/ReportUtils';

import ReuseRouteListItem from '@pages/iou/request/step/ReuseRouteListItem';
import ScheduleCallConfirmationPage from '@pages/ScheduleCall/ScheduleCallConfirmationPage';
import StatusPage from '@pages/settings/Profile/CustomStatus/StatusPage';
import WorkspacePlanTypePage from '@pages/workspace/DynamicWorkspaceOverviewPlanTypePage';

import * as UserActions from '@userActions/User';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, ReusableDistanceRoute} from '@src/types/onyx';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type Transaction from '@src/types/onyx/Transaction';

import type * as ReactNavigationNative from '@react-navigation/native';
import type {NavigationProp, ParamListBase} from '@react-navigation/native';
import type {ComponentProps, ComponentType, PropsWithChildren} from 'react';
import type {TextProps, ViewProps} from 'react-native';

import {NavigationContext} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import {setupGlobalFetchMock} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

setupGlobalFetchMock();

jest.mock('@libs/Navigation/Navigation');
jest.mock('@libs/actions/Policy/Plan', () => jest.fn());
jest.mock('@libs/actions/ScheduleCall', () => ({confirmBooking: jest.fn()}));
jest.mock('@userActions/User', () => ({
    ...jest.requireActual<typeof UserActions>('@userActions/User'),
    updateCustomStatus: jest.fn(),
}));
jest.mock('@hooks/useAutoFocusInput', () => () => ({inputCallbackRef: jest.fn(), inputRef: {current: null}}));
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock('@components/ReportActionAvatars', () => () => null);
jest.mock('@components/EReceiptThumbnail', () => () => null);
jest.mock('@components/SelectionList', () => () => null);
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: PropsWithChildren) =>
            children,
);
jest.mock(
    '@components/BlockingViews/FullPageOfflineBlockingView',
    () =>
        ({children}: PropsWithChildren) =>
            children,
);
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: PropsWithChildren) =>
            children,
);
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useRoute: () => ({params: {reportID: '100'}}),
}));

// Native tests inspect tooltip content without depending on the browser's hover timing.
jest.mock('@components/Tooltip', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {Text, View} = jest.requireActual<{Text: ComponentType<TextProps>; View: ComponentType<ViewProps>}>('react-native');
    return ({text, children}: PropsWithChildren<{text: string}>) => ReactModule.createElement(View, null, ReactModule.createElement(Text, null, text), children);
});

function renderSurface(children: React.ReactNode, status?: CurrentUserPersonalDetails['status']) {
    const navigation = createMock<NavigationProp<ParamListBase>>({isFocused: () => true, addListener: () => () => {}});
    return render(
        <NavigationContext.Provider value={navigation}>
            <CurrentUserPersonalDetailsContext.Provider value={{accountID: 999, timezone: {automatic: false, selected: 'Atlantic/Reykjavik'}, status}}>
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{children}</ComposeProviders>
            </CurrentUserPersonalDetailsContext.Provider>
        </NavigationContext.Provider>,
    );
}

describe('Localized display date surfaces', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]}));

    beforeEach(async () => {
        jest.useFakeTimers({doNotFake: ['setImmediate', 'nextTick']});
        jest.setSystemTime(new Date('2026-11-03T20:00:00Z'));
        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {accountID: 999, email: 'date-test@example.com'},
                [ONYXKEYS.NVP_PREFERRED_LOCALE]: CONST.LOCALES.DE,
                [ONYXKEYS.HAS_LOADED_APP]: true,
            });
        });
    });

    afterEach(async () => {
        await act(async () => Onyx.clear());
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it.each([
        ['2026-12-02 17:19:00', 'Locale date check (Bis 02.12. 17:19)'],
        ['2027-01-22 17:19:00', 'Locale date check (Bis 22.01.2027 17:19)'],
    ])('renders a localized status expiry for %s', async (clearAfter, expected) => {
        // Given an actor whose status expires on a different day from the frozen current date
        const optionItem = createMock<OptionData>({
            isOneOnOneChat: true,
            timezone: {automatic: false, selected: 'Atlantic/Reykjavik'},
            status: {emojiCode: '😀', text: 'Locale date check', clearAfter},
        });

        // When the actual row status component formats its tooltip through the app locale provider
        renderSurface(<Status optionItem={optionItem} />);
        await waitForBatchedUpdatesWithAct();

        // Then date order and separators are German, and a different year is not hidden
        expect(screen.getByText(expected)).toBeOnTheScreen();
    });

    it('renders the booking confirmation date without imposing English ordering', async () => {
        // Given a selected calendar day and a separate time-slot instant, without submitting any booking
        await act(async () => {
            await Onyx.set(ONYXKEYS.SCHEDULE_CALL_DRAFT, {
                date: '2027-01-22',
                timeSlot: '2027-01-22T22:00:00Z',
                guide: {accountID: 999, email: 'date-test@example.com'},
                reportID: '100',
            });
        });

        // When the actual booking confirmation page renders with the German app locale
        renderSurface(
            <MenuItem.Root>
                <ScheduleCallConfirmationPage />
            </MenuItem.Root>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the long date uses German grammar while preserving the chosen calendar day
        expect(screen.getByText('22. Januar 2027 from 22:00 - 22:30 GMT+0')).toBeOnTheScreen();
    });

    it('renders a locked annual plan renewal using the localized ordinal-date convention', async () => {
        // Given a read-only annual-plan fixture, without sending a paid plan change
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}date-test`, createMock<Policy>({id: 'date-test', type: CONST.POLICY.TYPE.CORPORATE, canDowngrade: false}));
            await Onyx.set(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION, {type: CONST.SUBSCRIPTION.TYPE.ANNUAL, endDate: '2027-01-22', userCount: 1});
        });
        const props = createMock<ComponentProps<typeof WorkspacePlanTypePage>>({route: {params: {policyID: 'date-test'}}});

        // When the workspace plan page displays the locked subscription's end date
        renderSurface(<WorkspacePlanTypePage {...props} />);
        await waitForBatchedUpdatesWithAct();

        // Then its German description uses a day before the month, not a translated English ordinal pattern
        expect(screen.getByText(/22\. Januar 2027/)).toBeOnTheScreen();
    });

    it('updates a reused-route badge when the app language changes while the row stays mounted', async () => {
        // Given a reusable distance route whose source expense has a fixed UTC insertion date
        const props = createMock<ListItemProps<ListItem & {route: ReusableDistanceRoute}>>({
            item: {
                keyForList: 'route',
                route: {
                    transactionID: '100',
                    inserted: '2026-01-22 12:00:00',
                    distance: 3.5,
                    waypoints: {waypoint0: {address: 'Start'}, waypoint1: {address: 'End'}},
                },
            },
            onSelectRow: jest.fn(),
        });
        renderSurface(<ReuseRouteListItem {...props} />);
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText('Zuletzt verwendet am 22. Jan.')).toBeOnTheScreen();

        // When the app language changes without replacing the row or its route
        await act(async () => Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.JA));
        await waitForBatchedUpdatesWithAct();

        // Then both the badge copy and the date follow the reactive locale
        expect(screen.getByText('最終利用日：1月22日')).toBeOnTheScreen();
    });

    it('localizes the status editor label without changing the saved expiry value', async () => {
        // Given a saved custom expiry in the machine format expected by the status action
        const clearAfter = '2026-12-02 17:19:00';
        renderSurface(<StatusPage />, {emojiCode: '😀', text: 'Locale date check', clearAfter});
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText('02.12.2026 17:19')).toBeOnTheScreen();

        // When the language changes without remounting the form and the user saves it
        await act(async () => Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN));
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText('12/02/2026 5:19 PM')).toBeOnTheScreen();
        fireEvent.press(screen.getByRole('button', {name: 'Save'}));
        await waitForBatchedUpdatesWithAct();

        // Then presentation changes never replace the action's original machine datetime
        expect(UserActions.updateCustomStatus).toHaveBeenCalledWith(999, {emojiCode: '😀', text: 'Locale date check', clearAfter});
    });

    it('keeps persisted per-diem merchant dates readable after changing language', async () => {
        // Given merchant text persisted with comma-separated date parts, including a comma in its destination
        const dates = 'Jan. 22, 2026 - Jan. 23, 2026';
        await act(async () => {
            await Onyx.set(
                `${ONYXKEYS.COLLECTION.TRANSACTION}100`,
                createMock<Transaction>({
                    transactionID: '100',
                    reportID: '100',
                    created: '2026-01-22',
                    merchant: `Berlin, Germany, ${dates}`,
                    amount: -1000,
                    currency: CONST.CURRENCY.USD,
                }),
            );
        });
        renderSurface(<PerDiemEReceipt transactionID="100" />);
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText(dates)).toBeOnTheScreen();

        // When the app preference changes while the receipt remains mounted
        await act(async () => Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.JA));
        await waitForBatchedUpdatesWithAct();

        // Then the real merchant parser still separates the destination from the unchanged stored dates
        expect(screen.getByText(dates)).toBeOnTheScreen();
        expect(screen.getByText(/Berlin, Germany/)).toBeOnTheScreen();
    });
});
