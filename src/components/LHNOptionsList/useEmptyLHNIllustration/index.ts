import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import type UseEmptyLHNIllustration from './types';

const useEmptyLHNIllustration: UseEmptyLHNIllustration = () => {
    const illustrations = useMemoizedLazyIllustrations(['Fireworks'] as const);

    return {
        icon: illustrations.Fireworks,
        iconWidth: 164,
        iconHeight: 148,
    };
};

export default useEmptyLHNIllustration;
