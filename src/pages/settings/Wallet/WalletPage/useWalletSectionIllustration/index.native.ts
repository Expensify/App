import LottieAnimations from '@components/LottieAnimations';
import useThemeStyles from '@hooks/useThemeStyles';
import type UseWalletSectionIllustration from './types';

const useWalletSectionIllustration: UseWalletSectionIllustration = () => {
    const styles = useThemeStyles();

    return {
        illustration: LottieAnimations.BankVault,
        illustrationStyle: styles.walletLottieIllustration,
    };
};

export default useWalletSectionIllustration;
