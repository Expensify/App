import type {Errors} from './OnyxCommon';

/** Model of travel provisioning process information */
type TravelProvisioning = {
    /** Token for accessing Spotnana after successful provisioning */
    spotnanaToken?: string;

    /** Specific error thrown while provisioning travel */
    error?: string;

    /** Whether the user is waiting for the API response after accepting terms */
    isLoading?: boolean;

    /** Error messages that could be thrown when provisioning travel */
    errors?: Errors;
};

export default TravelProvisioning;
