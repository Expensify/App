import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import type UsePreferencesSectionIllustration from './types';

const usePreferencesSectionIllustration: UsePreferencesSectionIllustration = () => {
    const illustrations = useMemoizedLazyIllustrations(['DjBoothReferenceHands']);
    const styles = useThemeStyles();

    return {
        illustration: illustrations.DjBoothReferenceHands,
        illustrationStyle: styles.preferencesStaticIllustration,
    };
};

export default usePreferencesSectionIllustration;
