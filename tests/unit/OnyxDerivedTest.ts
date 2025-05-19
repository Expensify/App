import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import {resetState as resetReportAttributesState} from '@userActions/OnyxDerived/configs/reportAttributes';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@components/ConfirmedRoute.tsx');

const accountID = 2;
const conciergeChatReport = LHNTestUtils.getFakeReport([accountID, CONST.ACCOUNT_ID.CONCIERGE]);

describe('OnyxDerived', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
    });

    beforeEach(() => {
        Onyx.clear();
        resetReportAttributesState();
    });

    describe('conciergeChatReportID', () => {
        it('Recomputes when dependent values change', async () => {
            let derivedConciergeChatReportID = await OnyxUtils.get(ONYXKEYS.DERIVED.CONCIERGE_CHAT_REPORT_ID);
            expect(derivedConciergeChatReportID).toBeFalsy();
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${conciergeChatReport.reportID}`, conciergeChatReport);
            derivedConciergeChatReportID = await OnyxUtils.get(ONYXKEYS.DERIVED.CONCIERGE_CHAT_REPORT_ID);
            expect(derivedConciergeChatReportID).toBe(conciergeChatReport.reportID);
        });
    });

    describe('reportAttributes', () => {
        it('returns empty reports when dependencies are not set', async () => {
            await waitForBatchedUpdates();
            const derivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
            expect(derivedReportAttributes).toMatchObject({
                reports: {},
            });
        });

        it('computes report attributes when reports are set', async () => {
            // Use a unique ID to avoid conflicts with other tests
            const mockReportId = `test_${Date.now()}`;
            const mockReport = {
                reportID: mockReportId,
                reportName: 'Test Report',
                type: 'chat',
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                lastVisibleActionCreated: '2023-01-01T00:00:00.000Z',
                lastMessageText: 'Test message',
                lastActorAccountID: 1,
                lastMessageHtml: '<p>Test message</p>',
                participants: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '1': {
                        role: CONST.REPORT.ROLE.ADMIN,
                    },
                },
                policyID: '123',
                ownerAccountID: 1,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            };

            await waitForBatchedUpdates();

            // Set the report directly with the proper key format
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReportId}`, mockReport);
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'en');

            const derivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

            // Check if our specific report was processed
            expect(derivedReportAttributes?.reports?.[mockReportId]).toBeTruthy();
            expect(derivedReportAttributes?.locale).toBe('en');
        });

        it('updates when locale changes', async () => {
            // Use a unique ID to avoid conflicts with other tests
            const mockReportId = `test_${Date.now()}`;
            const mockReport = {
                reportID: mockReportId,
                reportName: 'Test Report',
                type: 'chat',
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                lastVisibleActionCreated: '2023-01-01T00:00:00.000Z',
                lastMessageText: 'Test message',
                lastActorAccountID: 1,
                lastMessageHtml: '<p>Test message</p>',
                participants: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '1': {
                        role: CONST.REPORT.ROLE.ADMIN,
                    },
                },
                policyID: '123',
                ownerAccountID: 1,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            };

            await waitForBatchedUpdates();

            // Set the report directly with the proper key format
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReportId}`, mockReport);
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'es');

            const derivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

            // Check if our specific report was processed
            expect(derivedReportAttributes?.reports?.[mockReportId]).toBeTruthy();
            expect(derivedReportAttributes?.locale).toBe('es');
        });
    });
});
