import {renderHook} from '@testing-library/react-native';

import useGetIOUReportFromReportAction from '@hooks/useGetIOUReportFromReportAction';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

describe('useGetIOUReportFromReportAction', () => {
    afterEach(async () => {
        await Onyx.clear();
    });

    it('returns undefined reports when reportAction is undefined', async () => {
        const {result} = renderHook(() => useGetIOUReportFromReportAction(undefined));
        await waitForBatchedUpdatesWithAct();

        expect(result.current.iouReport).toBeUndefined();
        expect(result.current.chatReport).toBeUndefined();
        expect(result.current.isChatIOUReportArchived).toBe(false);
    });
});
