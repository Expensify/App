import {useMemo} from 'react';
import useLocalize from '@hooks/useLocalize';
import getOnboardingMessages from '@libs/actions/Welcome/OnboardingFlowTasks';

export default function useOnboardingMessages() {
    const {translate} = useLocalize();
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    const onboardingMessages = useMemo(() => getOnboardingMessages(), [translate]);
    return onboardingMessages;
}
