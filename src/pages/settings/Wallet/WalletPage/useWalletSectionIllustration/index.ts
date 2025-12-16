import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import type UseWalletSectionIllustration from './types';

const useWalletSectionIllustration: UseWalletSectionIllustration = () => {
    const illustrations = useMemoizedLazyIllustrations(['BigVault']);
    const styles = useThemeStyles();

    return {
        illustration: illustrations.BigVault,
        illustrationStyle: styles.walletStaticIllustration,
    };
};

export default useWalletSectionIllustration;
