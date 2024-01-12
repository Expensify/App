import Str from 'expensify-common/lib/str';
import CONST from '@src/CONST';
import type {ReportNextStep} from '@src/types/onyx';
import * as NextStepUtils from '../../src/libs/NextStepUtils';
import * as ReportUtils from '../../src/libs/ReportUtils';

describe('libs/NextStepUtils', () => {
    describe('buildNextStep', () => {
        const fakeSubmitterEmail = 'submitter@expensify.com';
        const fakeSelfSubmitterEmail = 'you';
        const fakeChatReportID = '1';
        const fakePolicyID = '2';
        const fakePayeeAccountID = 3;
        const report = ReportUtils.buildOptimisticExpenseReport(fakeChatReportID, fakePolicyID, fakePayeeAccountID, -500, CONST.CURRENCY.USD);

        const optimisticNextStep: ReportNextStep = {
            type: 'neutral',
            title: '',
            message: [],
        };

        beforeEach(() => {
            report.statusNum = CONST.REPORT.STATUS.OPEN;
            optimisticNextStep.title = '';
            optimisticNextStep.message = [];
        });

        it('generates an optimistic nextStep once a report has been opened', () => {
            optimisticNextStep.title = 'Next Steps:';
            optimisticNextStep.message = [
                {
                    text: 'Waiting for',
                },
                {
                    text: fakeSubmitterEmail,
                    type: 'strong',
                },
                {
                    text: 'to',
                },
                {
                    text: 'submit',
                    type: 'strong',
                },
                {
                    text: 'these expenses.',
                },
            ];

            const result = NextStepUtils.buildNextStep(report);

            expect(result).toStrictEqual(optimisticNextStep);
        });

        it('generates an optimistic nextStep once a report has been self opened', () => {
            optimisticNextStep.title = 'Next Steps:';
            optimisticNextStep.message = [
                {
                    text: 'Waiting for',
                },
                {
                    text: fakeSelfSubmitterEmail,
                    type: 'strong',
                },
                {
                    text: 'to',
                },
                {
                    text: 'submit',
                    type: 'strong',
                },
                {
                    text: 'these expenses.',
                },
            ];

            const result = NextStepUtils.buildNextStep(report);

            expect(result).toStrictEqual(optimisticNextStep);
        });

        it('generates an optimistic nextStep once a report has been opened with prevented self submitting', () => {
            optimisticNextStep.title = 'Next Steps:';
            optimisticNextStep.message = [
                {
                    text: "Oops! Looks like you're submitting to ",
                },
                {
                    text: 'yourself',
                    type: 'strong',
                },
                {
                    text: '. Approving your own reports is ',
                },
                {
                    text: 'forbidden',
                    type: 'strong',
                },
                {
                    text: ' by your policy. Please submit this report to someone else or contact your admin to change the person you submit to.',
                },
            ];

            const result = NextStepUtils.buildNextStep(report);

            expect(result).toStrictEqual(optimisticNextStep);
        });

        it('generates an optimistic nextStep once a report has been submitted', () => {
            report.statusNum = CONST.REPORT.STATUS.SUBMITTED;
            optimisticNextStep.title = 'Next Steps:';
            optimisticNextStep.message = [
                {
                    text: 'Waiting for',
                },
                {
                    text: fakeSubmitterEmail,
                    type: 'strong',
                },
                {
                    text: 'to',
                },
                {
                    text: 'review',
                    type: 'strong',
                },
                {
                    text: ' %expenses.',
                },
            ];

            const result = NextStepUtils.buildNextStep(report);

            expect(result).toStrictEqual(optimisticNextStep);
        });

        it('generates an optimistic nextStep once a report has been self submitted', () => {
            report.statusNum = CONST.REPORT.STATUS.SUBMITTED;
            optimisticNextStep.title = 'Next Steps:';
            optimisticNextStep.message = [
                {
                    text: 'Waiting for',
                },
                {
                    text: fakeSelfSubmitterEmail,
                    type: 'strong',
                },
                {
                    text: 'to',
                },
                {
                    text: 'review',
                    type: 'strong',
                },
                {
                    text: ' %expenses.',
                },
            ];

            const result = NextStepUtils.buildNextStep(report);

            expect(result).toStrictEqual(optimisticNextStep);
        });

        it('generates an optimistic nextStep once a report has been approved', () => {
            report.statusNum = CONST.REPORT.STATUS.APPROVED;
            optimisticNextStep.title = 'Next Steps:';
            optimisticNextStep.message = [
                {
                    text: 'Waiting for',
                },
                {
                    text: fakeSubmitterEmail,
                    type: 'strong',
                },
                {
                    text: 'to',
                },
                {
                    text: 'review',
                    type: 'strong',
                },
                {
                    text: ' %expenses.',
                },
            ];

            const result = NextStepUtils.buildNextStep(report);

            expect(result).toStrictEqual(optimisticNextStep);
        });

        it('generates an optimistic nextStep once a report has been self approved', () => {
            report.statusNum = CONST.REPORT.STATUS.APPROVED;
            optimisticNextStep.title = 'Next Steps:';
            optimisticNextStep.message = [
                {
                    text: 'Waiting for',
                },
                {
                    text: fakeSelfSubmitterEmail,
                    type: 'strong',
                },
                {
                    text: 'to',
                },
                {
                    text: 'review',
                    type: 'strong',
                },
                {
                    text: ' %expenses.',
                },
            ];

            const result = NextStepUtils.buildNextStep(report);

            expect(result).toStrictEqual(optimisticNextStep);
        });

        it('generates an optimistic nextStep once a report has been paid with wallet', () => {
            report.statusNum = CONST.REPORT.STATUS.REIMBURSED;
            optimisticNextStep.title = 'Finished!';
            optimisticNextStep.message = [
                {
                    text: fakeSubmitterEmail,
                    type: 'strong',
                },
                {
                    text: 'have marked these expenses as',
                },
                {
                    text: 'paid',
                    type: 'strong',
                },
            ];

            const result = NextStepUtils.buildNextStep(report, true);

            expect(result).toStrictEqual(optimisticNextStep);
        });

        it('generates an optimistic nextStep once a report has been self paid with wallet', () => {
            report.statusNum = CONST.REPORT.STATUS.REIMBURSED;
            optimisticNextStep.title = 'Finished!';
            optimisticNextStep.message = [
                {
                    text: Str.recapitalize(fakeSelfSubmitterEmail),
                    type: 'strong',
                },
                {
                    text: 'have marked these expenses as',
                },
                {
                    text: 'paid',
                    type: 'strong',
                },
            ];

            const result = NextStepUtils.buildNextStep(report, true);

            expect(result).toStrictEqual(optimisticNextStep);
        });

        it('generates an optimistic nextStep once a report has been paid outside of Expensify', () => {
            report.statusNum = CONST.REPORT.STATUS.REIMBURSED;
            optimisticNextStep.title = 'Finished!';
            optimisticNextStep.message = [
                {
                    text: fakeSubmitterEmail,
                    type: 'strong',
                },
                {
                    text: 'have marked these expenses as',
                },
                {
                    text: 'paid',
                    type: 'strong',
                },
                {
                    text: 'outside of Expensify.',
                },
            ];

            const result = NextStepUtils.buildNextStep(report);

            expect(result).toStrictEqual(optimisticNextStep);
        });

        it('generates an optimistic nextStep once a report has been paid self outside of Expensify', () => {
            report.statusNum = CONST.REPORT.STATUS.REIMBURSED;
            optimisticNextStep.title = 'Finished!';
            optimisticNextStep.message = [
                {
                    text: Str.recapitalize(fakeSelfSubmitterEmail),
                    type: 'strong',
                },
                {
                    text: 'have marked these expenses as',
                },
                {
                    text: 'paid',
                    type: 'strong',
                },
                {
                    text: 'outside of Expensify.',
                },
            ];

            const result = NextStepUtils.buildNextStep(report);

            expect(result).toStrictEqual(optimisticNextStep);
        });
    });
});
