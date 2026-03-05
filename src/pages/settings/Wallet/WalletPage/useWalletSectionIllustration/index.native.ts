import LottieAnimations from '@components/LottieAnimations';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import Accessibility from '@libs/Accessibility';
import type UseWalletSectionIllustration from './types';

const useWalletSectionIllustration: UseWalletSectionIllustration = () => {
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const illustrations = useMemoizedLazyIllustrations(['BigVault']);
    const styles = useThemeStyles();

    if (isReduceMotionEnabled) {
        return {
            illustration: illustrations.BigVault,
            illustrationStyle: styles.walletStaticIllustration,
        };
    }

    return {
        illustration: LottieAnimations.BankVault,
        illustrationStyle: styles.walletLottieIllustration,
    };
};

export default useWalletSectionIllustration;
