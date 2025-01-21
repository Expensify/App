/** Model of travel provisioning process information */
type TravelProvisioning = {
    /** Token for accessing Spotnana after successful provisioning */
    spotnanaToken?: string;

    /** Error thrown while provisioning travel */
    error?: string;

    /** Whether the user is waiting for the API response after accepting terms */
    isLoading?: boolean;
};

export default TravelProvisioning;
