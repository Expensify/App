import LottieAnimations from '@components/LottieAnimations';
import useSectionIllustrationWithMotion from '@hooks/useSectionIllustrationWithMotion';
import useThemeStyles from '@hooks/useThemeStyles';
import type UseSaveTheWorldSectionIllustration from './types';

const useSaveTheWorldSectionIllustration: UseSaveTheWorldSectionIllustration = () => {
    const styles = useThemeStyles();
    return useSectionIllustrationWithMotion(LottieAnimations.SaveTheWorld, 'SaveTheWorldScale', styles.saveTheWorldStaticIllustration);
};

export default useSaveTheWorldSectionIllustration;
