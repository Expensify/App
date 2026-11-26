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

describe('AvatarWithDisplayName', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
    });

    it('includes the report status in the header label, because the label replaces the badge for screen readers', async () => {
        // Given a paid expense report
        const report: Report = {
            ...createRandomReport(1, undefined),
            reportName: 'Expense Report 2026-11-25',
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
        };

        // When its header renders with the status badge
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <AvatarWithDisplayName
                    report={report}
                    shouldEnableDetailPageNavigation
                    shouldDisplayStatus
                />
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then a screen reader hears the status, not only the report name
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: 'Expense Report 2026-11-25, Paid'})).toBeOnTheScreen();
    });
});
