import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import useReportActionAvatars from '@components/ReportActionAvatars/useReportActionAvatars';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import {createAdminRoom, createAnnounceRoom, createInvoiceReport, createInvoiceRoom, createRegularChat} from '../utils/collections/reports';
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

    describe('Concierge thinking message avatar (issue #620352)', () => {
        const conciergeAccountID = CONST.ACCOUNT_ID.CONCIERGE;
        const conciergeAvatarURL = 'https://d2k5nsl2zxldvw.cloudfront.net/images/icons/concierge_2022.png';
        const adminRoomReportID = 9001;
        const dmReportID = 9002;
        const announceRoomReportID = 9003;
        const adminPolicyID = '7777';

        const mockAdminRoom = {...createAdminRoom(adminRoomReportID), policyID: adminPolicyID};
        const mockAnnounceRoom = {...createAnnounceRoom(announceRoomReportID), policyID: adminPolicyID};
        const mockAdminPolicy = {...createRandomPolicy(Number(adminPolicyID), CONST.POLICY.TYPE.TEAM, 'AcmeCorp'), policyID: adminPolicyID};
        const mockConciergeDM = {
            ...createRegularChat(dmReportID, [conciergeAccountID, 12345]),
        };

        const conciergePersonalDetails: PersonalDetailsList = {
            [conciergeAccountID]: {
                accountID: conciergeAccountID,
                displayName: 'Concierge',
                login: 'concierge@expensify.com',
                avatar: conciergeAvatarURL,
            },
        };

        beforeEach(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${mockAdminRoom.reportID}`, mockAdminRoom);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${mockAnnounceRoom.reportID}`, mockAnnounceRoom);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${mockConciergeDM.reportID}`, mockConciergeDM);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${adminPolicyID}`, mockAdminPolicy);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, conciergePersonalDetails);
            await waitForBatchedUpdates();
        });

        afterEach(() => {
            Onyx.clear();
        });

        // Test 1: Reproduces the bug — admin room without action/accountIDs shows workspace avatar
        test('should show workspace avatar in admin room when no action and no accountIDs are provided (bug repro)', () => {
            const {
                result: {current: data},
            } = renderHook(() => useReportActionAvatars({report: mockAdminRoom, action: undefined}), {wrapper});

            // BUG: Without the fix, useNearestReportAvatars kicks in and resolves to the workspace icon.
            // This assertion documents the CURRENT BUGGY behavior (workspace avatar).
            // After the fix (passing accountIDs=[CONCIERGE]), callers will bypass this path.
            expect(data.avatars.at(0)?.type).toBe(CONST.ICON_TYPE_WORKSPACE);
        });

        // Test 2: Verifies the fix — passing accountIDs forces Concierge avatar resolution
        test('should resolve Concierge avatar when accountIDs includes Concierge ID in an admin room', () => {
            const {
                result: {current: data},
            } = renderHook(() => useReportActionAvatars({report: mockAdminRoom, action: undefined, accountIDs: [conciergeAccountID]}), {wrapper});

            expect(data.avatars.at(0)?.type).toBe(CONST.ICON_TYPE_AVATAR);
            expect(data.avatars.at(0)?.source).toBe(conciergeAvatarURL);
            expect(data.avatars.at(0)?.id).toBe(conciergeAccountID);
        });

        // Test 3: Regression — regular Concierge DM still works without action/accountIDs
        test('should resolve Concierge avatar in a regular Concierge DM without action or accountIDs', () => {
            const {
                result: {current: data},
            } = renderHook(() => useReportActionAvatars({report: mockConciergeDM, action: undefined}), {wrapper});

            // In a 1:1 DM, getIcons resolves participant avatars, not workspace avatars
            expect(data.avatars.at(0)?.type).toBe(CONST.ICON_TYPE_AVATAR);
        });

        // Test 4 (adversarial): Bug is systemic across ALL policy rooms, not just #admins
        test('should show workspace avatar in announce room when no action and no accountIDs are provided (bug breadth)', () => {
            const {
                result: {current: data},
            } = renderHook(() => useReportActionAvatars({report: mockAnnounceRoom, action: undefined}), {wrapper});

            // Same bug as admin room: useNearestReportAvatars falls through to getIcons(policyRoom) → workspace icon.
            // Proves the fix must cover all policy room types, not just admin rooms.
            expect(data.avatars.at(0)?.type).toBe(CONST.ICON_TYPE_WORKSPACE);
        });
    });
});
