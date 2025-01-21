/** Model of travel provisioning process information */
type TravelProvisioning = {
    /** Token for accessing Spotnana after successful provisioning */
    spotnanaAuthToken?: string;

    /** Error thrown while provisioning travel */
    error?: string;
};

export default TravelProvisioning;
