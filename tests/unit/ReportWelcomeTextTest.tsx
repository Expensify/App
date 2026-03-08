import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ReportWelcomeText from '@components/ReportWelcomeText';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Policy, Report} from '@src/types/onyx';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
        localeCompare: jest.fn((a: string, b: string) => a.localeCompare(b)),
        numberFormat: jest.fn((num: number) => num.toString()),
        datetimeToRelative: jest.fn(),
        datetimeToCalendarTime: jest.fn(),
        formatPhoneNumber: jest.fn(),
        toLocaleDigit: jest.fn(),
        fromLocaleDigit: jest.fn(),
        preferredLocale: 'en',
    })),
);

jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        textHero: {},
        mt3: {},
        mw100: {},
        renderHTML: {},
        cursorText: {},
    })),
);

jest.mock('@libs/Navigation/Navigation', () => ({
    getReportRHPActiveRoute: jest.fn(() => ''),
    navigate: jest.fn(),
}));

jest.mock('@libs/SidebarUtils', () => ({
    getWelcomeMessage: jest.fn(() => ({messageHtml: '', messageText: 'Welcome!'})),
}));

jest.mock('@hooks/useEnvironment', () =>
    jest.fn(() => ({
        environmentURL: 'https://dev.new.expensify.com:8082',
    })),
);

jest.mock('@hooks/usePreferredPolicy', () =>
    jest.fn(() => ({
        isRestrictedToPreferredPolicy: false,
    })),
);

jest.mock('@hooks/useReportIsArchived', () => jest.fn(() => false));

jest.mock('@components/RenderHTML', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    const ReactNative = require('react-native') as {Text: React.ComponentType<{children?: React.ReactNode}>};
    const {Text} = ReactNative;
    function MockRenderHTML({html}: {html: string}) {
        return <Text>{html}</Text>;
    }
    return MockRenderHTML;
});

const ACCOUNT_ID = 1;
const ACCOUNT_ID_2 = 2;

const personalDetails: Record<string, PersonalDetails> = {
    [String(ACCOUNT_ID)]: {
        accountID: ACCOUNT_ID,
        login: 'test@expensify.com',
        avatar: 'https://example.com/avatar.png',
        displayName: 'Test User',
    },
    [String(ACCOUNT_ID_2)]: {
        accountID: ACCOUNT_ID_2,
        login: 'other@expensify.com',
        avatar: 'https://example.com/avatar2.png',
        displayName: 'Other User',
    },
};

function renderComponent(report: OnyxEntry<Report>, policy?: OnyxEntry<Policy>) {
    return render(
        <ReportWelcomeText
            report={report}
            policy={policy ?? undefined}
        />,
    );
}

describe('ReportWelcomeText', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('renders sayHello for default DM report', async () => {
        const report: Report = {
            reportID: '1',
            type: CONST.REPORT.TYPE.CHAT,
            participants: {[ACCOUNT_ID]: {notificationPreference: 'always'}, [ACCOUNT_ID_2]: {notificationPreference: 'always'}},
        };

        renderComponent(report);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('reportActionsView.sayHello')).toBeTruthy();
    });

    it('renders yourSpace for self DM report', async () => {
        const report: Report = {
            reportID: '2',
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
            participants: {[ACCOUNT_ID]: {notificationPreference: 'always'}},
        };

        renderComponent(report);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('reportActionsView.yourSpace')).toBeTruthy();
    });

    it('renders welcomeToRoom for chat room', async () => {
        const report: Report = {
            reportID: '3',
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
            reportName: 'general',
            participants: {[ACCOUNT_ID]: {notificationPreference: 'always'}},
        };

        renderComponent(report);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('reportActionsView.welcomeToRoom')).toBeTruthy();
    });

    it('renders report name as hero text for system chat', async () => {
        const report: Report = {
            reportID: '4',
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.SYSTEM,
            reportName: 'Expensify',
            participants: {[ACCOUNT_ID]: {notificationPreference: 'always'}},
        };

        renderComponent(report);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('Expensify')).toBeTruthy();
    });

    it('uses personal details from Onyx via useMappedPersonalDetails', async () => {
        const report: Report = {
            reportID: '5',
            type: CONST.REPORT.TYPE.CHAT,
            participants: {[ACCOUNT_ID]: {notificationPreference: 'always'}, [ACCOUNT_ID_2]: {notificationPreference: 'always'}},
        };

        renderComponent(report);
        await waitForBatchedUpdatesWithAct();

        // Component renders correctly when personal details are loaded from Onyx
        expect(screen.getByText('reportActionsView.sayHello')).toBeTruthy();
    });

    it('renders askMeAnything for concierge chat', async () => {
        const CONCIERGE_ACCOUNT_ID = 8392101;
        await act(async () => {
            await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, '100');
        });

        const report: Report = {
            reportID: '100',
            type: CONST.REPORT.TYPE.CHAT,
            participants: {[CONCIERGE_ACCOUNT_ID]: {notificationPreference: 'always'}},
        };

        renderComponent(report);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('reportActionsView.askMeAnything')).toBeTruthy();
    });
});
