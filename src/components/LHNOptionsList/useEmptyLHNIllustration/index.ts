import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import type UseEmptyLHNIllustration from './types';

const useEmptyLHNIllustration: UseEmptyLHNIllustration = () => {
    const illustrations = useMemoizedLazyIllustrations(['Fireworks'] as const);
    const styles = useThemeStyles();

    return {
        icon: illustrations.Fireworks,
        iconWidth: styles.emptyStateFireworksStaticIllustration.width,
        iconHeight: styles.emptyStateFireworksStaticIllustration.height,
    };
};

export default useEmptyLHNIllustration;
