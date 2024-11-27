import {useMemo} from 'react';
import type {EdgeInsets} from 'react-native-safe-area-context';
import useSafeAreaUtils from '@hooks/useSafeAreaUtils';
import defaultEdgeSpacing from './defaultEdgeSpacing';

function useEdgeSpacing(padding: Partial<EdgeInsets> = {}): EdgeInsets {
    const {insets} = useSafeAreaUtils();

    const spacing = useMemo<EdgeInsets>(() => ({...defaultEdgeSpacing, ...padding}), [padding]);

    return {
        top: Math.max(insets.top, spacing.top),
        left: Math.max(insets.left, spacing.left),
        bottom: Math.max(insets.bottom, spacing.bottom),
        right: Math.max(insets.right, spacing.right),
    };
}

export default useEdgeSpacing;
