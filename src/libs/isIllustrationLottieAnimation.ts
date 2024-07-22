import type DotLottieAnimation from '@components/LottieAnimations/types';
import type IconAsset from '@src/types/utils/IconAsset';

function isIllustrationLottieAnimation(illustration: DotLottieAnimation | IconAsset | undefined): illustration is DotLottieAnimation {
    if (typeof illustration === 'number' || !illustration) {
        return false;
    }

    return 'file' in illustration && 'w' in illustration && 'h' in illustration;
}

export default isIllustrationLottieAnimation;
