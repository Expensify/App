import {hasIntroSelectedSelector} from '@selectors/IntroSelected';
import {useMemo} from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getOnboardingMessages} from '@libs/actions/Welcome/OnboardingFlow';
import ONYXKEYS from '@src/ONYXKEYS';

export default function useOnboardingMessages() {
    const {preferredLocale} = useLocalize();
    const [hasIntroSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true, selector: hasIntroSelectedSelector});
    const onboardingMessages = useMemo(() => getOnboardingMessages(hasIntroSelected, preferredLocale), [hasIntroSelected, preferredLocale]);
    return onboardingMessages;
}
