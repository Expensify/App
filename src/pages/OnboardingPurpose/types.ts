import type {OnyxEntry} from 'react-native-onyx';
import type {OnboardingPurposeType} from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type { StackScreenProps } from '@react-navigation/stack';
import type { OnboardingModalNavigatorParamList } from '@libs/Navigation/types';

type OnboardingPurposeProps = Record<string, unknown> & StackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.PURPOSE>;

type BaseOnboardingPurposeOnyxProps = {
    /** Saved onboarding purpose selected by the user */
    onboardingPurposeSelected: OnyxEntry<OnboardingPurposeType>;
};

type BaseOnboardingPurposeProps = OnboardingPurposeProps &
    BaseOnboardingPurposeOnyxProps & {
        /* Whether to use native styles tailored for native devices */
        shouldUseNativeStyles: boolean;

        /** Whether to use the maxHeight (true) or use the 100% of the height (false) */
        shouldEnableMaxHeight: boolean;
    };

export type {BaseOnboardingPurposeOnyxProps, BaseOnboardingPurposeProps, OnboardingPurposeProps};
