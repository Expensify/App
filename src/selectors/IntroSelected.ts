import type {OnyxEntry} from 'react-native-onyx';
import type IntroSelected from '@src/types/onyx/IntroSelected';

function onboardingPolicyIDSelector(introSelected: OnyxEntry<IntroSelected>): string | undefined {
    return introSelected?.onboardingPolicyID;
}

// eslint-disable-next-line import/prefer-default-export -- additional selectors may be added here
export {onboardingPolicyIDSelector};
