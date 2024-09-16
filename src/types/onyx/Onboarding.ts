import type {ViewStyle} from 'react-native';
import type IconAsset from '@src/types/utils/IconAsset';

/** Model of onboarding */
type Onboarding = {
    /** ID of the report used to display the onboarding checklist message */
    chatReportID?: string;

    /** A Boolean that informs whether the user has completed the guided setup onboarding flow */
    hasCompletedGuidedSetupFlow: boolean;
};

/** Onboarding icon configurations */
type OnboardingIcon = {
    /** Source of the icon, can be a component or an image */
    icon: IconAsset;

    /** Size of the icon */
    iconSize?: number;

    /** Height of the icon */
    iconHeight?: number;

    /** Width of the icon */
    iconWidth?: number;

    /** Icon wrapper styles */
    iconStyles?: ViewStyle[];

    /** Fill color for the Icon */
    iconFill?: string;
};

export default Onboarding;
export type {OnboardingIcon};
