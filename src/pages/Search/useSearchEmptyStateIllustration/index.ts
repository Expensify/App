import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type UseSearchEmptyStateIllustration from './types';

const useSearchEmptyStateIllustration: UseSearchEmptyStateIllustration = () => {
    const illustrations = useMemoizedLazyIllustrations(['Fireworks', 'FolderWithPapersAndWatch'] as const);
    const styles = useThemeStyles();

    return {
        fireworks: {
            headerMediaType: CONST.EMPTY_STATE_MEDIA.ILLUSTRATION,
            headerMedia: illustrations.Fireworks,
            headerContentStyles: [styles.emptyStateFireworksStaticIllustration],
        },
        folder: {
            headerMediaType: CONST.EMPTY_STATE_MEDIA.ILLUSTRATION,
            headerMedia: illustrations.FolderWithPapersAndWatch,
            headerContentStyles: [styles.emptyStateFolderStaticIllustration],
        },
    };
};

export default useSearchEmptyStateIllustration;
