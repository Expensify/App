import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type UseGenericEmptyStateIllustration from './types';

const useGenericEmptyStateIllustration: UseGenericEmptyStateIllustration = () => {
    const illustrations = useMemoizedLazyIllustrations(['FolderWithPapersAndWatch'] as const);
    const styles = useThemeStyles();

    return {
        headerMediaType: CONST.EMPTY_STATE_MEDIA.ILLUSTRATION,
        headerMedia: illustrations.FolderWithPapersAndWatch,
        headerContentStyles: [styles.emptyStateFolderStaticIllustration],
    };
};

export default useGenericEmptyStateIllustration;
