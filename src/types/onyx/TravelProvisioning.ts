import type {Route} from '@src/ROUTES';
import type {Errors} from './OnyxCommon';

/** Model of travel provisioning process information */
type TravelProvisioning = {
    /** Token for accessing Spotnana after successful provisioning */
    spotnanaToken?: string;

    /** Whether the account is set for testing Travel and should use the sandbox environment */
    isTestAccount?: boolean;

    /** Specific error thrown while provisioning travel */
    error?: string;

    /** Whether the user is waiting for the API response after accepting terms */
    isLoading?: boolean;

    /** Error messages that could be thrown when provisioning travel */
    errors?: Errors;

    /** Post-verification route that should be opened once the user validates their account */
    nextStepRoute?: Route | null;
};

export default TravelProvisioning;
