import {render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import type Navigation from '@libs/Navigation/Navigation';
import HeaderView from '@pages/home/HeaderView';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import createRandomReportAction from '../../utils/collections/reportActions';
import createRandomReport from '../../utils/collections/reports';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: () => jest.fn(),
    };
});

describe('HeaderView', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    it('should update invoice room title when the invoice receiver detail is updated', async () => {
        // Given an invoice room header
        const chatReportID = '1';
        const accountID = 2;
        let displayName = 'test';
        const report = {
            ...createRandomReport(Number(chatReportID)),
            chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
            invoiceReceiver: {
                accountID,
                type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
            },
        };
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [accountID]: {
                displayName,
            },
        });

        render(
            <HeaderView
                report={report}
                onNavigationMenuButtonClicked={() => {}}
                parentReportAction={createRandomReportAction(0)}
                reportID={report.reportID}
            />,
        );

        await waitForBatchedUpdates();

        expect(screen.getByTestId('DisplayNames')).toHaveTextContent(displayName);

        // When the invoice receiver display name is updated
        displayName = 'test edit';
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [accountID]: {
                displayName,
            },
        });

        // Then the header title should be updated using the new display name
        expect(screen.getByTestId('DisplayNames')).toHaveTextContent(displayName);
    });
});
