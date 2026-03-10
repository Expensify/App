import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import type UseWorkspacesEmptyStateIllustration from './types';

const useWorkspacesEmptyStateIllustration: UseWorkspacesEmptyStateIllustration = () => {
    const illustrations = useMemoizedLazyIllustrations(['PlanetWithMobileApp'] as const);
    const styles = useThemeStyles();

    return {
        headerMedia: illustrations.PlanetWithMobileApp,
        headerContentStyles: styles.emptyWorkspaceListStaticIllustrationStyle,
    };
};

export default useWorkspacesEmptyStateIllustration;
