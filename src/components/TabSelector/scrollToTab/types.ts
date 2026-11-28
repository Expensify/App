import type {HorizontalSafeAreaReach} from '@components/HorizontalSafeArea/useHorizontalSafeAreaReach';

import type {ComponentRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';

type ScrollToTabProps = {
    animated?: boolean;
    containerRef: React.RefObject<ComponentRef<typeof RNScrollView> | null>;
    containerX: number;
    containerWidth: number;
    tabX: number;
    tabWidth: number;

    /** How far the container reaches into the horizontal safe area on each side, where tabs aren't visible. None by default. */
    safeAreaReach?: HorizontalSafeAreaReach;
};

// eslint-disable-next-line import/prefer-default-export
export type {ScrollToTabProps};
