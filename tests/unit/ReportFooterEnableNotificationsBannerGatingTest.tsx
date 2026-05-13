import {render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ReportFooter from '@pages/inbox/report/ReportFooter';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const CONCIERGE_REPORT_ID = '1';

let mockShouldShow = false;

jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual<Record<string, unknown>>('@react-navigation/native');
    return {
        ...actual,
        useRoute: () => ({params: {reportID: CONCIERGE_REPORT_ID}}),
    };
});

jest.mock('@pages/inbox/report/useShouldShowEnableNotificationsBanner', () => ({
    __esModule: true,
    default: () => mockShouldShow,
}));

jest.mock('@pages/inbox/report/EnableNotificationsBanner', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    function Stub() {
        return <View testID="enable-notifications-banner-stub" />;
    }
    return {
        __esModule: true,
        default: Stub,
        BANNER_COMPOSER_OVERLAP_PX: 32,
    };
});

jest.mock('@pages/inbox/report/ReportActionCompose/ReportActionCompose', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    function Stub() {
        return <View testID="report-action-compose-stub" />;
    }
    return {
        __esModule: true,
        default: Stub,
    };
});

function renderFooter() {
    return render(
        <OnyxListItemProvider>
            <LocaleContextProvider>
                <ReportFooter />
            </LocaleContextProvider>
        </OnyxListItemProvider>,
    );
}

describe('ReportFooter banner gating', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockShouldShow = false;
        await Onyx.clear();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CONCIERGE_REPORT_ID}`, {
            reportID: CONCIERGE_REPORT_ID,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            ownerAccountID: CONST.ACCOUNT_ID.CONCIERGE,
            participants: {[CONST.ACCOUNT_ID.CONCIERGE]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}},
        });
    });

    it('renders EnableNotificationsBanner when the hook says it should show', async () => {
        mockShouldShow = true;
        renderFooter();
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByTestId('enable-notifications-banner-stub')).toBeOnTheScreen();
        expect(screen.getByTestId('report-action-compose-stub')).toBeOnTheScreen();
    });

    it('does not render EnableNotificationsBanner when the hook says it should not', async () => {
        mockShouldShow = false;
        renderFooter();
        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByTestId('enable-notifications-banner-stub')).toBeNull();
        expect(screen.getByTestId('report-action-compose-stub')).toBeOnTheScreen();
    });
});
