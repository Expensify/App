import {renderHook} from '@testing-library/react-native';

import useParentReportAction from '@hooks/useParentReportAction';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

describe('useParentReportAction', () => {
    afterEach(async () => {
        await Onyx.clear();
    });

    it('returns undefined when report is undefined', async () => {
        const {result} = renderHook(() => useParentReportAction(undefined));
        await waitForBatchedUpdatesWithAct();

        expect(result.current).toBeUndefined();
    });
});
