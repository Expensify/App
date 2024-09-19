import type {StackScreenProps} from '@react-navigation/stack';
import type {OnyxEntry} from 'react-native-onyx';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import type {OnboardingPurposeType} from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type OnboardingWorkProps = Record<string, unknown> & StackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.WORK>;

type BaseOnboardingWorkProps = OnboardingWorkProps & {
        /* Whether to use native styles tailored for native devices */
        shouldUseNativeStyles: boolean;
    };

export type {OnboardingWorkProps, BaseOnboardingWorkProps};
