// tests/hooks/useChildReport.test.ts
import {renderHook} from '@testing-library/react-hooks';
import Onyx from 'react-native-onyx';
import useChildReport from '@hooks/useChildReport';
import ONYXKEYS from '@src/ONYXKEYS';

describe('useChildReport', () => {
    beforeEach(() => {
        Onyx.clear();
    });

    it('returns undefined when reportAction is null', () => {
        const {result} = renderHook(() => useChildReport(null));
        expect(result.current).toBeUndefined();
    });

    it('returns undefined when childReportID is missing', () => {
        const {result} = renderHook(() => useChildReport({reportActionID: '123'}));
        expect(result.current).toBeUndefined();
    });

    it('returns the child report when childReportID exists', async () => {
        const childReport = {reportID: 'child123', reportName: 'Test'};
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}child123`, childReport);

        const {result} = renderHook(() => useChildReport({reportActionID: '123', childReportID: 'child123'}));

        expect(result.current).toEqual(childReport);
    });
});
