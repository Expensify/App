import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';

import {openSupportTicket} from '@userActions/SupportTicket';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

jest.mock('@libs/API');
jest.mock('@libs/Navigation/Navigation');

const mockWrite = jest.mocked(API.write);
const mockNavigate = jest.mocked(Navigation.navigate);
const reportID = 'optimisticSupportTicketReportID';

describe('actions/SupportTicket', () => {
    beforeEach(() => {
        jest.spyOn(ReportUtils, 'generateReportID').mockReturnValue(reportID);
        mockWrite.mockClear();
        mockNavigate.mockClear();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('shows a skeleton while the support ticket assignment is pending', () => {
        openSupportTicket({assigneeAccountID: 123});

        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.CREATE_SUPPORT_TICKET,
            {reportID, assigneeAccountID: 123},
            expect.objectContaining({
                optimisticData: [
                    {
                        onyxMethod: Onyx.METHOD.SET,
                        key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                        value: {reportID, type: CONST.REPORT.TYPE.SUPPORT_TICKET},
                    },
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
                        value: {isOptimisticReport: true},
                    },
                ],
                successData: [
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
                        value: {isOptimisticReport: false},
                    },
                ],
            }),
        );
        expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
});
