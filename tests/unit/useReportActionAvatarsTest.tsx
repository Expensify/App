import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import useReportActionAvatars from '@components/ReportActionAvatars/useReportActionAvatars';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import {createInvoiceReport, createInvoiceRoom} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockPolicyID = '123456';
const invoiceReportRoomID = 123;
const invoiceReportID = 234;
const invoiceReportActionID = 345;

const mockPolicy = {...createRandomPolicy(Number(mockPolicyID), CONST.POLICY.TYPE.TEAM, 'TestPolicy'), policyID: mockPolicyID};
const mockInvoiceRoom = {...createInvoiceRoom(invoiceReportRoomID), policyID: mockPolicyID};
const mockInvoiceReport = {...createInvoiceReport(invoiceReportID), chatReportID: invoiceReportRoomID.toString(), policyID: mockPolicyID};
const mockReportAction = createRandomReportAction(invoiceReportActionID);

const wrapper = ({children}: {children: React.ReactNode}) => {
    return <OnyxListItemProvider>{children}</OnyxListItemProvider>;
};

describe('useReportActionAvatars', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    describe('isWorkspaceActor', () => {
        beforeEach(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${mockInvoiceRoom?.reportID}`, mockInvoiceRoom);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${mockInvoiceReport?.reportID}`, mockInvoiceReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${mockPolicy?.policyID}`, mockPolicy);
        });

        afterEach(() => {
            Onyx.clear();
        });

        test.each(
            Object.values(CONST.REPORT.ACTIONS.TYPE)
                .reduce((result, cur) => {
                    if (typeof cur === 'object') {
                        result.push(...Object.values(cur));
                    } else {
                        result.push(cur);
                    }
                    return result;
                }, [] as string[])
                .map((value) => [value === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW, value]),
        )('With an invoice report, isWorkspaceActor should be %s when the actionName is "%s"', async (expected, actionName) => {
            const reportAction = {...mockReportAction, actionName: actionName as typeof CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT};
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportAction.reportActionID}`, {[reportAction.reportActionID]: reportAction});

            const {
                result: {current: data},
            } = renderHook(({report, action}) => useReportActionAvatars({report, action}), {
                initialProps: {report: mockInvoiceReport, action: reportAction},
                wrapper,
            });

            expect(data.details.isWorkspaceActor).toEqual(expected);
        });
    });
});
