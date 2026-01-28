// this file is for testing which methods should not be exported so it is not possible to use named imports - that's why we need to disable the no-restricted-syntax rule
/* eslint-disable no-restricted-syntax */
import * as IOU from '@libs/actions/IOU';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as Policy from '@userActions/Policy/Policy';
import * as Task from '@userActions/Task';

// There are some methods that are OK to use inside an action file, but should not be exported. These are typically methods that look up and return Onyx data.
// The correct pattern to use is that every file will use it's own useOnyx to access the Onyx data it needs. This prevents data from becoming stale
// and prevents side-effects that you may not be aware of. It also allows each file to access Onyx data in the most performant way. More context can be found in
// https://github.com/Expensify/App/issues/27262
describe('ReportUtils', () => {
    it('does not export getReport', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getReport).toBeUndefined();
    });

    it('does not export isOneTransactionReportDeprecated', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.isOneTransactionReportDeprecated).toBeUndefined();
    });

    it('does not export getPolicy', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getPolicy).toBeUndefined();
    });

    it('does not export getIconsForChatThread', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getIconsForChatThread).toBeUndefined();
    });

    it('does not export getInvoiceReceiverIcons', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getInvoiceReceiverIcons).toBeUndefined();
    });

    it('does not export getParticipantIcon', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getParticipantIcon).toBeUndefined();
    });

    it('does not export getIconsForExpenseRequest', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getIconsForExpenseRequest).toBeUndefined();
    });

    it('does not export getIconsForTaskReport', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getIconsForTaskReport).toBeUndefined();
    });

    it('does not export getIconsForDomainRoom', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getIconsForDomainRoom).toBeUndefined();
    });

    it('does not export getIconsForPolicyRoom', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getIconsForPolicyRoom).toBeUndefined();
    });

    it('does not export getIconsForPolicyExpenseChat', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getIconsForPolicyExpenseChat).toBeUndefined();
    });

    it('does not export getIconsForExpenseReport', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getIconsForExpenseReport).toBeUndefined();
    });

    it('does not export getIconsForInvoiceReport', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getIconsForInvoiceReport).toBeUndefined();
    });

    it('does not export getIconsForIOUReport', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getIconsForIOUReport).toBeUndefined();
    });

    it('does not export getIconsForGroupChat', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getIconsForGroupChat).toBeUndefined();
    });

    it('does not export getIconsForUserCreatedPolicyRoom', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getIconsForUserCreatedPolicyRoom).toBeUndefined();
    });

    it('does not export getAllReportActions', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getAllReportActions).toBeUndefined();
    });
});

describe('Policy', () => {
    it('does not export getPolicy', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(Policy.getPolicy).toBeUndefined();
    });
});

describe('TransactionUtils', () => {
    it('does not export getTransaction', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(TransactionUtils.getTransaction).toBeUndefined();
    });
});

describe('IOU', () => {
    it('does not export getPolicy', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(IOU.getPolicy).toBeUndefined();
    });

    it('does not export getReport', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(IOU.getReportOrDraftReport).toBeUndefined();
    });
});

describe('Task', () => {
    it('does not export getParentReport', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(Task.getParentReport).toBeUndefined();
    });

    it('does not export getParentReportAction', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(Task.getParentReportAction).toBeUndefined();
    });
});

describe('OptionsListUtils', () => {
    it('does not export getReport', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(OptionsListUtils.getReportOrDraftReport).toBeUndefined();
    });
});
