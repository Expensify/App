import LottieAnimations from '@components/LottieAnimations';
import useSectionIllustrationWithMotion from '@hooks/useSectionIllustrationWithMotion';
import useThemeStyles from '@hooks/useThemeStyles';
import type UseTroubleshootSectionIllustration from './types';

const useTroubleshootSectionIllustration: UseTroubleshootSectionIllustration = () => {
    const styles = useThemeStyles();
    return useSectionIllustrationWithMotion(LottieAnimations.Desk, 'WorkspaceScene', styles.troubleshootStaticIllustration);
};

export default useTroubleshootSectionIllustration;
