import {renderHook} from '@testing-library/react-native';
import type {ReactNode} from 'react';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import useOriginalReportID from '@hooks/useOriginalReportID';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

describe('useOriginalReportID', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        Onyx.clear();
    });

    it('should return the reportID given a DEW routed action', async () => {
        // Given a report actions that contain DEW SUBMITTED action
        const reportID = '1';
        const dewSubmittedAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.SUBMITTED> = {
            actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
            created: '',
            reportActionID: '1',
            originalMessage: {
                workflow: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
                to: 'example@gmail.com',
                amount: 1,
                currency: CONST.CURRENCY.USD,
            },
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
            [dewSubmittedAction.reportActionID]: dewSubmittedAction,
        });

        const wrapper = ({children}: {children: ReactNode}) => <OnyxListItemProvider>{children}</OnyxListItemProvider>;

        // When getting the original reportID of a DEW routed action that is derived from the DEW SUBMITTED action
        const dewRoutedAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED> = {
            actionName: CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED,
            created: '',
            reportActionID: '1DEW',
        };
        const {result} = renderHook(() => useOriginalReportID(reportID, dewRoutedAction), {wrapper});

        // Then it should successfully return the reportID of the action
        expect(result.current).toBe(reportID);
    });
});
