import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import type UseTroubleshootSectionIllustration from './types';

const useTroubleshootSectionIllustration: UseTroubleshootSectionIllustration = () => {
    const illustrations = useMemoizedLazyIllustrations(['WorkspaceScene']);
    const styles = useThemeStyles();

    return {
        illustration: illustrations.WorkspaceScene,
        illustrationStyle: styles.troubleshootStaticIllustration,
    };
};

export default useTroubleshootSectionIllustration;
