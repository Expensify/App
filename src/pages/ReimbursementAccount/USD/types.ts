import type {ForwardedRef} from 'react';
import type {View} from 'react-native';

type USDPageProps = {
    /** Handles submit button press */
    onSubmit: () => void;

    /** Handles back button press */
    onBackButtonPress: () => void;

    /** ID of current policy */
    policyID?: string;

    /** Name of the current sub page */
    currentSubPage?: string;

    /** Array of step names for the progress indicator */
    stepNames?: readonly string[];

    /** If we should show Onfido flow (used by RequestorStep) */
    shouldShowOnfido?: boolean;

    /** Reference to the outer element (used by RequestorStep) */
    ref?: ForwardedRef<View>;
};

export default USDPageProps;
