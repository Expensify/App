import type {Route} from '@src/ROUTES';

import type {ForwardedRef} from 'react';
import type {View} from 'react-native';

type USDPageProps = {
    /** Handles submit button press */
    onSubmit: () => void;

    onBackButtonPress: () => void;
    policyID?: string;
    currentSubPage?: string;

    /** Array of step names for the progress indicator */
    stepNames?: readonly string[];

    /** Reference to the outer element (used by RequestorStep) */
    ref?: ForwardedRef<View>;

    /** Back to URL for preserving navigation context */
    backTo?: Route;
};

export default USDPageProps;
