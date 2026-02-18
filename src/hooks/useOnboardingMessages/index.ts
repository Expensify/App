import {useMemo} from 'react';
import useLocalize from '@hooks/useLocalize';
import {getOnboardingMessages} from '@libs/actions/Welcome/OnboardingFlow';

export default function useOnboardingMessages() {
    const {preferredLocale} = useLocalize();
    const onboardingMessages = useMemo(() => getOnboardingMessages(preferredLocale), [preferredLocale]);
    return onboardingMessages;
}
