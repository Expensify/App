import {useMemo} from 'react';
import useLocalize from '@hooks/useLocalize';
import {getOnboardingMessages} from '@libs/actions/Welcome/OnboardingFlow';

export default function useOnboardingMessages() {
    const {preferredLocale} = useLocalize();
    // Adding preferredLocale as dependency because getOnboardingMessages depends on the current locale
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    const onboardingMessages = useMemo(() => getOnboardingMessages(), [preferredLocale]);
    return onboardingMessages;
}
