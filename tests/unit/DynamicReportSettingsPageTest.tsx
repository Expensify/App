import {render, screen} from '@testing-library/react-native';

import MockText from '@components/Text';

import DynamicReportSettingsPage from '@pages/settings/Report/DynamicReportSettingsPage';

import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

import type {ComponentProps, ComponentType, PropsWithChildren} from 'react';

import React from 'react';

import createMock from '../utils/createMock';

const ACCOUNT_ID = 321;
const NOTIFICATION_LABEL = 'notificationPreferencesPage.label';

jest.mock('@pages/inbox/report/withReportOrNotFound', () => () => (Component: ComponentType) => Component);
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: ACCOUNT_ID}));
jest.mock('@hooks/useDynamicBackPath', () => () => undefined);
jest.mock('@hooks/useReportIsArchived', () => () => false);
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: PropsWithChildren) =>
            children,
);
jest.mock(
    '@components/ScrollView',
    () =>
        ({children}: PropsWithChildren) =>
            children,
);
jest.mock(
    '@components/BlockingViews/FullPageNotFoundView',
    () =>
        ({children}: PropsWithChildren) =>
            children,
);
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock('@components/MenuItem/presets/MenuItemField', () => ({name, value}: {name: string; value: string}) => (
    <MockText>
        {name}: {value}
    </MockText>
));

function buildReport(
    notificationPreference: NonNullable<Report['participants']>[number]['notificationPreference'] | '',
    chatType: Report['chatType'] = CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
): Report {
    return {
        reportID: '123',
        type: CONST.REPORT.TYPE.CHAT,
        chatType,
        // Legacy fixtures can contain an empty preference outside the current Report type.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        participants: {[ACCOUNT_ID]: {notificationPreference: notificationPreference as NonNullable<Report['participants']>[number]['notificationPreference']}},
    };
}

function page(report: Report) {
    return <DynamicReportSettingsPage {...createMock<ComponentProps<typeof DynamicReportSettingsPage>>({report})} />;
}

describe('DynamicReportSettingsPage', () => {
    describe('notification visibility', () => {
        it.each([CONST.REPORT.NOTIFICATION_PREFERENCE.DAILY, CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE])(
            'hides notifications after leaving and restores them when %s is restored',
            (notificationPreference) => {
                // Given a subscribed room, including muted rooms that must remain editable
                const {rerender} = render(page(buildReport(notificationPreference)));
                expect(screen.getByText(`${NOTIFICATION_LABEL}: notificationPreferencesPage.notificationPreferences.${notificationPreference}`)).toBeTruthy();

                // When leaving retains the participant but hides the room
                rerender(page(buildReport(CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN)));

                // Then notifications disappear and return after rejoining or rolling back a failed leave
                expect(screen.queryByText(new RegExp(NOTIFICATION_LABEL))).toBeNull();
                rerender(page(buildReport(notificationPreference)));
                expect(screen.getByText(`${NOTIFICATION_LABEL}: notificationPreferencesPage.notificationPreferences.${notificationPreference}`)).toBeTruthy();
            },
        );

        it('preserves the legacy admins-room default without exposing explicitly hidden notifications', () => {
            // Given an admins room with a legacy empty preference
            const report = buildReport('', CONST.REPORT.CHAT_TYPE.POLICY_ADMINS);
            const {rerender} = render(page(report));
            expect(screen.getByText(`${NOTIFICATION_LABEL}: notificationPreferencesPage.notificationPreferences.always`)).toBeTruthy();

            // When that room has an explicit hidden preference instead
            rerender(page(buildReport(CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN, CONST.REPORT.CHAT_TYPE.POLICY_ADMINS)));

            // Then the legacy fallback does not expose the notifications row
            expect(screen.queryByText(new RegExp(NOTIFICATION_LABEL))).toBeNull();
        });

        it.each([CONST.REPORT.CHAT_TYPE.POLICY_ROOM, CONST.REPORT.CHAT_TYPE.POLICY_ADMINS])('does not show notifications for a non-participant in %s', (chatType) => {
            // Given a room without the current user in its participants
            const report = {...buildReport(CONST.REPORT.NOTIFICATION_PREFERENCE.DAILY, chatType), participants: {}};

            // When its settings are rendered
            render(page(report));

            // Then notifications remain unavailable
            expect(screen.queryByText(new RegExp(NOTIFICATION_LABEL))).toBeNull();
        });
    });
});
