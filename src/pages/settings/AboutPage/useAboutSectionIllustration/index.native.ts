import LottieAnimations from '@components/LottieAnimations';
import useSectionIllustrationWithMotion from '@hooks/useSectionIllustrationWithMotion';
import useThemeStyles from '@hooks/useThemeStyles';
import type UseAboutSectionIllustration from './types';

const useAboutSectionIllustration: UseAboutSectionIllustration = () => {
    const styles = useThemeStyles();
    return useSectionIllustrationWithMotion(LottieAnimations.Coin, 'TiltedCoinExpensify', styles.aboutStaticIllustration);
};

export default useAboutSectionIllustration;
