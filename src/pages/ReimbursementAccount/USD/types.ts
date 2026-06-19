import type {ForwardedRef} from 'react';
import type {View} from 'react-native';
import type {Route} from '@src/ROUTES';

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

    /** Reference to the outer element (used by RequestorStep) */
    ref?: ForwardedRef<View>;

    /** Back to URL for preserving navigation context */
    backTo?: Route;
};

export default USDPageProps;
