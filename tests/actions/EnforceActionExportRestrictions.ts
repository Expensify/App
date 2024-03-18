import * as ReportUtils from '@libs/ReportUtils';
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
});

describe('Task', () => {
    it('does not export getParentReport', () => {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(Task.getParentReport).toBeUndefined();
    });
});
