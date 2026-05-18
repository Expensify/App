import LottieAnimations from '@components/LottieAnimations';
import useSectionIllustrationWithMotion from '@hooks/useSectionIllustrationWithMotion';
import useThemeStyles from '@hooks/useThemeStyles';
import type UseWalletSectionIllustration from './types';

const useWalletSectionIllustration: UseWalletSectionIllustration = () => {
    const styles = useThemeStyles();
    return useSectionIllustrationWithMotion(LottieAnimations.BankVault, 'BigVault', styles.walletStaticIllustration, styles.walletLottieIllustration);
};

export default useWalletSectionIllustration;
