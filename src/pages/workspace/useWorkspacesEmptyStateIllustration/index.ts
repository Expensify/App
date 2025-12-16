import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type UseWorkspacesEmptyStateIllustration from './types';

const useWorkspacesEmptyStateIllustration: UseWorkspacesEmptyStateIllustration = () => {
    const illustrations = useMemoizedLazyIllustrations(['PlanetWithMobileApp'] as const);
    const styles = useThemeStyles();

    return {
        headerMediaType: CONST.EMPTY_STATE_MEDIA.ILLUSTRATION,
        headerMedia: illustrations.PlanetWithMobileApp,
        headerContentStyles: styles.emptyWorkspaceListStaticIllustrationStyle,
    };
};

export default useWorkspacesEmptyStateIllustration;
