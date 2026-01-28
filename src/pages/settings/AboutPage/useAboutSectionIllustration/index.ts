import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import type UseAboutSectionIllustration from './types';

const useAboutSectionIllustration: UseAboutSectionIllustration = () => {
    const illustrations = useMemoizedLazyIllustrations(['TiltedCoinExpensify']);
    const styles = useThemeStyles();

    return {
        illustration: illustrations.TiltedCoinExpensify,
        illustrationStyle: styles.aboutStaticIllustration,
    };
};

export default useAboutSectionIllustration;
