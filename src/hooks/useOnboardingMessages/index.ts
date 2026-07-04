import useLocalize from '@hooks/useLocalize';

import {getOnboardingMessages} from '@libs/actions/Welcome/OnboardingFlow';

import {useMemo} from 'react';

export default function useOnboardingMessages() {
    const {preferredLocale} = useLocalize();
    const onboardingMessages = useMemo(() => getOnboardingMessages(preferredLocale), [preferredLocale]);
    return onboardingMessages;
}
