import {renderHook} from '@testing-library/react-native';

import useChartCursorStyle from '@components/Charts/hooks/useChartCursorStyle';

import {useDerivedValue} from 'react-native-reanimated';

describe('useChartCursorStyle', () => {
    it('returns a pointer cursor when isCursorOverClickable is true', () => {
        const {result} = renderHook(() => {
            const isCursorOverClickable = useDerivedValue(() => true);
            return useChartCursorStyle(isCursorOverClickable);
        });

        expect(result.current).toEqual({cursor: 'pointer'});
    });

    it('returns the default cursor when isCursorOverClickable is false', () => {
        const {result} = renderHook(() => {
            const isCursorOverClickable = useDerivedValue(() => false);
            return useChartCursorStyle(isCursorOverClickable);
        });

        expect(result.current).toEqual({cursor: 'auto'});
    });
});
