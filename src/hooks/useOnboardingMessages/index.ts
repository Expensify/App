import useLocalize from '@hooks/useLocalize';

import {getOnboardingMessages} from '@libs/actions/Welcome/OnboardingFlow';

import {useMemo} from 'react';

export default function useOnboardingMessages() {
    const {preferredLocale, isCurrentLocaleLoaded} = useLocalize();
    const translationLocale = isCurrentLocaleLoaded ? preferredLocale : undefined;
    const onboardingMessages = useMemo(() => getOnboardingMessages(translationLocale), [translationLocale]);
    return onboardingMessages;
}
