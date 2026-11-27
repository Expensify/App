import {render, screen} from '@testing-library/react-native';

import AvatarWithDisplayName from '@components/AvatarWithDisplayName';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import {createRandomReport} from '../utils/collections/reports';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation');
jest.mock('@components/Avatar/connected/ReportAvatar', () => () => null);
// The parent subtitle needs a navigator, and the label under test does not depend on it
jest.mock('@components/ParentNavigationSubtitle', () => () => null);

// The status badge is drawn inside the parent subtitle, so each test decides whether that subtitle has anything to show
const mockGetParentNavigationSubtitle = jest.fn();
jest.mock('@libs/ReportUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/ReportUtils'),
    getParentNavigationSubtitle: () => mockGetParentNavigationSubtitle() as unknown,
}));

function buildPaidReport(): Report {
    return {
        ...createRandomReport(1, undefined),
        reportName: 'Expense Report 2026-11-25',
        type: CONST.REPORT.TYPE.EXPENSE,
        stateNum: CONST.REPORT.STATE_NUM.APPROVED,
        statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
    };
}

function renderHeader(report: Report) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <AvatarWithDisplayName
                report={report}
                shouldEnableDetailPageNavigation
                shouldDisplayStatus
            />
        </ComposeProviders>,
    );
}

describe('AvatarWithDisplayName', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
    });

    it('includes the report status in the header label, because the label replaces the badge for screen readers', async () => {
        // Given a paid expense report whose header shows a parent subtitle, and with it the status badge
        mockGetParentNavigationSubtitle.mockReturnValue({reportName: 'Workspace chat'});

        // When its header renders
        renderHeader(buildPaidReport());
        await waitForBatchedUpdatesWithAct();

        // Then a screen reader hears the status, not only the report name
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: 'Expense Report 2026-11-25, Paid'})).toBeOnTheScreen();
    });

    it('leaves the status out when no badge is shown, so screen readers only hear what is on screen', async () => {
        // Given a paid report with no parent subtitle, which is where the badge is drawn
        mockGetParentNavigationSubtitle.mockReturnValue({});

        // When its header renders
        renderHeader(buildPaidReport());
        await waitForBatchedUpdatesWithAct();

        // Then no label announces a status that is not on screen
        expect(screen.queryByRole(CONST.ROLE.BUTTON, {name: 'Expense Report 2026-11-25, Paid'})).not.toBeOnTheScreen();
        expect(screen.getAllByRole(CONST.ROLE.BUTTON, {name: 'Expense Report 2026-11-25'}).length).toBeGreaterThan(0);
    });
});
