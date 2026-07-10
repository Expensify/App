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

    /** Legal entity tax ID collected before terms acceptance on non-USD workspaces, carried into the AcceptSpotnanaTerms call */
    taxID?: string;

    /** Booking domain selected during the enable-travel flow when the admin belongs to multiple private domains */
    domain?: string;

    /**
     * Ordered list of step names the enablement stepper decided this workspace needs, frozen the first time the
     * flow is entered. Each step of the flow is a separate navigation push (a fresh mount of EnableTravelContent),
     * and completing a step (e.g. saving the legal name) flips the very Onyx flag that decided whether that step
     * was included — so this has to be persisted here rather than recomputed on every mount, or the total step
     * count would shrink out from under the user as they progress.
     */
    enabledSteps?: string[];
};

export default TravelProvisioning;
