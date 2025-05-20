import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
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
        const mockReport = {
            reportID: '123',
            reportName: 'Test Report',
            type: 'chat',
            participants: ['email1@test.com', 'email2@test.com'],
        };

        const mockReports = {
            [mockReport.reportID]: mockReport,
        };

        it('returns empty reports when dependencies are not set', () => {
            waitForBatchedUpdates().then(async () => {
                const derivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
                expect(derivedReportAttributes).toEqual({
                    reports: {},
                    locale: null,
                });
            });
        });

        it('computes report attributes when reports are set', () => {
            waitForBatchedUpdates().then(async () => {
                await Onyx.set(ONYXKEYS.COLLECTION.REPORT, mockReports);
                await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'en');
                const derivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
                expect(derivedReportAttributes).toEqual({
                    reports: {
                        [mockReport.reportID]: {
                            reportName: expect(String),
                        },
                    },
                    locale: 'en',
                });
            });
        });

        it('updates when locale changes', () => {
            waitForBatchedUpdates().then(async () => {
                await Onyx.set(ONYXKEYS.COLLECTION.REPORT, mockReports);
                await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'es');
                const derivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
                expect(derivedReportAttributes).toEqual({
                    reports: {
                        [mockReport.reportID]: {
                            reportName: expect(String),
                        },
                    },
                    locale: 'es',
                });
            });
        });
    });
});
