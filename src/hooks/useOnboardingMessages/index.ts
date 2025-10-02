import {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getOnboardingMessages} from '@libs/actions/Welcome/OnboardingFlow';
import ONYXKEYS from '@src/ONYXKEYS';
import type IntroSelectedTask from '@src/types/onyx/IntroSelected';

const hasIntroSelectedSelector = (introSelected: OnyxEntry<IntroSelectedTask>) => !!introSelected?.choice;

export default function useOnboardingMessages() {
    const {preferredLocale} = useLocalize();
    const [hasIntroSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true, selector: hasIntroSelectedSelector});
    const onboardingMessages = useMemo(() => getOnboardingMessages(hasIntroSelected, preferredLocale), [hasIntroSelected, preferredLocale]);
    return onboardingMessages;
}
