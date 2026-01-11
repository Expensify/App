import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import type Navigation from '@libs/Navigation/Navigation';
import HeaderView from '@pages/home/HeaderView';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {createRandomReport} from '../../utils/collections/reports';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: () => jest.fn(),
    };
});

jest.mock('@hooks/useCurrentUserPersonalDetails');
jest.mock('@userActions/Report');

const mockUseCurrentUserPersonalDetails = useCurrentUserPersonalDetails as jest.MockedFunction<typeof useCurrentUserPersonalDetails>;
const mockJoinRoom = jest.spyOn(Report, 'joinRoom');
const currentUserAccountID = 1;

describe('HeaderView', () => {
    beforeEach(() => {
        // Set up default mock return value
        mockUseCurrentUserPersonalDetails.mockReturnValue({
            accountID: currentUserAccountID,
        });
    });

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
            ...createRandomReport(Number(chatReportID), CONST.REPORT.CHAT_TYPE.INVOICE),
            invoiceReceiver: {
                accountID,
                type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
            },
        };
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [accountID]: {
                    displayName,
                },
            });
        });

        render(
            <OnyxListItemProvider>
                <HeaderView
                    report={report}
                    onNavigationMenuButtonClicked={() => {}}
                    parentReportAction={null}
                    reportID={report.reportID}
                />
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('DisplayNames')).toHaveTextContent(displayName);

        // When the invoice receiver display name is updated
        displayName = 'test edit';
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [accountID]: {
                    displayName,
                },
            });
        });

        // Then the header title should be updated using the new display name
        expect(screen.getByTestId('DisplayNames')).toHaveTextContent(displayName);
    });

    it('should display join button', async () => {
        // Given an policy room header
        const report = {
            ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_ROOM),
            reportName: 'Test Room',
            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
        };

        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <HeaderView
                    report={report}
                    onNavigationMenuButtonClicked={() => {}}
                    parentReportAction={null}
                    reportID={report.reportID}
                    shouldUseNarrowLayout
                />
            </ComposeProviders>,
        );

        await waitForBatchedUpdatesWithAct();
        // When the header display the Join button
        const joinButton = screen.getByText('Join');
        expect(joinButton).toBeTruthy();

        // Then the joinRoom action should be called when the user presses the Join button
        fireEvent.press(joinButton);
        expect(mockJoinRoom).toHaveBeenCalledWith(report, currentUserAccountID);
    });
});
