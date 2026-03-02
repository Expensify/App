import {useMemo} from 'react';
import {useStateLocalize} from '@hooks/useLocalize';
import {getOnboardingMessages} from '@libs/actions/Welcome/OnboardingFlow';

export default function useOnboardingMessages() {
    const {preferredLocale} = useStateLocalize();
    const onboardingMessages = useMemo(() => getOnboardingMessages(preferredLocale), [preferredLocale]);
    return onboardingMessages;
}
