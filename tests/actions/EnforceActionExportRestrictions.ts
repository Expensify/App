import * as IOU from '@libs/actions/IOU';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as Policy from '@userActions/Policy/Policy';
import * as Task from '@userActions/Task';

// There are some methods that are OK to use inside an action file, but should not be exported. These are typically methods that look up and return Onyx data.
// The correct pattern to use is that every file will use it's own withOnyx or Onyx.connect() to access the Onyx data it needs. This prevents data from becoming stale
// and prevents side-effects that you may not be aware of. It also allows each file to access Onyx data in the most performant way. More context can be found in
// https://github.com/Expensify/App/issues/27262
describe('ReportUtils', () => {
    it('does not export getParentReport', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getParentReport).toBeUndefined();
    });

    it('does not export isOneTransactionReport', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.isOneTransactionReport).toBeUndefined();
    });

    it('does not export getPolicy', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getPolicy).toBeUndefined();
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
