/* eslint-disable @typescript-eslint/naming-convention */
import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import createRandomReport from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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

        describe('reportErrors', () => {
            it('returns empty errors when no errors exist', async () => {
                const report = createRandomReport(1);
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await waitForBatchedUpdates();

                const derivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
                expect(derivedReportAttributes?.reports[report.reportID].reportErrors).toEqual({});
            });

            it('combines report error fields with report action errors', async () => {
                const report = {
                    ...createRandomReport(1),
                    errorFields: {
                        field1: {
                            '1234567890': 'Error message 1',
                        },
                    },
                };

                const reportActions: ReportActions = {
                    '1': {
                        reportActionID: '1',
                        actionName: 'ADDCOMMENT',
                        created: '2024-01-01',
                        message: [{html: 'some content', text: 'some content', type: 'text'}],
                        errors: {
                            field2: {
                                '1234567891': 'Error message 2',
                            },
                        },
                    },
                };

                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, reportActions);

                await waitForBatchedUpdates();

                const derivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

                await waitForBatchedUpdates();

                expect(derivedReportAttributes?.reports[report.reportID].reportErrors).toEqual({
                    '1234567890': 'Error message 1',
                    '1234567891': 'Error message 2',
                });
            });

            it('handles multiple error sources', async () => {
                const report = {
                    ...createRandomReport(1),
                    errorFields: {
                        field1: {
                            '1234567890': 'Error message 1',
                        },
                        field2: {
                            '1234567891': 'Error message 2',
                        },
                    },
                };

                const reportActions: ReportActions = {
                    '1': {
                        reportActionID: '1',
                        actionName: 'ADDCOMMENT',
                        created: '2024-01-01',
                        message: [{html: 'some content', text: 'some content', type: 'text'}],
                        errors: {
                            field3: {
                                '1234567892': 'Error message 3',
                            },
                        },
                    },
                    '2': {
                        reportActionID: '2',
                        actionName: 'ADDCOMMENT',
                        created: '2024-01-01',
                        message: [{html: 'some content', text: 'some content', type: 'text'}],
                        errors: {
                            field4: {
                                '1234567893': 'Error message 4',
                            },
                        },
                    },
                };

                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, reportActions);
                await waitForBatchedUpdates();

                const derivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
                expect(derivedReportAttributes?.reports[report.reportID].reportErrors).toEqual({
                    '1234567890': 'Error message 1',
                    '1234567891': 'Error message 2',
                    '1234567892': 'Error message 3',
                    '1234567893': 'Error message 4',
                });
            });

            it('handles empty error objects in sources', async () => {
                const report = {
                    ...createRandomReport(1),
                    errorFields: {
                        field1: {},
                        field2: {
                            '1234567890': 'Error message 1',
                        },
                    },
                };

                const reportActions: ReportActions = {
                    '1': {
                        reportActionID: '1',
                        actionName: 'ADDCOMMENT',
                        created: '2024-01-01',
                        message: [{html: 'some content', text: 'some content', type: 'text'}],
                        errors: {},
                    },
                    '2': {
                        reportActionID: '2',
                        actionName: 'ADDCOMMENT',
                        created: '2024-01-01',
                        message: [{html: 'some content', text: 'some content', type: 'text'}],
                        errors: {
                            field3: {
                                '1234567891': 'Error message 2',
                            },
                        },
                    },
                };

                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, reportActions);
                await waitForBatchedUpdates();

                const derivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
                expect(derivedReportAttributes?.reports[report.reportID].reportErrors).toEqual({
                    '1234567890': 'Error message 1',
                    '1234567891': 'Error message 2',
                });
            });
        });
    });
});
