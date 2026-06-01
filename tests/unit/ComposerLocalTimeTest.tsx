import {act, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ComposerLocalTime from '@pages/inbox/report/ReportActionCompose/ComposerLocalTime';
import ComposerProvider from '@pages/inbox/report/ReportActionCompose/ComposerProvider';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report} from '@src/types/onyx';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CURRENT_USER_ACCOUNT_ID = 1;
const RECIPIENT_ACCOUNT_ID = 2;
const REPORT_ID = '1';

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: CURRENT_USER_ACCOUNT_ID}),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

function buildReport(participantAccountIDs: number[]): Report {
    const participants: Report['participants'] = {};
    for (const id of participantAccountIDs) {
        participants[id] = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS};
    }
    return {
        reportID: REPORT_ID,
        type: CONST.REPORT.TYPE.CHAT,
        participants,
    } as Report;
}

function buildPersonalDetails(login = 'normaluser@expensify.com'): PersonalDetailsList {
    return {
        [RECIPIENT_ACCOUNT_ID]: {
            accountID: RECIPIENT_ACCOUNT_ID,
            login,
            displayName: login.startsWith('agent_') ? 'Agent 999' : 'Normal User',
            firstName: login.startsWith('agent_') ? 'Agent' : 'Normal',
            validated: true,
            timezone: {automatic: true, selected: 'America/New_York'},
        },
    };
}

function renderWithProviders(component: React.ReactElement, reportID: string) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <ComposerProvider reportID={reportID}>{component}</ComposerProvider>
        </ComposeProviders>,
    );
}

describe('ComposerLocalTime', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('renders local time for a non-agent participant', async () => {
        const report = buildReport([CURRENT_USER_ACCOUNT_ID, RECIPIENT_ACCOUNT_ID]);
        const personalDetails = buildPersonalDetails();

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
        });

        renderWithProviders(<ComposerLocalTime />, REPORT_ID);

        await waitForBatchedUpdates();

        // ParticipantLocalTime renders a text with the participant's name and local time
        expect(screen.getByText(/Normal/)).toBeTruthy();
    });

    it('renders local time when the report loads after personal details are already available', async () => {
        const report = buildReport([CURRENT_USER_ACCOUNT_ID, RECIPIENT_ACCOUNT_ID]);
        const personalDetails = buildPersonalDetails();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
        });

        renderWithProviders(<ComposerLocalTime />, REPORT_ID);

        await waitForBatchedUpdates();

        expect(screen.queryByText(/Normal/)).toBeNull();

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        });

        await waitFor(() => {
            expect(screen.getByText(/Normal/)).toBeTruthy();
        });
    });

    it('returns null when the composer is full size', async () => {
        const report = buildReport([CURRENT_USER_ACCOUNT_ID, RECIPIENT_ACCOUNT_ID]);
        const personalDetails = buildPersonalDetails();

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${REPORT_ID}`, true);
        });

        const {toJSON} = renderWithProviders(<ComposerLocalTime />, REPORT_ID);

        await waitForBatchedUpdates();

        expect(toJSON()).toBeNull();
    });

    it('returns null for an agent participant', async () => {
        const report = buildReport([CURRENT_USER_ACCOUNT_ID, RECIPIENT_ACCOUNT_ID]);
        const personalDetails = buildPersonalDetails('agent_999@expensify.ai');

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
        });

        const {toJSON} = renderWithProviders(<ComposerLocalTime />, REPORT_ID);

        await waitForBatchedUpdates();

        // Component should render nothing for agent emails
        expect(toJSON()).toBeNull();
    });
});
