import {render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import AccountManagerBanner from '@pages/inbox/AccountManagerBanner';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        Lightbulb: 'Lightbulb',
    })),
}));

const CONCIERGE_REPORT_ID = '1';
const ACCOUNT_MANAGER_REPORT_ID = '2';
const ACCOUNT_MANAGER_ACCOUNT_ID = 42;
const ACCOUNT_MANAGER_LOGIN = 'am@expensify.com';
const ACCOUNT_MANAGER_DISPLAY_NAME = 'Jamie Manager';

function renderBanner() {
    return render(
        <OnyxListItemProvider>
            <LocaleContextProvider>
                <AccountManagerBanner reportID={CONCIERGE_REPORT_ID} />
            </LocaleContextProvider>
        </OnyxListItemProvider>,
    );
}

describe('AccountManagerBanner', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.CONCIERGE_REPORT_ID, CONCIERGE_REPORT_ID);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CONCIERGE_REPORT_ID}`, {
            reportID: CONCIERGE_REPORT_ID,
        });
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [ACCOUNT_MANAGER_ACCOUNT_ID]: {
                accountID: ACCOUNT_MANAGER_ACCOUNT_ID,
                login: ACCOUNT_MANAGER_LOGIN,
                displayName: ACCOUNT_MANAGER_DISPLAY_NAME,
            },
        });
    });

    it('renders the banner body using account.accountManagerAccountID (the OpenApp-populated field)', async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT, {
            accountManagerReportID: ACCOUNT_MANAGER_REPORT_ID,
            accountManagerAccountID: String(ACCOUNT_MANAGER_ACCOUNT_ID),
        });

        renderBanner();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(new RegExp(ACCOUNT_MANAGER_DISPLAY_NAME))).toBeTruthy();
        expect(screen.getByText(new RegExp(ACCOUNT_MANAGER_LOGIN))).toBeTruthy();
    });

    it('renders nothing when account.accountManagerReportID is not set', async () => {
        renderBanner();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(new RegExp(ACCOUNT_MANAGER_DISPLAY_NAME))).toBeNull();
    });

    it('does not populate the banner from the legacy top-level ACCOUNT_MANAGER_REPORT_ID key (regression guard)', async () => {
        // The legacy standalone key is never written to by OpenApp. If the banner regresses to reading it,
        // this test will start showing the banner text even though `account` is empty — and fail.
        await Onyx.merge(ONYXKEYS.ACCOUNT_MANAGER_REPORT_ID, ACCOUNT_MANAGER_REPORT_ID);

        renderBanner();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(new RegExp(ACCOUNT_MANAGER_DISPLAY_NAME))).toBeNull();
    });
});
