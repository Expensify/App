import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import type UseSearchEmptyStateIllustration from './types';

const useSearchEmptyStateIllustration: UseSearchEmptyStateIllustration = () => {
    const illustrations = useMemoizedLazyIllustrations(['Fireworks', 'FolderWithPapersAndWatch'] as const);
    const styles = useThemeStyles();

    return {
        fireworks: {
            headerMedia: illustrations.Fireworks,
            headerContentStyles: [styles.emptyStateFireworksStaticIllustration],
        },
        folder: {
            headerMedia: illustrations.FolderWithPapersAndWatch,
            headerContentStyles: [styles.emptyStateFolderStaticIllustration],
        },
    };
};

export default useSearchEmptyStateIllustration;
