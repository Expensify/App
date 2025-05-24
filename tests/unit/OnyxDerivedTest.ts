import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@components/ConfirmedRoute.tsx');

describe('OnyxDerived', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
    });

    beforeEach(async () => {
        await Onyx.clear();
    });

    describe('reportAttributes', () => {
        const mockReport = {
            reportID: `test_1`,
            reportName: 'Test Report',
            type: 'chat',
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
            lastVisibleActionCreated: '2023-01-01T00:00:00.000Z',
            lastMessageText: 'Test message',
            lastActorAccountID: 1,
            lastMessageHtml: '<p>Test message</p>',
            policyID: '123',
            ownerAccountID: 1,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        };

        it('returns empty reports when dependencies are not set', async () => {
            await waitForBatchedUpdates();
            const derivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
            expect(derivedReportAttributes).toMatchObject({
                reports: {},
            });
        });

        it('computes report attributes when reports are set', async () => {
            await waitForBatchedUpdates();

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`, mockReport);
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'en');

            const derivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

            expect(derivedReportAttributes).toMatchObject({
                reports: {
                    [mockReport.reportID]: {
                        reportName: mockReport.reportName,
                    },
                },
            });
        });

        it('updates when locale changes', async () => {
            await waitForBatchedUpdates();

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`, mockReport);
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'es');

            const derivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

            expect(derivedReportAttributes).toMatchObject({
                locale: 'es',
            });
        });
    });
});
