import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import type UseGenericEmptyStateIllustration from './types';

const useGenericEmptyStateIllustration: UseGenericEmptyStateIllustration = () => {
    const illustrations = useMemoizedLazyIllustrations(['FolderWithPapersAndWatch']);
    const styles = useThemeStyles();

    return {
        headerMedia: illustrations.FolderWithPapersAndWatch,
        headerContentStyles: [styles.emptyStateFolderStaticIllustration],
    };
};

export default useGenericEmptyStateIllustration;
