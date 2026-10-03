import useLocalize from '@hooks/useLocalize';

import {getOnboardingMessages} from '@libs/actions/Welcome/OnboardingFlow';

export default function useOnboardingMessages() {
    const {preferredLocale, isCurrentLocaleLoaded} = useLocalize();
    const translationLocale = isCurrentLocaleLoaded ? preferredLocale : undefined;
    return getOnboardingMessages(translationLocale);
}
