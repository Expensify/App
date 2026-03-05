import LottieAnimations from '@components/LottieAnimations';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import Accessibility from '@libs/Accessibility';
import type UseTroubleshootSectionIllustration from './types';

const useTroubleshootSectionIllustration: UseTroubleshootSectionIllustration = () => {
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const illustrations = useMemoizedLazyIllustrations(['WorkspaceScene']);
    const styles = useThemeStyles();

    if (isReduceMotionEnabled) {
        return {
            illustration: illustrations.WorkspaceScene,
            illustrationStyle: styles.troubleshootStaticIllustration,
        };
    }

    return {
        illustration: LottieAnimations.Desk,
    };
};

export default useTroubleshootSectionIllustration;
